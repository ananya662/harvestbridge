const express = require('express');
const router = express.Router();

// Get weather for a location (city name), used to warn farmers about rain/storms
router.get('/', async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }

    // OpenWeatherMap often needs just the city name, so take the first part
    // e.g. "Lucknow, UP" -> "Lucknow"
    const city = location.split(',')[0].trim();

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${process.env.WEATHER_API_KEY}&units=metric`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      return res.status(404).json({ message: data.message || 'Could not fetch weather for this location' });
    }

    const conditionMain = data.weather[0].main.toLowerCase();
    const isRainAlert = ['rain', 'thunderstorm', 'drizzle'].includes(conditionMain);

    res.json({
      location: data.name,
      temperature: data.main.temp,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      isRainAlert,
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch weather', error: err.message });
  }
});

module.exports = router;