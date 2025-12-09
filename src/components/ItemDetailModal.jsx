import { useGetItemByIdQuery } from '../slices/itemApiSlice';
import { useGetBidsByItemQuery, usePlaceBidMutation } from '../slices/bidApiSlice';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from './Loader';
import { useState } from 'react';
import { Zoom } from 'react-awesome-reveal';

const ItemDetailModal = ({ itemId, auctionId, onClose }) => {
  const { userInfo } = useSelector((state) => state.auth);

  const { data: itemData, isLoading: isItemLoading } = useGetItemByIdQuery(itemId);
  const item = itemData?.data;

  const { data: bidsData, isLoading: isBidsLoading, refetch: refetchBids } = useGetBidsByItemQuery(itemId);
  const bids = bidsData || [];

  const [placeBid, { isLoading: isBidLoading }] = usePlaceBidMutation();

  const [bidAmount, setBidAmount] = useState('');
  const [upperLimit, setUpperLimit] = useState('');

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    try {
      await placeBid({
        itemId,
        bidData: {
          amount: Number(bidAmount),
          upper_limit: upperLimit ? Number(upperLimit) : null
        }
      }).unwrap();

      toast.success('Bid placed successfully.');
      setBidAmount('');
      setUpperLimit('');
      refetchBids();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to place bid.');
    }
  };

  if (isItemLoading) return <Loader />;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Zoom triggerOnce duration={300}>
        <div className="bg-surface w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border border-border-color flex flex-col md:flex-row relative">

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-secondary hover:text-primary z-50 text-2xl"
          >
            &times;
          </button>

          {/* Left: Image */}
          <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-bg-body">
            <img
              src={item?.image_url || 'https://placehold.co/600x600'}
              alt={item?.item_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 p-4 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
              <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Current Price</p>
              <p className="text-3xl font-bold text-white tracking-tight">${item?.current_price?.toLocaleString() || item?.start_price?.toLocaleString()}</p>
            </div>
          </div>

          {/* Right: Details & Bidding */}
          <div className="w-full md:w-1/2 p-8 flex flex-col bg-surface pt-12 relative">
            <div className="pr-8">
              <h2 className="text-3xl font-bold text-white mb-2 leading-tight tracking-tight">{item?.item_name}</h2>
            </div>
            <p className="text-gray-300 font-light mb-8 leading-relaxed flex-grow text-base border-l-2 border-primary/30 pl-4">
              {item?.item_desc}
            </p>

            {/* Bidding Form */}
            <div className="bg-white/5 p-6 rounded-xl mb-6 backdrop-blur-sm border border-white/5">
              <div className="flex justify-between items-center mb-6 pb-2 border-b border-white/10">
                <p className="text-lg font-bold text-white">Place Your Bid</p>
                <span className="text-xs uppercase tracking-widest text-primary font-semibold">Live Auction</span>
              </div>

              <form onSubmit={handlePlaceBid} className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2 font-semibold">Bid Amount ($)</label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white p-4 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-xl font-medium placeholder-gray-600"
                    placeholder={`Min: $${(item?.current_price || item?.start_price) + 1}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2 font-semibold">
                    Auto-Bid Limit <span className="text-primary/70 ml-1">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    value={upperLimit}
                    onChange={(e) => setUpperLimit(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white p-4 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-xl font-medium placeholder-gray-600"
                    placeholder="Set your max limit"
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-primary"></span>
                    We will automatically bid for you up to this amount.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isBidLoading}
                  className="w-full btn btn-primary py-4 text-sm tracking-[0.2em] font-bold uppercase hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-primary/20"
                >
                  {isBidLoading ? 'PROCESSING...' : 'CONFIRM BID'}
                </button>
              </form>
            </div>

            {/* Bid History */}
            <div>
              <p className="text-xs font-bold text-text-secondary mb-3 uppercase tracking-widest">Recent Activity</p> {/* Changed h3 to p */}
              <div className="max-h-32 overflow-y-auto border-t border-border-color">
                {bids.length === 0 ? (
                  <p className="text-xs text-text-tertiary py-3 italic">No bids yet. Be the first.</p>
                ) : (
                  <table className="w-full text-sm text-left">
                    <tbody>
                      {bids.map((bid) => (
                        <tr key={bid._id} className="border-b border-border-color/50">
                          <td className="py-2 text-text-secondary">{bid.user_id?.username || 'Anonymous'}</td>
                          <td className="py-2 text-right font-bold text-primary">${bid.amount.toLocaleString()}</td>
                          <td className="py-2 text-right text-xs text-text-tertiary">{new Date(bid.timestamp).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>
        </div>
      </Zoom>
    </div>
  );
};

export default ItemDetailModal;
