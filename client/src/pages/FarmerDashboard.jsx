import { useState, useEffect } from 'react';
import './Dashboard.css';

const API_URL = 'https://harvestbridge-vuh8.onrender.com/api/listings';
const WEATHER_URL = 'https://harvestbridge-vuh8.onrender.com/api/weather';
const ORDER_URL = 'https://harvestbridge-vuh8.onrender.com/api/orders';

export default function FarmerDashboard() {
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weather, setWeather] = useState(null);
  const [form, setForm] = useState({
    cropName: '',
    quantity: '',
    unit: 'quintal',
    pricePerUnit: '',
    location: '',
    description: '',
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const fetchMyListings = async () => {
    try {
      const res = await fetch(`${API_URL}/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setListings(data);
    } catch (err) {
      setError('Could not load your listings');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const res = await fetch(`${ORDER_URL}/farmer/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      // silently ignore
    }
  };

  useEffect(() => {
    fetchMyListings();
    fetchMyOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const location = user.location || 'Lucknow';
    let cancelled = false;
    const loadWeather = async () => {
      try {
        const res = await fetch(`${WEATHER_URL}?location=${encodeURIComponent(location)}`);
        const data = await res.json();
        if (!cancelled && res.ok) setWeather(data);
      } catch {
        // silently ignore
      }
    };
    loadWeather();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Could not create listing');
        return;
      }

      setForm({ cropName: '', quantity: '', unit: 'quintal', pricePerUnit: '', location: '', description: '' });
      setShowForm(false);
      fetchMyListings();
    } catch (err) {
      setError('Could not reach the server');
    }
  };

  const respondToOrder = async (orderId, status) => {
    try {
      await fetch(`${ORDER_URL}/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      fetchMyOrders();
    } catch {
      // silently ignore
    }
  };

  return (
    <div className="dash-page">
      <header className="dash-header">
        <span className="dash-logo">HarvestBridge</span>
        <span className="dash-welcome">Welcome, {user.name || 'Farmer'}</span>
      </header>

      <div className="dash-container">
        {weather && (
          <div className={weather.isRainAlert ? 'weather-card alert' : 'weather-card'}>
            <div>
              <p className="weather-location">{weather.location}</p>
              <p className="weather-condition">{weather.description}, {Math.round(weather.temperature)}°C</p>
            </div>
            {weather.isRainAlert && (
              <p className="weather-warning">⚠ Rain expected — consider covering your harvest</p>
            )}
          </div>
        )}

        {orders.length > 0 && (
          <div className="dash-orders">
            <h2>Order Requests</h2>
            <div className="dash-orders-list">
              {orders.map((order) => (
                <div className="dash-order-card" key={order._id}>
                  <div>
                    <p className="dash-order-crop">{order.listing?.cropName || 'Crop'}</p>
                    <p className="dash-order-info">
                      {order.quantityRequested} requested by {order.buyer?.name || 'Buyer'}
                    </p>
                    {order.message && <p className="dash-order-msg">"{order.message}"</p>}
                    {order.buyer?.phone && (
                      <a className="dash-card-contact" href={`tel:${order.buyer.phone}`}>
                        Contact: {order.buyer.phone}
                      </a>
                    )}
                  </div>
                  {order.status === 'pending' ? (
                    <div className="dash-order-actions">
                      <button className="dash-btn-accept" onClick={() => respondToOrder(order._id, 'accepted')}>Accept</button>
                      <button className="dash-btn-decline" onClick={() => respondToOrder(order._id, 'declined')}>Decline</button>
                    </div>
                  ) : (
                    <span className={`dash-card-status ${order.status}`}>{order.status}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="dash-top">
          <h1>Your listings</h1>
          <button className="dash-btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add new crop'}
          </button>
        </div>

        {showForm && (
          <form className="dash-form" onSubmit={handleSubmit}>
            {error && <p className="dash-error">{error}</p>}
            <div className="dash-form-row">
              <div>
                <label>Crop name</label>
                <input type="text" name="cropName" placeholder="e.g. Wheat" value={form.cropName} onChange={handleChange} required />
              </div>
              <div>
                <label>Quantity (quintal)</label>
                <input type="number" name="quantity" placeholder="e.g. 20" value={form.quantity} onChange={handleChange} required />
              </div>
            </div>
            <div className="dash-form-row">
              <div>
                <label>Price per quintal (₹)</label>
                <input type="number" name="pricePerUnit" placeholder="e.g. 2200" value={form.pricePerUnit} onChange={handleChange} required />
              </div>
              <div>
                <label>Location</label>
                <input type="text" name="location" placeholder="Village, district" value={form.location} onChange={handleChange} required />
              </div>
            </div>
            <label>Description (optional)</label>
            <textarea name="description" placeholder="Any extra details for buyers" value={form.description} onChange={handleChange} rows="3" />
            <button type="submit" className="dash-btn-primary">List this crop</button>
          </form>
        )}

        {loading ? (
          <p className="dash-empty">Loading...</p>
        ) : listings.length === 0 ? (
          <p className="dash-empty">You haven't listed any crops yet.</p>
        ) : (
          <div className="dash-grid">
            {listings.map((item) => (
              <div className="dash-card" key={item._id}>
                <p className="dash-card-crop">{item.cropName}</p>
                <p className="dash-card-detail">{item.quantity} {item.unit} · ₹{item.pricePerUnit}/{item.unit}</p>
                <p className="dash-card-location">{item.location}</p>
                <span className={`dash-card-status ${item.status}`}>{item.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}