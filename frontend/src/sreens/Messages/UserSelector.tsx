import { useState } from 'react';
import { createApiClient } from '../../api/client';
import { User, Chat } from '../../types/chat';
import './UserSelector.css';
import { useAuth } from '../../context/AuthContext';

export const UserSelector = ({ 
  onSelect, 
  userChats,
  onSelectChat 
}: { 
  onSelect: (userId: string) => void;
  userChats: Chat[];
  onSelectChat: (chatId: string) => void;
}) => {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'search'>('chats');
  const apiClient = createApiClient();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.get(`/users/search?query=${encodeURIComponent(searchQuery)}`);
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to search users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-selector">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'chats' ? 'active' : ''}`}
          onClick={() => setActiveTab('chats')}
        >
          Мои чаты
        </button>
        <button 
          className={`tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Новый чат
        </button>
      </div>
      
      {activeTab === 'chats' ? (
        <div className="chats-list">
          {userChats.length > 0 ? (
            userChats.map(chat => {
              const otherUser = chat.members.find(member => member.accountRef.id !== authUser?.id)?.accountRef;
              const lastMessage = chat.messages?.[chat.messages.length - 1];
              
              return (
                <div 
                  key={chat.primarykey} 
                  className="chat-card"
                  onClick={() => onSelectChat(chat.primarykey)}
                >
                  <div className="user-avatar">
                    {otherUser?.avatarUrl ? (
                      <img
                        src={otherUser.avatarUrl} 
                        alt={`${otherUser.firstName} ${otherUser.lastName}`}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {otherUser?.firstName?.[0]}{otherUser?.lastName?.[0]}
                      </div>
                    )}
                  </div>
                  
                  <div className="chat-content">
                    <div className="chat-header">
                      <span className="chat-name">
                        {otherUser?.firstName} {otherUser?.lastName}
                      </span>
                      {lastMessage && (
                        <span className="chat-time">
                          {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    
                    {lastMessage && (
                      <div className="last-message">
                        <p>{lastMessage.content}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-results">У вас пока нет чатов</div>
          )}
        </div>
      ) : (
      <>
        <div className="search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Введите логин, email или имя"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={!searchQuery.trim() || loading}>
          {loading ? 'Ищем...' : 'Найти'}
        </button>
      </div>

      <div className="users-list">
        {users.length > 0 ? (
          users.map(user => (
            <div key={user.id} className="user-card" onClick={() => onSelect(user.id)}>
              <div className="user-avatar">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
                ) : (
                  <div className="avatar-placeholder">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                )}
              </div>
              <div className="user-info">
                <div className="user-login">@{user.login}</div>
                <div className="user-name">{user.firstName} {user.lastName}</div>
              </div>
            </div>
          ))
        ) : (
          !loading && <div className="no-results">Ничего не найдено</div>
        )}
      </div>
      </>
      )}
    </div>
  );
};