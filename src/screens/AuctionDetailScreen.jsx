import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGetAuctionByIdQuery, useGetAuctionItemsQuery, useParticipateInAuctionMutation } from '../slices/auctionApiSlice';
import { useCreateItemMutation, useAddItemToAuctionMutation } from '../slices/itemApiSlice';
import CreateItemModal from '../components/CreateItemModal';
import ItemDetailModal from '../components/ItemDetailModal';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Fade } from 'react-awesome-reveal';

const AuctionDetailScreen = () => {
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.auth);

  const { data, isLoading: auctionLoading, error: auctionError } = useGetAuctionByIdQuery(id);
  const auction = data?.data || {};
  const { data: itemsData, isLoading: itemsLoading, error: itemsError } = useGetAuctionItemsQuery(id);

  const [participateInAuction] = useParticipateInAuctionMutation();
  const [createItem] = useCreateItemMutation();
  const [addItemToAuction] = useAddItemToAuctionMutation();

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [fullItems, setFullItems] = useState([]);

  const auctionItems = itemsData?.data || [];

  useEffect(() => {
    const fetchFullItems = async () => {
      try {
        const results = await Promise.all(
          auctionItems.map((a) =>
            axios.get(`/api/item/${a.item_id}`, {
              headers: { Authorization: `Bearer ${userInfo.data}` }
            })
          )
        );
        setFullItems(results.map(result => result.data.data));
      } catch (err) {
        console.error('Failed to fetch item details', err);
      }
    };

    if (auctionItems?.length > 0 && userInfo) {
      fetchFullItems();
    }
  }, [auctionItems, userInfo]);

  // Filter logic (if needed, currently just matching IDs)
  let items = [];
  fullItems.forEach((item) => {
    auctionItems.forEach((a) => {
      if (a.item_id === item.item_id) {
        items.push(item);
      }
    });
  });

  const handleParticipate = async () => {
    try {
      await participateInAuction(auction.auction_id).unwrap();
      toast.success('You have been approved to bid.', { className: '!bg-cream-50 !text-emerald-900 !font-serif !border !border-gold-400' });
    } catch (err) {
      toast.error(err?.data?.message || 'Participation failed.', { className: '!bg-cream-50 !text-emerald-900 !font-serif !border !border-gold-400' });
    }
  };

  const handleAddItem = async (itemData) => {
    try {
      const newItem = await createItem(itemData).unwrap();
      await addItemToAuction({ auctionId: id, itemId: newItem.data.id });
      window.location.reload();
    } catch (error) {
      console.log('Failed to add an item: ', error)
    }
  };

  if (auctionLoading || itemsLoading) return <Loader />;
  if (auctionError || itemsError) return <div className="text-center text-red-500 p-6">Error loading collection.</div>;

  return (
    <div className="min-h-screen bg-cream-50 pt-24 pb-12 px-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-16 text-center">
        <Fade triggerOnce direction="up">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-emerald-900 mb-6 uppercase tracking-widest">
            {auction?.auction_title}
          </h1>
          <div className="w-24 h-1 bg-gold-400 mx-auto mb-8" />
          <p className="text-xl text-charcoal-900/80 font-light max-w-3xl mx-auto leading-relaxed">
            {auction?.auction_desc}
          </p>

          <div className="mt-8 flex justify-center gap-8 text-sm uppercase tracking-widest text-emerald-900/60">
            <div>
              <span className="block text-gold-400 font-bold">Opens</span>
              {auction?.start_date ? new Date(auction.start_date).toLocaleDateString() : 'TBA'}
            </div>
            <div>
              <span className="block text-gold-400 font-bold">Closes</span>
              {auction?.end_date ? new Date(auction.end_date).toLocaleDateString() : 'TBA'}
            </div>
          </div>

          <div className="mt-12 flex justify-center gap-4">
            <button
              onClick={handleParticipate}
              className="px-8 py-3 bg-emerald-900 text-gold-400 font-serif tracking-widest hover:bg-emerald-800 transition-all shadow-lg border border-gold-400/20"
            >
              REGISTER TO BID
            </button>
            <Link
              to="/qna"
              className="px-8 py-3 bg-transparent border border-emerald-900 text-emerald-900 font-serif tracking-widest hover:bg-emerald-900 hover:text-gold-400 transition-all"
            >
              CONCIERGE (Q&A)
            </Link>
          </div>
        </Fade>
      </div>

      {/* Items Grid */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-serif text-emerald-900 mb-8 border-b border-gold-400/30 pb-4">
          Lot Catalogue <span className="text-gold-400 ml-2 text-lg align-top">{items.length} Items</span>
        </h2>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gold-400/20">
            <p className="text-charcoal-900 font-light italic">This collection is currently empty.</p>
          </div>
        ) : (
          <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <Fade key={item.item_id} triggerOnce direction="up" delay={index * 100}>
                <div
                  className="group bg-white border border-gold-400/10 hover:border-gold-400 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl overflow-hidden"
                  onClick={() => {
                    setSelectedItemId(item.item_id);
                    setShowItemModal(true);
                  }}
                >
                  <div className="relative h-80 overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-900/0 group-hover:bg-emerald-900/10 transition-colors duration-500 z-10" />
                    <img
                      src={item.image_url || 'https://placehold.co/300x200'}
                      alt={item.item_name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent z-20">
                      <p className="text-gold-400 font-serif text-lg italic">Starting at ${item.start_price?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="p-6 text-center">
                    <h3 className="text-xl font-serif font-bold text-emerald-900 mb-2 group-hover:text-gold-500 transition-colors">
                      {item.item_name}
                    </h3>
                    <p className="text-sm text-charcoal-900/60 line-clamp-2 font-light mb-4">
                      {item.item_desc}
                    </p>
                    <span className="inline-block px-6 py-2 border border-emerald-900 text-emerald-900 text-xs uppercase tracking-widest group-hover:bg-emerald-900 group-hover:text-gold-400 transition-all duration-300">
                      View Lot Details
                    </span>
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateItemModal
          auctionId={id}
          onClose={() => setShowCreateModal(false)}
          onItemCreated={handleAddItem}
        />
      )}

      {showItemModal && selectedItemId && (
        <ItemDetailModal
          auctionId={auction.auction_id}
          itemId={selectedItemId}
          onClose={() => setShowItemModal(false)}
          source="auctions"
        />
      )}

    </div>
  );
};

export default AuctionDetailScreen;
