import { useCallback, useEffect, useRef, useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { UserSelector } from './UserSelector';
import { createApiClient } from '../../api/client';
import './Messages.css';
import { Message, User, Chat } from '../../types/chat';
import { useAuth } from '../../context/AuthContext';
import { FaArrowLeft } from 'react-icons/fa';

export const Messages = () => {
  const { user: authUser } = useAuth();
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const apiClient = createApiClient();
  const { messages, sendMessage, isConnected } = useChat(currentChat);
  const [currentRecipient, setCurrentRecipient] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  const loadUserChats = useCallback(async () => {
    try {
      const response = await apiClient.get('/chat/my');
      console.log(response.data)
      setUserChats(response.data);
    } catch (error) {
      console.error('Failed to load user chats:', error);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    loadUserChats();
  }, []);

  const handleStartChat = async (userId: string) => {
    setLoadingChat(true);
    try {
      const res = await apiClient.post(`/chat/private/${userId}`);
      if (res.data.chatId) {
        setCurrentChat(res.data.chatId);
        const userRes = await apiClient.get(`/users/${userId}`);
        setCurrentRecipient({
          id: userRes.data.primarykey,
          login: userRes.data.login,
          firstName: userRes.data.firstName,
          lastName: userRes.data.lastName,
          avatarUrl: userRes.data.avatarUrl,
          email: userRes.data.email
        });
        
        await loadUserChats();
      } else {
        throw new Error('Chat ID not received');
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
      alert('Не удалось начать чат. Пожалуйста, попробуйте позже.');
    } finally {
      setLoadingChat(false);
    }
  };
  
  const handleSelectChat = (chatId: string) => {
    setCurrentChat(chatId);
    const recipient = userChats.find((i) => i.primarykey === chatId)?.members.find((i) => i.accountRef.id !== authUser?.id);
    setCurrentRecipient({
      id: recipient?.accountRef.id || '',
      login: recipient?.accountRef.login,
      firstName: recipient?.accountRef.firstName || '',
      lastName: recipient?.accountRef.lastName || '',
      avatarUrl: recipient?.accountRef.avatarUrl,
      email: recipient?.accountRef.email
    })
  };

  const handleSend = async () => {
    if (!message.trim() || !isConnected) return;
    
    try {
      await sendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleBackClick = () => {
    setCurrentChat(null);
    setCurrentRecipient(null);
  };

  if (!currentChat) {
    return (
      <UserSelector 
        onSelect={handleStartChat} 
        userChats={userChats} 
        onSelectChat={handleSelectChat} 
      />
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
      <button 
        onClick={handleBackClick}
        className="back-button"
        title="Вернуться к списку чатов"
      >
        <FaArrowLeft />
      </button>
      <div className="recipient-info">
        <div className="recipient-avatar">
          {currentRecipient?.avatarUrl ? (
            <img
              src={currentRecipient?.avatarUrl || '/default-avatar.png'}
              alt={currentRecipient?.firstName}
              className="recipient-avatar"
            />
          ) : (
            <div className="avatar-placeholder">
              {currentRecipient?.firstName[0]} {currentRecipient?.lastName[0]}
            </div>
          )}
        </div>
        <div className="recipient-name">
          {currentRecipient?.firstName} {currentRecipient?.lastName}
        </div>
        </div>
        <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Online' : 'Offline'}
        </span>
      </div>
      
      <div className="messages-list">
        {messages
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          .map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.account.id === authUser?.id ? 'my-message' : 'other-message'}`}>
              {msg.account.id !== authUser?.id && (
                <img
                  src={msg.account.avatarUrl || '/default-avatar.png'} 
                  alt={msg.account.firstName}
                  className="message-avatar"
                />
              )}
              <div className="message-content-wrapper">
                {msg.account.id !== authUser?.id && (
                  <div className="message-author">{msg.account.firstName}</div>
                )}
                <div className="message-content">{msg.content}</div>
                <div className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
      </div>
      
      <div className="message-input-container">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Введите сообщение"
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend} 
          disabled={!message.trim() || !isConnected}
          className={!message.trim() || !isConnected ? 'disabled' : ''}
        >
          {isConnected ? 'Отправить' : 'Подключение...'}
        </button>
      </div>
    </div>
  );
};