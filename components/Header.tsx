
import React, { useState, useEffect } from 'react';
import { getNotifications, markAllAsRead } from '../utils/notifications';
import NotificationPanel from './NotificationPanel';
import { User, Notification } from '../types';

interface HeaderProps {
  onLogout?: () => void;
}

const SUBMISSION_STORAGE_KEY = 'kimberry-refund-submissions';
const MBL_PENDING_STORAGE_KEY = 'kimberry-mbl-payment-data';

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const [userRole, setUserRole] = useState<'Admin' | 'Document' | 'Customer' | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [persistentBadgeCount, setPersistentBadgeCount] = useState(0);

  useEffect(() => {
    try {
      const userEmailRaw = localStorage.getItem('user');
      const allUsersRaw = localStorage.getItem('users');
      if (userEmailRaw && allUsersRaw) {
        const loggedInUser = JSON.parse(userEmailRaw);
        if (loggedInUser && typeof loggedInUser.email === 'string') {
          const parsedUsers = JSON.parse(allUsersRaw);
          if (Array.isArray(parsedUsers)) {
            const allUsers: User[] = parsedUsers;
            const currentUser = allUsers.find(u => u.email === loggedInUser.email);
            if (currentUser) {
              setUserRole(currentUser.role);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to parse user data in Header:", error);
    }

    const updatePersistentBadgeCount = () => {
      try {
        const submissionsRaw = localStorage.getItem(SUBMISSION_STORAGE_KEY);
        const mblPendingRaw = localStorage.getItem(MBL_PENDING_STORAGE_KEY);
        const submissionsCount = submissionsRaw ? JSON.parse(submissionsRaw).length : 0;
        const mblPendingCount = mblPendingRaw ? JSON.parse(mblPendingRaw).length : 0;
        setPersistentBadgeCount(submissionsCount + mblPendingCount);
      } catch (error) {
        setPersistentBadgeCount(0);
      }
    };

    const updateNotifications = () => {
      setNotifications(getNotifications());
    };

    updateNotifications();
    updatePersistentBadgeCount();

    window.addEventListener('notifications_updated', updateNotifications);
    window.addEventListener('pending_lists_updated', updatePersistentBadgeCount);
    
    return () => {
      window.removeEventListener('notifications_updated', updateNotifications);
      window.removeEventListener('pending_lists_updated', updatePersistentBadgeCount);
    };
  }, []);

  const isAdmin = userRole === 'Admin';
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleBellClick = () => {
    if (!isPanelOpen && unreadCount > 0) {
      markAllAsRead();
    }
    setIsPanelOpen(prev => !prev);
  };
  
  return (
    <div className="flex items-center justify-between w-full md:w-auto gap-6">
        {/* LOGO AREA */}
        <div className="flex items-center gap-4">
             {/* Replaced SVG with Image from URL */}
             <div className="relative w-16 h-16 flex items-center justify-center">
                <img 
                    src="https://i.ibb.co/Lm6Bcb2/kim.png" 
                    alt="Kimberry Logo" 
                    className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                />
             </div>

             <div className="flex flex-col">
                 {/* Modern Text Effect */}
                 <h1 className="text-3xl font-black tracking-widest uppercase font-sans">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-blue-200 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                        KIMBERRY
                    </span>
                 </h1>
                 <p className="text-[10px] text-blue-300 tracking-[0.3em] uppercase font-bold ml-1 drop-shadow-sm">
                    Merchant Line
                 </p>
             </div>
        </div>

        {/* USER CONTROLS */}
         <div className="hidden md:flex items-center gap-4">
             {isAdmin && (
              <div className="relative">
                <button
                  onClick={handleBellClick}
                  className="relative p-2 text-white/80 hover:text-white transition-colors hover:bg-white/10 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {persistentBadgeCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-black animate-pulse">
                      {persistentBadgeCount}
                    </span>
                  )}
                </button>
                {isPanelOpen && <NotificationPanel notifications={notifications} onClose={() => setIsPanelOpen(false)} />}
              </div>
            )}
            
            {onLogout && (
              <button
                onClick={onLogout}
                className="group relative px-4 py-1.5 rounded-full overflow-hidden bg-white/10 text-white text-sm transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] border border-white/20"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                <span className="relative font-medium">Sign out</span>
              </button>
            )}
         </div>
         
         <style>{`
            @keyframes shimmer {
                100% { transform: translateX(100%); }
            }
            .group-hover\\:animate-shimmer {
                animation: shimmer 1.5s infinite;
            }
         `}</style>
    </div>
  );
};

export default Header;
