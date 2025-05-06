import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '../types/chat';
import { createApiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const useChat = (chatId: string | null) => {
  const { isAuthenticated, user } = useAuth();
  const userId = user?.id;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const apiClient = createApiClient();
  const socketRef = useRef<Socket | null>(null);

  // Загрузка истории сообщений
  useEffect(() => {
    if (!chatId) return;
    
    const loadMessages = async () => {
      try {
        const response = await apiClient.get(`/chat/messages/${chatId}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };
    
    loadMessages();
  }, [chatId]);

  const messageHandler = (newMessage: Message) => {
    console.log('New message received:', newMessage);
    
    setMessages(prev => {
      // Если это наше сообщение (по content и времени), заменяем его
      const existingIndex = prev.findIndex(m => 
        m.content === newMessage.content && 
        Math.abs(new Date(m.createdAt).getTime() - new Date(newMessage.createdAt).getTime()) < 1000
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newMessage;
        return updated;
      }
      
      return [...prev, newMessage];
    });
  };

  // WebSocket соединение
  useEffect(() => {
    if (!chatId) return;

    const token = localStorage.getItem('accessToken') || 
                  sessionStorage.getItem('accessToken');
    
    if (!token) {
      console.error('No access token found');
      return;
    }

    console.log('Initializing WebSocket connection...');

    const newSocket = io(`${process.env.REACT_APP_API_URL || 'http://localhost:4132/api'}/chat`, {
      auth: { token },
      query: { chatId },
      transports: ['websocket'],
    });

    // const messageHandler = (newMessage: Message) => {
    //   console.log('New message received:', newMessage);
    //   setMessages(prev => [...prev, newMessage]);
    // };

    newSocket
      .on('connect', () => {
        console.log('WebSocket connected, joining chat:', chatId);
        setIsConnected(true);
        newSocket.emit('join_chat', chatId);
      })
      .on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        setIsConnected(false);
      })
      .on('connect_error', (err) => {
        console.error('WebSocket connection error:', err.message);
      })
      .on('chat:message', messageHandler);

    socketRef.current = newSocket;

    return () => {
      console.log('Cleaning up WebSocket connection');
      newSocket.off('chat:message', messageHandler);
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [chatId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!socketRef.current?.connected || !chatId || !userId) {
      console.error('Socket not connected or chatId missing');
      return;
    }

    const tempId = `temp_${Date.now()}`;

    // Оптимистичное обновление
    const tempMessage: Message = {
      id: tempId,
      content,
      createdAt: new Date().toISOString(),
      account: {
        id: userId,
        firstName: user?.firstName || 'You',
        lastName: user?.lastName || '',
        avatarUrl: user?.avatarUrl || ''
      }
    };

    console.log(userId)

    setMessages(prev => [...prev, tempMessage]);
    
    try {
      console.log('Sending message to chat:', chatId);
      socketRef.current.emit('send_message', {chatId, content, tempId})
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }
  }, [chatId, userId, user]);

  return { messages, sendMessage, isConnected };
};