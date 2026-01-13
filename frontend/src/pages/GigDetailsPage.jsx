import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchBidsForGig, submitBid, hireBid, clearBidsError } from '../store';
import { ArrowLeft } from 'lucide-react';

export default function GigDetailsPage() {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { gigs } = useAppSelector((state) => state.gigs);
  const { bids, loading, submitting, hiring } = useAppSelector(
    (state) => state.bids
  );
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [showBidForm, setShowBidForm] = useState(false);

  const gig = gigs.find((g) => g._id === gigId);
  const gigBids = bids[gigId] || [];

  useEffect(() => {
    if (gigId) {
      dispatch(fetchBidsForGig(gigId));
      dispatch(clearBidsError());
    }
  }, [dispatch, gigId]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!gig && gigs.length > 0) {
      navigate('/');
    }
  }, [gig, gigs, navigate, isAuthenticated]);

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    dispatch(clearBidsError());

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0 || !message.trim()) {
      return;
    }

    const result = await dispatch(
      submitBid({ price: priceNum, message, gigId })
    );

    if (submitBid.fulfilled.match(result)) {
      setPrice('');
      setMessage('');
      setShowBidForm(false);
    }
  };

  const handleHireBid = async (bidId) => {
    if (window.confirm('Hire this freelancer?')) {
      const result = await dispatch(hireBid(bidId));
      if (hireBid.fulfilled.match(result)) {
        dispatch(fetchBidsForGig(gigId));
      }
    }
  };

  if (!gig) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Gig not found</p>
          <Link
            to="/"
            className="text-white hover:underline font-medium"
          >
            Go back
          </Link>
        </div>
      </div>
    );
  }

  const isGigOwner = gig.ownerId && user && gig.ownerId._id === user._id;
  const hasBid = gigBids.some(
    (bid) => bid.freelancerId?._id === user?._id
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white hover:text-gray-300 mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-2xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-black mb-4">{gig.title}</h1>
          <div className="flex items-center gap-4 text-gray-600 text-sm mb-6">
            <span className="font-medium">${gig.budget}</span>
            <span>{new Date(gig.createdAt).toLocaleDateString()}</span>
            <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium">
              {gig.status}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-black mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{gig.description}</p>
          </div>

          {gig.ownerId && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Posted by: {gig.ownerId.name || gig.ownerId.email}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black">
              Bids ({gigBids.length})
            </h2>
            {isAuthenticated && !isGigOwner && gig.status === 'open' && (
              <button
                onClick={() => setShowBidForm(!showBidForm)}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                disabled={hasBid}
              >
                {hasBid ? 'Already Bid' : showBidForm ? 'Cancel' : 'Place Bid'}
              </button>
            )}
          </div>

          {showBidForm && isAuthenticated && !isGigOwner && gig.status === 'open' && (
            <form onSubmit={handleSubmitBid} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="bid-price"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Your Price ($)
                  </label>
                  <input
                    id="bid-price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label
                    htmlFor="bid-message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="bid-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                    required
                    disabled={submitting}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <p className="text-gray-600 text-center py-8">Loading bids...</p>
          ) : gigBids.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No bids yet.</p>
          ) : (
            <div className="space-y-4">
              {gigBids.map((bid) => (
                <div
                  key={bid._id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {bid.freelancerId && (
                          <span className="font-medium text-black">
                            {bid.freelancerId.fullName || bid.freelancerId.email}
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            bid.status === 'hired'
                              ? 'bg-green-100 text-green-700'
                              : bid.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {bid.status}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                        {bid.message}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-medium">${bid.price}</span>
                        <span>{new Date(bid.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {isGigOwner && gig.status === 'open' && bid.status === 'pending' && (
                      <button
                        onClick={() => handleHireBid(bid._id)}
                        disabled={hiring}
                        className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {hiring ? 'Hiring...' : 'Hire'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
