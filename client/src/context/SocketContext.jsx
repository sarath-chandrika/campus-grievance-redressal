import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log(`[Socket.io] Connected with id: ${newSocket.id}`);
      // Join corresponding role / user room
      newSocket.emit('join-room', {
        role: user.role,
        userId: user._id,
      });
    });

    // Admin listener: New complaint created
    newSocket.on('new-complaint', (complaint) => {
      if (user.role === 'admin') {
        addToast({
          type: 'new-complaint',
          title: '🚨 New Grievance Lodged',
          message: `[${complaint.priority}] ${complaint.title} by ${complaint.studentId?.name || 'Student'}`,
          priority: complaint.priority,
          link: `/admin/complaints/${complaint._id}`,
        });
      }
    });

    // Student listener: Status update on their complaint
    newSocket.on('status-updated', (complaint) => {
      if (user.role === 'student') {
        addToast({
          type: 'status-updated',
          title: '📢 Status Update Received',
          message: `Your grievance "${complaint.title}" is now marked as "${complaint.status}".`,
          link: `/student/complaints/${complaint._id}`,
        });
      }
    });

    // Admin listener: SLA breach alert
    newSocket.on('sla-breach', (complaint) => {
      if (user.role === 'admin') {
        addToast({
          type: 'sla-breach',
          title: '⚠️ SLA Breach Alert!',
          message: `Grievance #${complaint._id.toString().slice(-6).toUpperCase()} (${complaint.priority}) exceeded resolution deadline!`,
          link: `/admin/complaints/${complaint._id}`,
        });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?._id, user?.role]);

  return (
    <SocketContext.Provider value={{ socket, toasts, removeToast }}>
      {children}

      {/* Real-time Toast Overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start gap-3 transition-all duration-300 animate-slide-in ${
              toast.type === 'sla-breach'
                ? 'bg-rose-950 text-white border-rose-700'
                : toast.type === 'new-complaint'
                ? 'bg-slate-900 text-white border-slate-700'
                : 'bg-blue-950 text-white border-blue-700'
            }`}
          >
            <div className="text-xl">
              {toast.type === 'sla-breach' ? '⚠️' : toast.type === 'new-complaint' ? '📥' : '🔔'}
            </div>
            <div className="flex-1 text-sm">
              <p className="font-bold text-white">{toast.title}</p>
              <p className="text-slate-300 mt-0.5 text-xs leading-relaxed">{toast.message}</p>
              {toast.link && (
                <a
                  href={toast.link}
                  className="inline-block mt-2 text-xs font-semibold underline text-blue-400 hover:text-blue-300"
                >
                  View Grievance →
                </a>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white text-base leading-none"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
