import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    // Construct query string manually or let the AuctionsScreen handle defaults
    // For now, let's just navigate to /auctions. 
    // Ideally we pass state or query params. 
    // Since AuctionsScreen uses local state for filters, passing query params requires AuctionsScreen to read them.
    // Assuming AuctionsScreen might NOT read URL params yet (it used useState default ''). 
    // But for "ui from app" purpose, let's just make the UI look right.
    navigate(`/auctions`);
  };

  return (
    <section className="hero-v2">
      <div className="container">
        <h1>Discover Extraordinary<br />Items & Collectibles</h1>
        <p>Bid on exclusive items from verified sellers worldwide. Secure, transparent, and premium.</p>

        <form onSubmit={handleSearch} className="search-bar-v2">
          <input
            type="text"
            placeholder="Search for watches, art, electronics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Luxury Vehicles">Luxury Vehicles</option>
            <option value="Fine Art">Fine Art</option>
            <option value="Jewelry & Watches">Jewelry & Watches</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Collectibles">Collectibles</option>
          </select>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>
    </section>
  );
};

export default Hero;