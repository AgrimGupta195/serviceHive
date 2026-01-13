import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { markAsRead, removeNotification } from '../store';
import { X } from 'lucide-react';

export default function NotificationToast() {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.notifications);
  const unreadNotifications = notifications.filter((n) => !n.read);

  useEffect(() => {
    // Auto-hide notifications after 5 seconds
    unreadNotifications.forEach((notification) => {
      const timer = setTimeout(() => {
        dispatch(markAsRead(notification._id));
      }, 5000);

      return () => clearTimeout(timer);
    });
  }, [unreadNotifications, dispatch]);

  if (unreadNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {unreadNotifications.slice(0, 3).map((notification) => (
        <div
          key={notification._id}
          className="bg-white rounded-lg shadow-lg p-4 max-w-md border border-gray-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-black">
                {notification.message}
              </p>
              {notification.gig && (
                <p className="text-xs text-gray-600 mt-1">
                  Gig: {notification.gig.title}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                dispatch(markAsRead(notification._id));
                dispatch(removeNotification(notification._id));
              }}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
