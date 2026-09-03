import { useState, useEffect } from 'react';
import './Dashboard.css';

const API_URL = 'https://harvestbridge-vuh8.onrender.com/api/listings';
const ORDER_URL = 'https://harvestbridge-vuh8.onrender.com/api/orders';

export default function BuyerBrowse() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cropSearch, setCropSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [orderingId, setOrderingId] = useState(null);
  const [orderQty, setOrderQty] = useState('');
  const [orderMsg, setOrderMsg] = useState('');
  const [orderStatus, setOrderStatus] = useState({});

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

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

  const openOrderForm = (id) => {
    setOrderingId(orderingId === id ? null : id);
    setOrderQty('');
    setOrderMsg('');
  };

  const sendOrderRequest = async (listing) => {
    try {
      const res = await fetch(ORDER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listing: listing._id,
          farmer: listing.farmer._id,
          quantityRequested: orderQty,
          message: orderMsg,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setOrderStatus({ ...orderStatus, [listing._id]: data.message || 'Could not send request' });
        return;
      }

      setOrderStatus({ ...orderStatus, [listing._id]: 'Order request sent!' });
      setOrderingId(null);
    } catch {
      setOrderStatus({ ...orderStatus, [listing._id]: 'Could not reach server' });
    }
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

                {orderStatus[item._id] && (
                  <p className="dash-order-status">{orderStatus[item._id]}</p>
                )}

                <button className="dash-btn-primary dash-order-btn" onClick={() => openOrderForm(item._id)}>
                  {orderingId === item._id ? 'Cancel' : 'Send Order Request'}
                </button>

                {orderingId === item._id && (
                  <div className="dash-order-form">
                    <label>Quantity needed ({item.unit})</label>
                    <input
                      type="number"
                      value={orderQty}
                      onChange={(e) => setOrderQty(e.target.value)}
                      placeholder="e.g. 10"
                    />
                    <label>Message (optional)</label>
                    <textarea
                      rows="2"
                      value={orderMsg}
                      onChange={(e) => setOrderMsg(e.target.value)}
                      placeholder="Any details for the farmer"
                    />
                    <button
                      className="dash-btn-primary"
                      onClick={() => sendOrderRequest(item)}
                      disabled={!orderQty}
                    >
                      Confirm Request
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}