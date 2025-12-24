import React from 'react';
import { FiEdit } from 'react-icons/fi';
import './ProfileHeader.scss';
import { ProfileViewData } from '../../../api/profile';
import { useAuth } from '../../../context/AuthContext';

interface ProfileHeaderProps {
  userData: ProfileViewData;
  onEditClick: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userData, onEditClick }) => {
  const { user: authUser } = useAuth();
  return (
    <div className="profile-header">
      <div className="avatar-wrapper">
        {authUser?.avatarUrl ? (
          <img 
            src={userData.avatar} 
            alt="User avatar"
            className="user-avatar"
          />
        ) : (
          <div className="avatar-placeholder">
            {authUser?.firstName[0]} {authUser?.lastName[0]}
          </div>
        )}
      </div>
      <div className="user-info">
        <h1 className="user-name">{userData.name}</h1>
        <p className="user-login">@{userData.login}</p>
        <p className="user-email">{userData.email}</p>
      </div>
      <button className="edit-button" onClick={onEditClick}>
        <FiEdit size={24} />
      </button>
    </div>
  );
};

export default ProfileHeader;