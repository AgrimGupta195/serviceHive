import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { checkAuth } from '../store';

export default function ProtectedRoute({ children }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, checkAuthLoading } = useAppSelector(
    (state) => state.auth
  );
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && !checkAuthLoading) {
      dispatch(checkAuth());
    }
  }, [dispatch, isAuthenticated, checkAuthLoading]);

  if (checkAuthLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
