import { useState, useEffect } from 'react';
import './Dashboard.css';

const API_URL = 'http://localhost:5000/api/listings';

export default function BuyerBrowse() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cropSearch, setCropSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchListings = async (crop = '', location = '') => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (crop) params.append('crop', crop);
      if (location) params.append('location', location);

      const res = await fetch(`${API_URL}?${params.toString()}`);
      const data = await res.json();
      setListings(data);
    } catch {
      setError('Could not load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchListings(cropSearch, locationSearch);
  };

  return (
    <div className="dash-page">
      <header className="dash-header">
        <span className="dash-logo">HarvestBridge</span>
        <span className="dash-welcome">Welcome, {user.name || 'Buyer'}</span>
      </header>

      <div className="dash-container">
        <div className="dash-top">
          <h1>Browse fresh produce</h1>
        </div>

        <form className="dash-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by crop (e.g. Wheat)"
            value={cropSearch}
            onChange={(e) => setCropSearch(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by location"
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
          />
          <button type="submit" className="dash-btn-primary">Search</button>
        </form>

        {error && <p className="dash-error">{error}</p>}

        {loading ? (
          <p className="dash-empty">Loading listings...</p>
        ) : listings.length === 0 ? (
          <p className="dash-empty">No listings found. Try a different search.</p>
        ) : (
          <div className="dash-grid">
            {listings.map((item) => (
              <div className="dash-card" key={item._id}>
                <p className="dash-card-crop">{item.cropName}</p>
                <p className="dash-card-detail">{item.quantity} {item.unit} · ₹{item.pricePerUnit}/{item.unit}</p>
                <p className="dash-card-location">{item.location}</p>
                {item.description && <p className="dash-card-desc">{item.description}</p>}
                <p className="dash-card-farmer">Farmer: {item.farmer?.name || 'Unknown'}</p>
                {item.farmer?.phone && (
                  <a className="dash-card-contact" href={`tel:${item.farmer.phone}`}>
                    Contact: {item.farmer.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}