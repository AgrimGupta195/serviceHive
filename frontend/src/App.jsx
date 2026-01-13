import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { checkAuth } from './store';
import { initSocket, disconnectSocket } from './utils/socket';
import { addNotification } from './store';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationToast from './components/NotificationToast';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CreateGigPage from './pages/CreateGigPage';
import GigDetailsPage from './pages/GigDetailsPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, checkAuthLoading, user } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Setup socket connection when authenticated
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      const socket = initSocket(user._id);

      if (!socket) {
        return;
      }

      // Function to handle hired event
      const handleHired = (data) => {
        console.log('Hired event received:', data);
        dispatch(
          addNotification({
            _id: Date.now().toString(),
            type: 'hired',
            message: `Congratulations! You've been hired for: ${data.gig?.title || 'a gig'}`,
            gig: data.gig,
            bid: data.bid,
            read: false,
            createdAt: new Date().toISOString(),
          })
        );
      };

      // Set up listener - wait for connection if needed
      if (socket.connected) {
        socket.on('hired', handleHired);
      } else {
        socket.once('connect', () => {
          console.log('Socket connected, setting up hired listener');
          socket.on('hired', handleHired);
        });
      }

      // Also set up listener immediately in case socket is already connected
      socket.on('hired', handleHired);

      return () => {
        console.log('Cleaning up socket listeners');
        socket.off('hired', handleHired);
        if (!isAuthenticated) {
          disconnectSocket();
        }
      };
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, user?._id, dispatch]);

  if (checkAuthLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <NotificationToast />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <SignupPage />
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-gig"
          element={
            <ProtectedRoute>
              <CreateGigPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gig/:gigId"
          element={<ProtectedRoute><GigDetailsPage /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;