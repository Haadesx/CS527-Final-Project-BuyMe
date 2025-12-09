import React from 'react';
import { Link } from 'react-router-dom';
import { Fade } from 'react-awesome-reveal';

const AuctionCard = ({ item }) => {
  return (
    <Fade triggerOnce>
      <div className="card">
        <div className="card-image">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.auction_title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ fontSize: '4rem', opacity: '0.2' }}>📦</div>
          )}

          <div className="badge badge-primary"
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white', border: 'none' }}>
            Ends {new Date(item.end_date || item.end_time).toLocaleDateString()}
          </div>
        </div>

        <div className="card-content">
          <div className="card-meta">
            <span className="badge badge-primary">Item #{item.auction_id?.toString().slice(-4)}</span>
            <span>{item.bid_count || 0} Bids</span>
          </div>

          <h3 className="card-title truncate">{item.auction_title}</h3>
          <p style={{ marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, lineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '3em' }}>
            {item.item_description}
          </p>

          <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="card-price-label">Current Bid</div>
              <div className="card-price">${item.current_price ? item.current_price.toLocaleString() : item.starting_price?.toLocaleString()}</div>
            </div>
            <Link to={`/auction/${item.auction_id}`} className="btn btn-primary">Bid Now</Link>
          </div>
        </div>
      </div>
    </Fade>
  );
};

export default AuctionCard;
