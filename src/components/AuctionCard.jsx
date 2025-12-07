import React from 'react';
import { Link } from 'react-router-dom';
import { Fade } from 'react-awesome-reveal';

const AuctionCard = ({ item }) => {
  // Admin functionality is currently disabled as handlers are not passed from parent
  // const { userInfo } = useSelector((state) => state.auth);

  return (
    <Fade triggerOnce>
      <div className="group relative bg-cream-50 border border-gold-400/20 hover:border-gold-400 transition-all duration-500 ease-out shadow-sm hover:shadow-2xl overflow-hidden">
        <Link to={`/auction/${item.auction_id}`} className="block relative h-64 overflow-hidden">
          <div className="absolute inset-0 bg-emerald-900/0 group-hover:bg-emerald-900/10 transition-colors duration-500 z-10" />
          <img
            src={item.image_url || 'https://placehold.co/300x200'}
            alt={item.auction_title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute top-4 right-4 bg-cream-50/90 backdrop-blur-sm px-3 py-1 border border-gold-400/30 z-20">
            <span className="text-xs font-serif uppercase tracking-widest text-emerald-900">{item.category}</span>
          </div>
        </Link>

        <div className="p-6 text-center">
          <h3 className="text-xl font-serif font-bold text-emerald-900 mb-2 truncate group-hover:text-gold-500 transition-colors">
            {item.auction_title}
          </h3>

          <div className="w-12 h-px bg-gold-400/50 mx-auto my-4" />

          <div className="flex justify-center items-baseline space-x-2">
            <span className="text-xs text-charcoal-900 uppercase tracking-widest">Current Bid</span>
            <span className="text-lg font-bold text-gold-500 font-serif">
              ${item.current_price ? item.current_price.toLocaleString() : '0'}
            </span>
          </div>

          <Link
            to={`/auction/${item.auction_id}`}
            className="inline-block mt-6 px-6 py-2 border border-emerald-900 text-emerald-900 text-xs uppercase tracking-widest hover:bg-emerald-900 hover:text-gold-400 transition-all duration-300"
          >
            View Lot
          </Link>
        </div>
      </div>
    </Fade>
  );
};

export default AuctionCard;
