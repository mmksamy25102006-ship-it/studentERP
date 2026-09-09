import React, { useEffect, useState } from "react";
import {
  FaCloudSun,
  FaTemperatureHigh,
  FaTint,
  FaWind,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "./WeatherCard.css";

const WeatherCard = () => {
  const [weather, setWeather] = useState({
    city: "Chennai",
    temperature: 32,
    condition: "Partly Cloudy",
    humidity: 74,
    wind: 14,
  });

  useEffect(() => {
    // Replace this with API call later
  }, []);

  return (
    <div className="weather-card">
      <div className="weather-header">
        <h2>Weather</h2>
      </div>

      <div className="weather-body">
        <div className="weather-icon">
          <FaCloudSun />
        </div>

        <div className="weather-info">
          <h1>{weather.temperature}°C</h1>
          <h3>{weather.condition}</h3>

          <p>
            <FaMapMarkerAlt /> {weather.city}
          </p>
        </div>
      </div>

      <div className="weather-details">
        <div className="weather-item">
          <FaTemperatureHigh />
          <span>{weather.temperature}°C</span>
          <small>Temperature</small>
        </div>

        <div className="weather-item">
          <FaTint />
          <span>{weather.humidity}%</span>
          <small>Humidity</small>
        </div>

        <div className="weather-item">
          <FaWind />
          <span>{weather.wind} km/h</span>
          <small>Wind Speed</small>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
