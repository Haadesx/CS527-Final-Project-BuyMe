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

      toast.success('Bid placed successfully.', { className: '!bg-cream-50 !text-emerald-900 !font-serif !border !border-gold-400' });
      setBidAmount('');
      setUpperLimit('');
      refetchBids();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to place bid.', { className: '!bg-cream-50 !text-emerald-900 !font-serif !border !border-gold-400' });
    }
  };

  if (isItemLoading) return <Loader />;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Zoom triggerOnce duration={500}>
        <div className="bg-cream-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-none shadow-2xl border border-gold-400 flex flex-col md:flex-row relative">

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-900 hover:text-gold-400 z-10 text-2xl font-serif"
          >
            &times;
          </button>

          {/* Left: Image */}
          <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-emerald-900/5">
            <img
              src={item?.image_url || 'https://placehold.co/600x600'}
              alt={item?.item_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-emerald-900/90 to-transparent text-cream-50">
              <p className="font-serif italic text-gold-400">Current Price</p>
              <p className="text-3xl font-bold font-serif">${item?.current_price?.toLocaleString() || item?.start_price?.toLocaleString()}</p>
            </div>
          </div>

          {/* Right: Details & Bidding */}
          <div className="w-full md:w-1/2 p-8 flex flex-col">
            <h2 className="text-3xl font-serif font-bold text-emerald-900 mb-4">{item?.item_name}</h2>
            <p className="text-charcoal-900/70 font-light mb-6 leading-relaxed flex-grow">
              {item?.item_desc}
            </p>

            {/* Bidding Form */}
            <div className="bg-white p-6 border border-gold-400/20 shadow-inner mb-6">
              <h3 className="text-lg font-serif text-emerald-900 mb-4 border-b border-gold-400/20 pb-2">Place Your Bid</h3>
              <form onSubmit={handlePlaceBid} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-charcoal-900/60 mb-1">Bid Amount ($)</label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full bg-cream-50 border-b border-gold-400 text-emerald-900 p-2 focus:outline-none font-serif text-lg"
                    placeholder={`Min: $${(item?.current_price || item?.start_price) + 1}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-charcoal-900/60 mb-1">
                    Auto-Bid Limit <span className="text-gold-400">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    value={upperLimit}
                    onChange={(e) => setUpperLimit(e.target.value)}
                    className="w-full bg-cream-50 border-b border-gold-400 text-emerald-900 p-2 focus:outline-none font-serif text-lg"
                    placeholder="Set your max limit"
                  />
                  <p className="text-[10px] text-charcoal-900/50 mt-1">
                    We will automatically bid for you up to this amount.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isBidLoading}
                  className="w-full bg-emerald-900 text-gold-400 py-3 font-serif tracking-widest hover:bg-emerald-800 transition-colors disabled:opacity-50"
                >
                  {isBidLoading ? 'PROCESSING...' : 'CONFIRM BID'}
                </button>
              </form>
            </div>

            {/* Bid History */}
            <div>
              <h3 className="text-sm font-serif text-emerald-900 mb-2 uppercase tracking-widest">Recent Activity</h3>
              <div className="max-h-32 overflow-y-auto border-t border-gold-400/20">
                {bids.length === 0 ? (
                  <p className="text-xs text-charcoal-900/50 py-2 italic">No bids yet. Be the first.</p>
                ) : (
                  <table className="w-full text-sm text-left">
                    <tbody>
                      {bids.map((bid) => (
                        <tr key={bid._id} className="border-b border-gold-400/10">
                          <td className="py-2 text-charcoal-900">{bid.user_id?.username || 'Anonymous'}</td>
                          <td className="py-2 text-right font-bold text-emerald-900">${bid.amount.toLocaleString()}</td>
                          <td className="py-2 text-right text-xs text-charcoal-900/50">{new Date(bid.timestamp).toLocaleTimeString()}</td>
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
