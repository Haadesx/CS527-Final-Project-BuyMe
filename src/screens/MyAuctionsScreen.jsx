import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useDeleteAuctionMutation, useGetMyAuctionsQuery } from '../slices/auctionApiSlice';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { Fade } from 'react-awesome-reveal';

const MyAuctionsScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: myAuctions = [], isLoading, error, refetch } = useGetMyAuctionsQuery(userInfo?._id);
  const [deleteAuction] = useDeleteAuctionMutation();

  const handleDeleteAuction = async (id) => {
    if (window.confirm('Are you sure you want to withdraw this lot?')) {
      try {
        await deleteAuction(id).unwrap();
        toast.success('Lot withdrawn successfully.', { className: '!bg-cream-50 !text-emerald-900 !font-serif !border !border-gold-400' });
        refetch();
      } catch (err) {
        toast.error('Failed to withdraw lot.', { className: '!bg-cream-50 !text-emerald-900 !font-serif !border !border-gold-400' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <Fade triggerOnce direction="up">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-gold-400/30 pb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-emerald-900 mb-2 uppercase tracking-widest">My Collection</h1>
              <p className="text-charcoal-900/60 font-light italic">Manage your commissioned auctions.</p>
            </div>
            <Link
              to="/create-auction"
              className="mt-4 md:mt-0 px-8 py-3 bg-emerald-900 text-gold-400 font-serif tracking-widest hover:bg-emerald-800 transition-all shadow-lg"
            >
              COMMISSION NEW LOT
            </Link>
          </div>
        </Fade>

        {isLoading ? (
          <Loader />
        ) : error ? (
          <div className="text-center text-red-500">Error loading your collection.</div>
        ) : myAuctions?.data?.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gold-400/20">
            <p className="text-charcoal-900 font-light italic">You have not commissioned any auctions yet.</p>
          </div>
        ) : (
          <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {myAuctions?.data?.map((auction, index) => (
              <Fade key={auction.auction_id} triggerOnce direction="up" delay={index * 100}>
                <div className="group bg-white border border-gold-400/10 hover:border-gold-400 transition-all duration-500 shadow-sm hover:shadow-2xl overflow-hidden relative">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={auction.image_url || 'https://placehold.co/300x200'}
                      alt={auction.auction_title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute top-0 right-0 bg-gold-400 text-emerald-900 px-3 py-1 text-xs font-bold uppercase tracking-widest">
                      {auction.status || 'Active'}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-serif font-bold text-emerald-900 mb-2 truncate">{auction.auction_title}</h3>
                    <p className="text-sm text-charcoal-900/60 line-clamp-2 font-light mb-6">{auction.auction_desc}</p>

                    <div className="flex justify-between items-center border-t border-gold-400/20 pt-4">
                      <Link
                        to={`/auction/${auction.auction_id}`} // Assuming view detail
                        className="text-xs uppercase tracking-widest text-emerald-900 hover:text-gold-400 transition-colors font-bold"
                      >
                        View Details
                      </Link>
                      <div className="flex space-x-2">
                        {/* Edit functionality can be added later if needed */}
                        <button
                          onClick={() => handleDeleteAuction(auction.auction_id)}
                          className="text-xs uppercase tracking-widest text-red-900/60 hover:text-red-600 transition-colors"
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAuctionsScreen;
