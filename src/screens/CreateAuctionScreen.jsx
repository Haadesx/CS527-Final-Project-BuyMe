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

      toast.success('Auction commissioned successfully.');
      navigate(`/auction/${res.data.auction_id}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create auction.');
    }
  };

  return (
    <div className="min-h-screen py-24 px-4">
      <Fade triggerOnce direction="up">
        <div className="max-w-4xl mx-auto bg-surface p-10 rounded-2xl shadow-2xl border border-white/5 relative overflow-hidden">
          {/* Subtle gradient accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-3">Commission An Auction</h1>
            <p className="text-text-secondary font-light">Submit your item for review by The Vault.</p>
          </div>

          <form onSubmit={submitHandler} className="space-y-8">

            {/* Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2 font-semibold">Lot Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/10 text-white p-4 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-lg font-medium placeholder-gray-600"
                  placeholder="e.g. 1967 Shelby GT500"
                />
              </div>

              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2 font-semibold">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white p-4 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-lg font-medium appearance-none"
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
              <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2 font-semibold">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows="5"
                className="w-full bg-black/40 border border-white/10 text-white p-4 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-light resize-none placeholder-gray-600 leading-relaxed"
                placeholder="Provide a detailed provenance and description..."
              />
            </div>

            {/* Image URL */}
            <div className="group">
              <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2 font-semibold">Image URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-white p-4 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-light placeholder-gray-600"
                placeholder="https://..."
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2 font-semibold">Starting Price ($)</label>
                <input
                  type="number"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/10 text-white p-4 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-lg font-medium"
                />
              </div>

              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2 font-semibold">Reserve Price</label>
                <input
                  type="number"
                  value={reservePrice}
                  onChange={(e) => setReservePrice(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white p-4 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-lg font-medium placeholder-gray-600"
                  placeholder="Optional"
                />
              </div>

              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2 font-semibold">Min Increment ($)</label>
                <input
                  type="number"
                  value={increment}
                  onChange={(e) => setIncrement(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white p-4 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-lg font-medium placeholder-gray-600"
                  placeholder="Default: 1"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2 font-semibold">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/10 text-white p-4 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm"
                />
              </div>

              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2 font-semibold">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/10 text-white p-4 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm"
                />
              </div>
            </div>

            <div className="pt-8 text-center">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto px-12 py-4 btn btn-primary font-bold tracking-widest uppercase hover:scale-105 transition-transform shadow-lg shadow-primary/20"
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
