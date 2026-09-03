import './Home.css';

export default function Home({ onGetStarted }) {
  return (
    <div className="home-page">
      <header className="home-nav">
        <span className="home-logo">HarvestBridge</span>
        <button className="home-nav-btn" onClick={onGetStarted}>Login / Sign up</button>
      </header>

      <section className="home-hero">
        <h1>Sell your harvest directly.<br />No middlemen, fair prices.</h1>
        <p>HarvestBridge connects farmers directly with buyers, with real-time weather alerts to protect your crop.</p>
        <button className="home-cta" onClick={onGetStarted}>Get Started — It's Free</button>
      </section>

      <section className="home-features">
        <div className="home-feature-card">
          <span className="home-feature-icon">🌾</span>
          <h3>Direct Marketplace</h3>
          <p>List your crops and connect with buyers directly — no commission, no middlemen cutting into your price.</p>
        </div>
        <div className="home-feature-card">
          <span className="home-feature-icon">🌧️</span>
          <h3>Weather Advisory</h3>
          <p>Get real-time rain and storm alerts for your location, so you can protect your harvest in time.</p>
        </div>
        <div className="home-feature-card">
          <span className="home-feature-icon">🤝</span>
          <h3>Built on Trust</h3>
          <p>See farmer details and contact information directly — buy fresh produce with confidence.</p>
        </div>
      </section>

      <section className="home-how">
        <h2>How it works</h2>
        <div className="home-steps">
          <div className="home-step">
            <span className="home-step-num">1</span>
            <p>Sign up as a Farmer or Buyer</p>
          </div>
          <div className="home-step">
            <span className="home-step-num">2</span>
            <p>Farmers list crops, buyers browse and order</p>
          </div>
          <div className="home-step">
            <span className="home-step-num">3</span>
            <p>Connect directly and complete the deal</p>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <p>HarvestBridge — built for farmers, by design.</p>
      </footer>
    </div>
  );
}