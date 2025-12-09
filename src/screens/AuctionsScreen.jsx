import React, { useState } from 'react';
import { useGetAuctionsQuery } from '../slices/auctionApiSlice';
import AuctionCard from '../components/AuctionCard';
import Loader from '../components/Loader';
import { Fade } from 'react-awesome-reveal';

const AuctionsScreen = () => {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');

  // Debounce keyword search if needed, or just pass directly
  const { data, isLoading, error } = useGetAuctionsQuery({
    keyword,
    category: category !== 'All' ? category : undefined,
    min_price: minPrice || undefined,
    max_price: maxPrice || undefined,
    sort
  });

  const auctions = data?.data || [];

  return (
    <div className="min-h-screen w-full bg-transparent pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <Fade triggerOnce direction="up">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 uppercase tracking-widest">The Catalogue</h1>
            <p className="text-gray-300/60 font-light italic">Curated lots for the discerning collector.</p>
          </div>
        </Fade>

        {/* Filters */}
        <Fade triggerOnce direction="up" delay={200}>
          <div className="bg-gray-900 p-6 border border-gray-700/20 shadow-lg mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

              {/* Keyword */}
              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-blue-400/80 mb-2">Search</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-700/30 text-white py-2 focus:outline-none focus:border-gray-700 transition-colors font-serif"
                  placeholder="Keywords..."
                />
              </div>

              {/* Category */}
              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-blue-400/80 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-700/30 text-white py-2 focus:outline-none focus:border-gray-700 transition-colors font-serif"
                >
                  <option value="All">All Categories</option>
                  <option value="Luxury Vehicles">Luxury Vehicles</option>
                  <option value="Fine Art">Fine Art</option>
                  <option value="Jewelry & Watches">Jewelry & Watches</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Collectibles">Collectibles</option>
                </select>
              </div>

              {/* Min Price */}
              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-blue-400/80 mb-2">Min Price</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-700/30 text-white py-2 focus:outline-none focus:border-gray-700 transition-colors font-serif"
                  placeholder="$0"
                />
              </div>

              {/* Max Price */}
              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-blue-400/80 mb-2">Max Price</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-700/30 text-white py-2 focus:outline-none focus:border-gray-700 transition-colors font-serif"
                  placeholder="No Limit"
                />
              </div>

              {/* Sort */}
              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-blue-400/80 mb-2">Sort By</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-700/30 text-white py-2 focus:outline-none focus:border-gray-700 transition-colors font-serif"
                >
                  <option value="">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="date_asc">Ending Soonest</option>
                  <option value="date_desc">Ending Latest</option>
                </select>
              </div>

            </div>
          </div>
        </Fade>

        {/* Results */}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <div className="text-center text-red-500 py-10">
            {error?.data?.message || 'Error fetching catalogue.'}
          </div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-20 border border-gray-700/10 bg-gray-900">
            <p className="text-gray-300 font-light italic">No lots found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {auctions.map((auction, index) => (
              <Fade key={auction._id} triggerOnce direction="up" delay={index * 50}>
                <AuctionCard item={auction} />
              </Fade>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionsScreen;