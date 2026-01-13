import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchOpenGigs, logout } from '../store';
import { Search, Plus } from 'lucide-react';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { gigs, loading, error } = useAppSelector((state) => state.gigs);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  useEffect(() => {
    dispatch(fetchOpenGigs(searchQuery));
  }, [dispatch, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchOpenGigs(searchQuery));
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">GigWork</h1>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/create-gig"
                  className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium"
                >
                  Create Gig
                </Link>
                <Link
                  to="/dashboard"
                  className="text-white hover:underline font-medium"
                >
                  {user?.fullName || 'Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:underline font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gigs..."
              className="block w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none"
            />
          </div>
        </form>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">
                Open Gigs ({gigs.length})
              </h2>
            </div>

            {gigs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg p-8">
                <p className="text-gray-600 mb-4">No gigs found.</p>
                {isAuthenticated && (
                  <Link
                    to="/create-gig"
                    className="inline-block bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                  >
                    Create First Gig
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gigs.map((gig) => (
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
                      <span className="text-gray-500 text-sm">
                        {new Date(gig.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
