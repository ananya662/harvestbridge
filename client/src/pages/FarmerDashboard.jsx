import { useState, useEffect } from 'react';
import './Dashboard.css';

const API_URL = 'http://localhost:5000/api/listings';

export default function FarmerDashboard() {
  const [listings, setListings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setListings(data);
    } catch  {
      setError('Could not load your listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
   
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
    } catch  {
      setError('Could not reach the server');
    }
  };

  return (
    <div className="dash-page">
      <header className="dash-header">
        <span className="dash-logo">HarvestBridge</span>
        <span className="dash-welcome">Welcome, {user.name || 'Farmer'}</span>
      </header>

      <div className="dash-container">
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