import React, { useState } from 'react';
import ProfileHeader from './ProfileHeader/ProfileHeader';
import TasksSection from './TasksSection/TasksSection';
import CalendarSection from './CalendarSection/CalendarSection';
import TimeDataSection from './TimeDataSection/TimeDataSection';
import EditProfileModal from './EditProfileModal/EditProfileModal';
import './Profile.scss';

const Profile: React.FC = () => {
    const [userData, setUserData] = useState({
        name: 'Никита Вершинин',
        login: '@nikita_official',
        email: 'nikita@mail.ru',
        avatar: 'https://source.unsplash.com/random/400x400/?person'
    });
    const [showEditModal, setShowEditModal] = useState(false);

    const handleSaveProfile = (newData: any, oldPassword?: string, newPassword?: string) => {
        setUserData(newData);
    };

    return (
        <div className="page-container">
            <ProfileHeader 
                userData={userData} 
                onEditClick={() => setShowEditModal(true)}
            />
            
            <div className="scroll-container">
                <div className="profile-container">
                    <div className="tasks-wrapper">
                        <div className="tasks-header">
                            <h2>Текущие задачи</h2>
                            <TimeDataSection />
                        </div>
                        <TasksSection />
                    </div>

                    <div className="calendar-wrapper">
                        <CalendarSection />
                    </div>
                </div>
            </div>

            {showEditModal && (
                <EditProfileModal
                    userData={userData}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleSaveProfile}
                />
            )}
        </div>
    );
};

export default Profile;