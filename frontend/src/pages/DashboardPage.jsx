import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchOpenGigs, logout } from '../store';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { gigs, loading } = useAppSelector((state) => state.gigs);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(fetchOpenGigs());
  }, [dispatch, isAuthenticated, navigate]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  const myGigs = gigs.filter(
    (gig) => gig.ownerId && gig.ownerId._id === user._id
  );
  const openGigs = myGigs.filter((gig) => gig.status === 'open');
  const assignedGigs = myGigs.filter((gig) => gig.status === 'assigned');

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="text-3xl font-bold text-white">
            GigWork
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/create-gig"
              className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium"
            >
              Create Gig
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-2xl p-8 mb-8">
          <h1 className="text-2xl font-bold text-black mb-1">{user.fullName}</h1>
          <p className="text-gray-600">{user.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Gigs</h3>
            <p className="text-3xl font-bold text-black">{myGigs.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Open</h3>
            <p className="text-3xl font-bold text-black">{openGigs.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Assigned</h3>
            <p className="text-3xl font-bold text-black">{assignedGigs.length}</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">My Gigs</h2>
            <Link
              to="/create-gig"
              className="text-white hover:underline font-medium"
            >
              Create New
            </Link>
          </div>

          {loading ? (
            <p className="text-gray-400 text-center py-8">Loading...</p>
          ) : myGigs.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <p className="text-gray-600 mb-4">No gigs yet.</p>
              <Link
                to="/create-gig"
                className="inline-block bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                Create Your First Gig
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myGigs.map((gig) => (
                <Link
                  key={gig._id}
                  to={`/gig/${gig._id}`}
                  className="bg-white rounded-lg p-6 hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold text-black mb-2">
                    {gig.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {gig.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-black font-medium">${gig.budget}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        gig.status === 'assigned'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {gig.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
