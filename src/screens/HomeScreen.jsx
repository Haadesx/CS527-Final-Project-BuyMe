import React from 'react'
import Hero from '../components/Hero'
import AuctionCard from '../components/AuctionCard'
import { useGetAuctionsQuery } from '../slices/auctionApiSlice'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const HomeScreen = () => {
  const { data, isLoading, error } = useGetAuctionsQuery({});
  const auctions = data?.data || [];
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <>
      <Hero />

      <div className="container mb-8">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ marginBottom: '0.5rem' }}>Active Auctions</h2>
            <p>Explore what's trending right now</p>
          </div>
          {userInfo && (
            <Link to="/create-auction" className="btn btn-secondary">
              + List New Item
            </Link>
          )}
        </div>

        <div className="grid-cols-3">
          {isLoading ? (
            <div className="text-center" style={{ gridColumn: '1/-1', padding: '2rem' }}>Loading active auctions...</div>
          ) : error ? (
            <div className="text-center" style={{ gridColumn: '1/-1', padding: '2rem', color: 'var(--error)' }}>
              {error?.data?.message || 'Error loading auctions'}
            </div>
          ) : auctions.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '6rem 2rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: '0.5' }}>🔍</div>
              <h3 style={{ marginBottom: '0.5rem' }}>No active auctions found</h3>
              <p style={{ marginBottom: '2rem' }}>Be the first to list an extraordinary item!</p>
              {userInfo ? (
                <Link to="/create-auction" className="btn btn-primary">Start Selling</Link>
              ) : (
                <Link to="/login" className="btn btn-primary">Login to Sell</Link>
              )}
            </div>
          ) : (
            auctions.map((auction) => (
              <AuctionCard key={auction._id || auction.auction_id} item={auction} />
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default HomeScreen
