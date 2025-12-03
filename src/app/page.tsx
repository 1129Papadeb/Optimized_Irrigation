'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { assessPlantHealth, calculateRecentIrrigationScore } from '@/utils/plantHealth';
import { calculateIrrigation } from '@/utils/irrigation';
import { getForecastRainChance } from '@/utils/weather';
import type { ProcessedWeatherData, PlantHealthData, IrrigationResult } from '@/types/index';
import type { CropType } from '@/utils/fuzzyLogic';
const SmartIrrigationSystem: React.FC = () => {
  // Form states
  const [cropType, setCropType] = useState<CropType>('lettuce');
  const [soilMoisture, setSoilMoisture] = useState<number>(45);
  const [humidity, setHumidity] = useState<number>(60);
  const [temperature, setTemperature] = useState<number>(25);
  const [daysSincePlanting, setDaysSincePlanting] = useState<number>(30);
  const [irrigationHistory, setIrrigationHistory] = useState<number[]>([0, 0, 0]);
  const [city, setCity] = useState<string>('Leon,Iloilo,PH');

  // API key
  const apiKey = process.env.Newapp || 'c588c40cae5e3b1c9a96f7322d8f8749';

  // Results states
  const [weatherData, setWeatherData] = useState<ProcessedWeatherData | null>(null);
  const [rainChance, setRainChance] = useState<number>(30);
  const [plantHealth, setPlantHealth] = useState<PlantHealthData | null>(null);
  const [irrigationResult, setIrrigationResult] = useState<IrrigationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchWeatherData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (apiKey === 'YOUR_DEFAULT_API_KEY_HERE' || !apiKey) {
        setError('OpenWeather API Key is not configured. Using default weather values.');
        setRainChance(30);
        setWeatherData(null);
        return;
      }
      const result = await getForecastRainChance(apiKey, city);
      setRainChance(result.rainChance);
      setWeatherData(result.weatherData);
    } catch (err) {
      console.error('Failed to fetch weather data:', err);
      setError('Failed to fetch weather data. Please check your API key and city. Using default values.');
      setRainChance(30);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  }, [apiKey, city]);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  const calculateRecommendation = () => {
    const recentIrrigationScore = calculateRecentIrrigationScore(irrigationHistory);
    const health = assessPlantHealth(soilMoisture, recentIrrigationScore, cropType, daysSincePlanting);
    setPlantHealth(health);

    const result = calculateIrrigation({
      soil: soilMoisture,
      humidity,
      temperature,
      forecast: rainChance,
      plantHealth: health.score,
      recentIrrigation: recentIrrigationScore,
      cropType,
      daysSincePlanting,
    });
    setIrrigationResult(result);
  };

  const handleIrrigationHistoryChange = (index: number, value: string) => {
    const newHistory = [...irrigationHistory];
    newHistory[index] = parseFloat(value) || 0;
    setIrrigationHistory(newHistory);
  };

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'Low Risk':
        return '#4CAF50';
      case 'Medium Risk':
        return '#FFC107';
      case 'High Risk':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getHealthColor = (status: string): string => {
    switch (status) {
      case 'Excellent':
        return '#4CAF50';
      case 'Healthy':
        return '#4CAF50';
      case 'Poor':
        return '#FFC107';
      case 'Critical':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <div className="irrigation-container">
      <style jsx>{`
        /* Root container for the entire page */
        .irrigation-container {
          min-height: 100vh;
          background-image: #ffffff;
          padding: 20px;
          font-family: 'Inter', sans-serif;
          color: #333;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        /* Main card holding all content */
        .main-card {
          max-width: 1400px;
          width: 100%;
          margin: 20px auto;
          background: linear-gradient(135deg, #0453134f 30%, #3CB371 100%);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 25px;
        }

        /* Header section with title and description */
        .header {
          background: linear-gradient(135deg, #3CB371 0%, #2E8B57 100%);
          padding: 40px;
          text-align: center;
          color: white;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        }

        .header h1 {
          margin: 0;
          font-size: 3.2rem;
          font-weight: 800;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          letter-spacing: -1.5px;
        }

        .header p {
          margin: 15px 0 0;
          font-size: 1.25rem;
          opacity: 0.98;
          max-width: 650px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Main content area */
        .content {
          padding: 50px;
        }

        /* Grid for form sections */
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 40px;
          margin-bottom: 50px;
        }

        /* Individual form section card */
        .form-section {
          background-image: linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%);
          padding: 35px;
          border-radius: 20px;
          border: 1px solid #e0e0e0;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.07);
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }

        .form-section:hover {
          transform: translateY(-7px);
          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.12);
        }

        .form-section h3 {
          margin: 0 0 28px;
          color: #212121;
          font-size: 1.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 2px solid #D4EDDA;
          padding-bottom: 15px;
        }

        .input-group {
          margin-bottom: 30px;
        }

        .input-group label {
          display: block;
          margin-bottom: 12px;
          color: #424242;
          font-weight: 600;
          font-size: 1.05rem;
        }

        .input-group input,
        .input-group select {
          width: 100%;
          padding: 15px 20px;
          border: 2px solid #d0d0d0;
          border-radius: 12px;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          box-sizing: border-box;
          background-color: #ffffff;
          color: #333;
        }

        .input-group input:focus,
        .input-group select:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 5px rgba(76, 175, 80, 0.2);
        }

        .range-info {
          font-size: 0.95rem;
          color: #757575;
          margin-top: 10px;
          padding-left: 5px;
        }

        .weather-section {
          display: flex;
          align-items: center;
          gap: 25px;
          margin-top: 25px;
          flex-wrap: wrap;
          justify-content: flex-start;
        }

        .weather-section > span {
          flex-shrink: 0;
        }

        .weather-button {
          background: linear-gradient(135deg, #2196F3, #1976D2);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1.05rem;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .weather-button:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(33, 150, 243, 0.5);
        }

        .weather-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* Calculate button */
        .calculate-button {
          width: 100%;
          background: linear-gradient(135deg, #4CAF50, #2E7D32);
          color: white;
          border: none;
          padding: 22px 28px;
          border-radius: 15px;
          font-size: 1.4rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(76, 175, 80, 0.4);
          margin: 50px 0;
          letter-spacing: 0.7px;
        }

        .calculate-button:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(76, 175, 80, 0.5);
        }

        /* Grid for results */
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 35px;
          margin-top: 50px;
        }

        /* Individual result card */
        .result-card {
          background-image: linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%);
          border-radius: 20px;
          padding: 35px;
          box-shadow: 0 15px 45px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .result-card h4 {
          margin: 0 0 28px;
          color: #212121;
          font-size: 1.9rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 15px;
        }

        .metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 0;
          border-bottom: 1px solid #f5f5f5;
        }

        .metric:last-child {
          border-bottom: none;
        }

        .metric-label {
          color: #616161;
          font-weight: 500;
          font-size: 1.1rem;
        }

        .metric-value {
          font-weight: 700;
          color: #333;
          font-size: 1.15rem;
        }

        .status-badge {
          padding: 9px 18px;
          border-radius: 25px;
          font-size: 1rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.7px;
        }

        /* Irrigation level display */
        .irrigation-level {
          text-align: center;
          padding: 35px;
          margin: 25px 0;
          border-radius: 20px;
          background: linear-gradient(135deg, #E3F2FD, #3a92beff);
          border: 2px dashed #90CAF9;
          box-shadow: inset 0 0 18px rgba(0, 150, 136, 0.08);
        }

        .irrigation-level h3 {
          margin: 0 0 18px;
          font-size: 2.4rem;
          color: #1565C0;
          font-weight: 800;
        }

        .irrigation-percentage {
          font-size: 4.2rem;
          font-weight: 900;
          color: #0D47A1;
          margin: 18px 0;
          text-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
        }

        /* Health issues section */
        .health-issues {
          margin-top: 30px;
          background: #FFF0F0;
          border-left: 6px solid #EF5350;
          padding: 18px 25px;
          border-radius: 10px;
        }

        .health-issues strong {
          color: #D32F2F;
          font-size: 1.1rem;
          display: block;
          margin-bottom: 12px;
        }

        .health-issues ul {
          margin: 0;
          padding-left: 28px;
          list-style-type: '🚨 ';
        }

        .health-issues li {
          color: #C62828;
          margin-bottom: 10px;
          font-size: 1rem;
        }

        /* Recommendations section */
        .recommendations {
          background: #FFFCE6;
          border-left: 6px solid #FFD740;
          border-radius: 10px;
          padding: 22px;
          margin-top: 35px;
        }

        .recommendations h5 {
          margin: 0 0 18px;
          color: #FBC02D;
          font-size: 1.25rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .recommendations ul {
          margin: 0;
          padding-left: 28px;
          list-style-type: '✅ ';
        }

        .recommendations li {
          color: #F9A825;
          margin-bottom: 10px;
          font-size: 1rem;
        }

        /* Weather info display */
        .weather-info {
          background: linear-gradient(135deg, #E8F5FF, #D0EEFF);
          border-radius: 12px;
          padding: 22px;
          margin-top: 25px;
          border: 1px solid #A7D9F8;
          box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.06);
        }

        .weather-info p {
          margin: 10px 0;
          color: #1565C0;
          font-size: 1rem;
        }

        /* Safety message styling */
        .safety-message {
          padding: 25px;
          border-radius: 18px;
          margin: 30px 0;
          font-weight: 700;
          font-size: 1.15rem;
          text-align: center;
          line-height: 1.6;
        }

        .safety-message.safe {
          background: #E8F5E9;
          border: 1px solid #4CAF50;
          color: #2E7D32;
        }

        .safety-message.warning {
          background: #FFFCE6;
          border: 1px solid #FFC107;
          color: #FF8F00;
        }

        .safety-message.danger {
          background: #FFF0F0;
          border: 1px solid #EF5350;
          color: #D32F2F;
        }

        /* Error message styling */
        .error-message {
          background: #FFF0F0;
          border: 1px solid #EF5350;
          color: #C62828;
          padding: 20px;
          border-radius: 12px;
          margin: 30px 0;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1rem;
        }

        /* Loading indicator */
        .loading {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #616161;
          font-size: 1rem;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #e0e0e0;
          border-top: 3px solid #2196F3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Irrigation history input grid */
        .irrigation-history {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 25px;
          margin-top: 25px;
        }

        .history-input {
          text-align: center;
        }

        .history-input label {
          font-size: 0.95rem;
          color: #757575;
          margin-bottom: 10px;
          display: block;
        }

        .history-input input {
          border-radius: 8px;
          padding: 8px 12px;
          border: 1px solid #ccc;
        }

        /* Responsive adjustments */
        @media (max-width: 1200px) {
          .main-card {
            margin: 15px;
          }
          .content {
            padding: 40px;
          }
          .form-grid,
          .results-grid {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
          }
        }

        @media (max-width: 1024px) {
          .content {
            padding: 30px;
          }
          .form-grid,
          .results-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          .header h1 {
            font-size: 2.8rem;
          }
          .weather-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
        }

        @media (max-width: 768px) {
          .irrigation-container {
            padding: 15px;
          }
          .main-card {
            margin: 15px auto;
            border-radius: 20px;
          }
          .header {
            padding: 30px 20px;
          }
          .header h1 {
            font-size: 2.4rem;
          }
          .header p {
            font-size: 1.1rem;
          }
          .content {
            padding: 25px;
          }
          .form-section h3,
          .result-card h4 {
            font-size: 1.6rem;
          }
          .input-group input,
          .input-group select {
            padding: 14px 18px;
            font-size: 1rem;
          }
          .calculate-button {
            padding: 18px 22px;
            font-size: 1.2rem;
          }
          .irrigation-percentage {
            font-size: 3.5rem;
          }
          .irrigation-history {
            grid-template-columns: 1fr;
          }
          .safety-message {
            padding: 20px;
            font-size: 1.05rem;
          }
        }

        @media (max-width: 480px) {
          .header h1 {
            font-size: 2rem;
          }
          .header p {
            font-size: 1rem;
          }
          .content {
            padding: 20px;
          }
          .form-section,
          .result-card {
            padding: 25px;
          }
          .form-section h3,
          .result-card h4 {
            font-size: 1.4rem;
            margin-bottom: 20px;
          }
          .input-group label {
            font-size: 1rem;
          }
          .input-group input,
          .input-group select {
            font-size: 0.95rem;
            padding: 12px 15px;
          }
          .range-info,
          .history-input label,
          .weather-info p {
            font-size: 0.85rem;
          }
          .weather-button {
            padding: 12px 20px;
            font-size: 0.95rem;
            width: 100%;
            justify-content: center;
          }
          .weather-section span {
            text-align: center;
            width: 100%;
            font-size: 0.95rem;
          }
          .calculate-button {
            font-size: 1.1rem;
            padding: 15px 20px;
            margin: 30px 0;
          }
          .metric-label,
          .metric-value {
            font-size: 1rem;
          }
          .status-badge {
            padding: 7px 14px;
            font-size: 0.9rem;
          }
          .irrigation-level h3 {
            font-size: 2rem;
          }
          .irrigation-percentage {
            font-size: 3rem;
          }
          .health-issues,
          .recommendations {
            padding: 15px 20px;
          }
          .health-issues strong,
          .recommendations h5 {
            font-size: 1rem;
          }
          .health-issues ul,
          .recommendations ul {
            padding-left: 20px;
          }
          .safety-message {
            font-size: 0.95rem;
            padding: 15px;
          }
          .error-message,
          .loading {
            font-size: 0.9rem;
            padding: 15px;
          }
        }
      `}</style>

      <div className="main-card">
        <div className="header">
          <h1>Smart Irrigation System</h1>
        </div>

        <div className="content">
          <div className="form-grid">
            {/* Plant Information Section */}
            <div className="form-section">
              <h3>
                <span role="img" aria-label="plant">
                  🌱
                </span>{' '}
                Plant Information
              </h3>

              <div className="input-group">
                <label htmlFor="cropType">Crop Type</label>
                <select
                  id="cropType"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value as CropType)}
                >
                  <option value="lettuce">🥬 Lettuce (Sensitive to Water)</option>
                  <option value="okra">🫛 Okra (Moderate Water Needs)</option>
                  <option value="tomato">🍅 Tomato (Moderate Water Needs)</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="daysSincePlanting">Days Since Planting</label>
                <input
                  type="number"
                  id="daysSincePlanting"
                  value={daysSincePlanting}
                  onChange={(e) => setDaysSincePlanting(parseInt(e.target.value) || 0)}
                  min="1"
                  max="365"
                />
                <div className="range-info">
                  Younger plants (e.g., &lt;14 days) are typically more sensitive to conditions.
                </div>
              </div>
            </div>

            {/* Environmental Conditions Section */}
            <div className="form-section">
              <h3>
                <span role="img" aria-label="thermometer">
                  🌡️
                </span>{' '}
                Environmental Conditions
              </h3>

              <div className="input-group">
                <label htmlFor="soilMoisture">Soil Moisture (%)</label>
                <input
                  type="number"
                  id="soilMoisture"
                  value={soilMoisture}
                  onChange={(e) => setSoilMoisture(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.1"
                />
                <div className="range-info">
                  Ranges: Dry (0-40%) | Moist (30-70%) | Wet (60-85%) | Saturated (85-100%)
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="humidity">Humidity (%)</label>
                <input
                  type="number"
                  id="humidity"
                  value={humidity}
                  onChange={(e) => setHumidity(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                />
                <div className="range-info">
                  Ranges: Low (0-50%) | Medium (30-70%) | High (60-100%)
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="temperature">Temperature (°C)</label>
                <input
                  type="number"
                  id="temperature"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                  min="10"
                  max="40"
                />
                <div className="range-info">Optimal range for most crops: 18-32°C</div>
              </div>
            </div>

            {/* Weather & Location Section */}
            <div className="form-section">
              <h3>
                <span role="img" aria-label="cloud with rain">
                  🌦️
                </span>{' '}
                Weather & Location
              </h3>

              <div className="input-group">
                <label htmlFor="city">Location (City, State/Province, Country Code)</label>
                <input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Leon,Iloilo,PH"
                />
              </div>

              <div className="weather-section">
                <button
                  className="weather-button"
                  onClick={fetchWeatherData}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="loading">
                      <div className="spinner"></div>
                      Fetching Weather...
                    </div>
                  ) : (
                    <>🌤️ Get Latest Weather</>
                  )}
                </button>
                <span>
                  Next 24hr Rain Chance:{' '}
                  <strong
                    style={{
                      color:
                        rainChance > 50
                          ? '#F44336'
                          : rainChance > 20
                          ? '#FFC107'
                          : '#4CAF50',
                    }}
                  >
                    {rainChance}%
                  </strong>
                </span>
              </div>

              {weatherData && (
                <div className="weather-info">
                  <p>
                    <strong>🌤️ Current Conditions:</strong> {weatherData.description}
                  </p>
                  <p>
                    <strong>🌡️ Temperature:</strong> {weatherData.temperature}°C
                  </p>
                  <p>
                    <strong>💧 Humidity:</strong> {weatherData.humidity}%
                  </p>
                  <p>
                    <strong>☁️ Cloudiness:</strong> {weatherData.cloudiness}%
                  </p>
                  {weatherData.rain > 0 && (
                    <p>
                      <strong>🌧️ Recent Rain:</strong> {weatherData.rain}mm/h
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Irrigation History Section */}
            <div className="form-section">
              <h3>
                <span role="img" aria-label="chart">
                  📊
                </span>{' '}
                Recent Irrigation History
              </h3>
              <p
                style={{
                  fontSize: '0.95rem',
                  color: '#616161',
                  marginBottom: '15px',
                }}
              >
                Input the amount of irrigation applied (in %) for the past 3 days.
              </p>

              <div className="irrigation-history">
                <div className="history-input">
                  <label>Today (0-100%)</label>
                  <input
                    type="number"
                    value={irrigationHistory[0]}
                    onChange={(e) =>
                      handleIrrigationHistoryChange(0, e.target.value)
                    }
                    min="0"
                    max="100"
                    placeholder="0"
                  />
                </div>
                <div className="history-input">
                  <label>Yesterday (0-100%)</label>
                  <input
                    type="number"
                    value={irrigationHistory[1]}
                    onChange={(e) =>
                      handleIrrigationHistoryChange(1, e.target.value)
                    }
                    min="0"
                    max="100"
                    placeholder="0"
                  />
                </div>
                <div className="history-input">
                  <label>2 Days Ago (0-100%)</label>
                  <input
                    type="number"
                    value={irrigationHistory[2]}
                    onChange={(e) =>
                      handleIrrigationHistoryChange(2, e.target.value)
                    }
                    min="0"
                    max="100"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && <div className="error-message">⚠️ {error}</div>}

          <button className="calculate-button" onClick={calculateRecommendation}>
            Get Recommendation Now
          </button>

          {/* Results Section */}
          {irrigationResult && plantHealth && (
            <div className="results-grid">
              {/* Irrigation Recommendation */}
              <div className="result-card">
                <h4>💧 Irrigation Recommendation</h4>
                <div className="irrigation-level">
                  <h3>{irrigationResult.label}</h3>
                  <div className="irrigation-percentage">
                    {irrigationResult.level.toFixed(1)}
                    <small>%</small>
                  </div>
                  <div
                    className="status-badge"
                    style={{ backgroundColor: getRiskColor(irrigationResult.riskLevel) }}
                  >
                    {irrigationResult.riskLevel}
                  </div>
                </div>

                <div className="metric">
                  <span className="metric-label">💧 Estimated Water Usage:</span>
                  <span className="metric-value">
                    {irrigationResult.estimatedLiters.toFixed(2)} L
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">📏 Calculated Area:</span>
                  <span className="metric-value">10 m²</span>
                </div>
              </div>

              {/* Plant Health Status */}
              <div className="result-card">
                <h4>🏥 Plant Health Status</h4>
                <div className="metric">
                  <span className="metric-label">Health Score:</span>
                  <span className="metric-value">
                    {plantHealth.score.toFixed(1)}
                    <small>/100</small>
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Status:</span>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getHealthColor(plantHealth.status) }}
                  >
                    {plantHealth.status}
                  </span>
                </div>

                {plantHealth.issues.length > 0 && (
                  <div className="health-issues">
                    <strong>⚠️ Potential Health Concerns:</strong>
                    <ul>
                      {plantHealth.issues.map((issue: string, index: number) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Safety Analysis & General Recommendations */}
              <div className="result-card">
                <h4>🛡️ Safety Analysis</h4>
                <div
                  className={`safety-message ${
                    irrigationResult.safetyMessage.includes('✅')
                      ? 'safe'
                      : irrigationResult.safetyMessage.includes('⚠️')
                      ? 'warning'
                      : 'danger'
                  }`}
                >
                  {irrigationResult.safetyMessage}
                </div>

                <div className="recommendations">
                  <h5>
                    <span role="img" aria-label="lightbulb">
                      💡
                    </span>{' '}
                    General Recommendations:
                  </h5>
                  <ul>
                    {soilMoisture > 80 && (
                      <li>
                        Consider improving drainage to prevent waterlogging, especially if soil
                        moisture is consistently high.
                      </li>
                    )}
                    {soilMoisture > 80 && (
                      <li>
                        Monitor closely for signs of root rot or fungal diseases, which thrive in
                        overly wet conditions.
                      </li>
                    )}
                    {soilMoisture < 25 && (
                      <li>
                        Verify irrigation system for proper water delivery and consistent coverage.
                      </li>
                    )}
                    {soilMoisture < 25 && (
                      <li>
                        Apply mulch around plants to help retain soil moisture and reduce
                        evaporation.
                      </li>
                    )}
                    {calculateRecentIrrigationScore(irrigationHistory) > 70 && (
                      <li>
                        Reduce irrigation frequency for the next 2-3 days to allow soil to dry out
                        slightly.
                      </li>
                    )}
                    {calculateRecentIrrigationScore(irrigationHistory) > 70 && (
                      <li>
                        Carefully observe plants for symptoms of over-watering, such as yellowing
                        leaves or stunted growth.
                      </li>
                    )}
                    {plantHealth.score < 60 && (
                      <li>
                        Inspect plants thoroughly for pests, diseases, or nutrient deficiencies
                        causing stress.
                      </li>
                    )}
                    {plantHealth.score < 60 && (
                      <li>
                        Adjust irrigation schedule based on direct observation of plant response and
                        soil conditions.
                      </li>
                    )}
                    {irrigationResult.safetyMessage.includes('✅') &&
                      plantHealth.score >= 70 && (
                        <li>
                          Your plants appear to be in good health with an optimal irrigation plan.
                          Keep monitoring!
                        </li>
                      )}
                    {(irrigationResult.safetyMessage.includes('⚠️') ||
                      irrigationResult.safetyMessage.includes('❌')) && (
                      <li>
                        Prioritize immediate action based on the specific warnings to prevent
                        further plant stress or damage.
                      </li>
                    )}
                    <li>
                      Always cross-reference automated recommendations with physical inspection of
                      your plants and soil.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Environmental Summary */}
              <div className="result-card">
                <h4>🌍 Current Environmental Summary</h4>
                <div className="metric">
                  <span className="metric-label">🌱 Soil Moisture:</span>
                  <span className="metric-value">{soilMoisture}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">💨 Humidity:</span>
                  <span className="metric-value">{humidity}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">🌡️ Temperature:</span>
                  <span className="metric-value">{temperature}°C</span>
                </div>
                <div className="metric">
                  <span className="metric-label">🌦️ Rain Forecast (24hr):</span>
                  <span className="metric-value">{rainChance}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">📊 Recent Irrigation Score:</span>
                  <span className="metric-value">
                    {calculateRecentIrrigationScore(irrigationHistory).toFixed(1)}%
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">🌾 Crop Type:</span>
                  <span className="metric-value">
                    {cropType.charAt(0).toUpperCase() + cropType.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              textAlign: 'center',
              marginTop: '50px',
              padding: '25px',
              borderTop: '1px solid #ffffffff',
              color: '#ffffffff',
              fontSize: '0.9rem',
            }}
          >
            <p>
              Remember: It&apos;s often safer to underwater slightly than to overwater, as it&apos;s
              easier to add water than to remove excess!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartIrrigationSystem;
