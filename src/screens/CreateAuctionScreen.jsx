import React, { useState } from 'react';
import { useCreateAuctionMutation } from '../slices/auctionApiSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { Fade } from 'react-awesome-reveal';

const CreateAuctionScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Luxury Vehicles');
  const [startingPrice, setStartingPrice] = useState('');
  const [reservePrice, setReservePrice] = useState('');
  const [increment, setIncrement] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [createAuction, { isLoading }] = useCreateAuctionMutation();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await createAuction({
        auction_title: title,
        description,
        category,
        starting_price: Number(startingPrice),
        min_price: reservePrice ? Number(reservePrice) : 0,
        increment: increment ? Number(increment) : 1,
        start_time: startTime,
        end_time: endTime,
        image_url: imageUrl
      }).unwrap();

      toast.success('Auction commissioned successfully.', { className: '!bg-cream-50 !text-emerald-900 !font-serif !border !border-gold-400' });
      navigate(`/auction/${res.data.auction_id}`); // Using correct response ID field nested in data
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create auction.', { className: '!bg-cream-50 !text-emerald-900 !font-serif !border !border-gold-400' });
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 py-20 px-4">
      <Fade triggerOnce direction="up">
        <div className="max-w-3xl mx-auto bg-white p-10 border border-gold-400/20 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-900 via-gold-400 to-emerald-900"></div>

          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-emerald-900 mb-2 uppercase tracking-widest">Commission An Auction</h1>
            <p className="text-charcoal-900/60 font-light italic">Submit your item for review by The Vault.</p>
          </div>

          <form onSubmit={submitHandler} className="space-y-8">

            {/* Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-gold-400/80 mb-2">Lot Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-gold-400/30 text-emerald-900 py-2 focus:outline-none focus:border-gold-400 transition-colors font-serif text-lg"
                  placeholder="e.g. 1967 Shelby GT500"
                />
              </div>

              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-gold-400/80 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-transparent border-b border-gold-400/30 text-emerald-900 py-2 focus:outline-none focus:border-gold-400 transition-colors font-serif text-lg"
                >
                  <option value="Luxury Vehicles">Luxury Vehicles</option>
                  <option value="Fine Art">Fine Art</option>
                  <option value="Jewelry & Watches">Jewelry & Watches</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Collectibles">Collectibles</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="group">
              <label className="block text-xs uppercase tracking-widest text-gold-400/80 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows="4"
                className="w-full bg-transparent border-b border-gold-400/30 text-charcoal-900 py-2 focus:outline-none focus:border-gold-400 transition-colors font-light resize-none"
                placeholder="Provide a detailed provenance and description..."
              />
            </div>

            {/* Image URL */}
            <div className="group">
              <label className="block text-xs uppercase tracking-widest text-gold-400/80 mb-2">Image URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-transparent border-b border-gold-400/30 text-charcoal-900 py-2 focus:outline-none focus:border-gold-400 transition-colors font-light"
                placeholder="https://..."
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-gold-400/80 mb-2">Starting Price ($)</label>
                <input
                  type="number"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-gold-400/30 text-emerald-900 py-2 focus:outline-none focus:border-gold-400 transition-colors font-serif text-lg"
                />
              </div>

              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-gold-400/80 mb-2">Reserve Price (Secret)</label>
                <input
                  type="number"
                  value={reservePrice}
                  onChange={(e) => setReservePrice(e.target.value)}
                  className="w-full bg-transparent border-b border-gold-400/30 text-emerald-900 py-2 focus:outline-none focus:border-gold-400 transition-colors font-serif text-lg"
                  placeholder="Optional"
                />
              </div>

              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-gold-400/80 mb-2">Min Increment ($)</label>
                <input
                  type="number"
                  value={increment}
                  onChange={(e) => setIncrement(e.target.value)}
                  className="w-full bg-transparent border-b border-gold-400/30 text-emerald-900 py-2 focus:outline-none focus:border-gold-400 transition-colors font-serif text-lg"
                  placeholder="Default: 1"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-gold-400/80 mb-2">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-gold-400/30 text-charcoal-900 py-2 focus:outline-none focus:border-gold-400 transition-colors font-light"
                />
              </div>

              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-gold-400/80 mb-2">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-gold-400/30 text-charcoal-900 py-2 focus:outline-none focus:border-gold-400 transition-colors font-light"
                />
              </div>
            </div>

            <div className="pt-8 text-center">
              <button
                type="submit"
                disabled={isLoading}
                className="px-12 py-4 bg-emerald-900 text-gold-400 font-serif font-bold tracking-widest hover:bg-emerald-800 transition-all shadow-lg disabled:opacity-50"
              >
                {isLoading ? 'COMMISSIONING...' : 'COMMISSION AUCTION'}
              </button>
            </div>

          </form>
        </div>
      </Fade>
    </div>
  );
};

export default CreateAuctionScreen;
