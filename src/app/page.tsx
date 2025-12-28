'use client';

import React, { useState } from 'react';
import { assessPlantHealth, calculateRecentIrrigationScore } from '@/utils/plantHealth';
import { calculateIrrigation } from '@/utils/irrigation';
import type { PlantHealthData, IrrigationResult } from '@/types/index';
import type { CropType } from '@/utils/fuzzyLogic';

const SmartIrrigationSystem: React.FC = () => {
  const [cropType, setCropType] = useState<CropType>('lettuce');
  const [soilMoisture, setSoilMoisture] = useState<number>(45);
  const [humidity, setHumidity] = useState<number>(60);
  const [temperature, setTemperature] = useState<number>(25);
  const [daysSincePlanting, setDaysSincePlanting] = useState<number>(30);
  const [irrigationHistory, setIrrigationHistory] = useState<number[]>([0, 0, 0]);
  const [rainChance, setRainChance] = useState<number>(30);
  const [plantHealth, setPlantHealth] = useState<PlantHealthData | null>(null);
  const [irrigationResult, setIrrigationResult] = useState<IrrigationResult | null>(null);

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
      case 'Low Risk': return '#10b981';
      case 'Medium Risk': return '#f59e0b';
      case 'High Risk': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getHealthColor = (status: string): string => {
    switch (status) {
      case 'Excellent':
      case 'Healthy': return '#10b981';
      case 'Poor': return '#f59e0b';
      case 'Critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="irrigation-wrapper">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap');

        .irrigation-wrapper {
          min-height: 100vh;
          background: #0a0e27;
          position: relative;
          overflow-x: hidden;
          font-family: 'Outfit', sans-serif;
        }

        /* Animated background */
        .irrigation-wrapper::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
          animation: pulse 15s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        /* Floating particles */
        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(16, 185, 129, 0.3);
          border-radius: 50%;
          animation: float-particle 20s infinite;
        }

        .particle:nth-child(1) { left: 10%; animation-delay: 0s; }
        .particle:nth-child(2) { left: 20%; animation-delay: 2s; }
        .particle:nth-child(3) { left: 30%; animation-delay: 4s; }
        .particle:nth-child(4) { left: 40%; animation-delay: 1s; }
        .particle:nth-child(5) { left: 50%; animation-delay: 3s; }
        .particle:nth-child(6) { left: 60%; animation-delay: 5s; }
        .particle:nth-child(7) { left: 70%; animation-delay: 2.5s; }
        .particle:nth-child(8) { left: 80%; animation-delay: 4.5s; }
        .particle:nth-child(9) { left: 90%; animation-delay: 1.5s; }

        @keyframes float-particle {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) scale(1); opacity: 0; }
        }

        .container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 40px 20px;
          position: relative;
          z-index: 2;
        }

        /* Hero Header */
        .hero-header {
          text-align: center;
          margin-bottom: 60px;
          position: relative;
        }

        /* LOGO STYLES - NEW */
        .hero-logo {
          display: block;
          margin: 0 auto 10px;
          width: 150px;
          height: auto;
          filter: drop-shadow(0 0 30px rgba(16, 185, 129, 0.6));
          animation: logoFloat 4s ease-in-out infinite;
        }
      
        .hero-logo img {
          width: 140px;   /* adjust this value until it feels right */
          height: auto;
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }

        .hero-title {
          font-size: 5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 20px 0;
          letter-spacing: -3px;
          text-transform: uppercase;
          animation: glow 3s ease-in-out infinite;
          font-family: 'Space Grotesk', sans-serif;
        }

        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.5)); }
          50% { filter: drop-shadow(0 0 40px rgba(59, 130, 246, 0.8)); }
        }

        .hero-subtitle {
          font-size: 1.5rem;
          color: #94a3b8;
          font-weight: 400;
          max-width: 700px;
          margin: 0 auto;
        }

        /* Dashboard Grid */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }

        /* Neon Card Style */
        .neon-card {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 24px;
          padding: 40px;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .neon-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #10b981, transparent);
          animation: scan 3s linear infinite;
        }

        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .neon-card:hover {
          transform: translateY(-8px);
          border-color: rgba(16, 185, 129, 0.5);
          box-shadow: 0 20px 60px rgba(16, 185, 129, 0.3);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
        }

        .card-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 16px;
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
        }

        .card-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #fff;
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
        }

        /* Custom Input Styles */
        .input-wrapper {
          margin-bottom: 25px;
        }

        .input-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #94a3b8;
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .cyber-input {
          width: 100%;
          background: rgba(30, 41, 59, 0.5);
          border: 2px solid rgba(16, 185, 129, 0.3);
          border-radius: 12px;
          padding: 16px 20px;
          color: #fff;
          font-size: 1.1rem;
          font-weight: 600;
          font-family: 'Outfit', sans-serif;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .cyber-input:focus {
          outline: none;
          border-color: #10b981;
          background: rgba(30, 41, 59, 0.8);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(16, 185, 129, 0.1);
        }

        .cyber-input::placeholder {
          color: #475569;
        }

        .input-hint {
          font-size: 0.85rem;
          color: #64748b;
          margin-top: 6px;
          font-style: italic;
        }

        /* Slider styling */
        .cyber-input[type="range"] {
          padding: 0;
          height: 8px;
          background: linear-gradient(90deg, #1e293b 0%, #10b981 100%);
          border-radius: 10px;
          cursor: pointer;
        }

        /* Action Button */
        .action-button {
          width: 100%;
          background: linear-gradient(135deg, #10b981, #3b82f6);
          border: none;
          border-radius: 16px;
          padding: 24px;
          font-size: 1.4rem;
          font-weight: 800;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 2px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          font-family: 'Space Grotesk', sans-serif;
          box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4);
        }

        .action-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .action-button:hover::before {
          left: 100%;
        }

        .action-button:hover {
          transform: scale(1.02);
          box-shadow: 0 15px 50px rgba(16, 185, 129, 0.6);
        }

        .action-button:active {
          transform: scale(0.98);
        }

        /* Results Section */
        .results-section {
          margin-top: 50px;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
        }

        /* Giant Irrigation Display */
        .irrigation-display {
          grid-column: 1 / -1;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
          backdrop-filter: blur(20px);
          border: 2px solid rgba(16, 185, 129, 0.3);
          border-radius: 32px;
          padding: 60px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .irrigation-display::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: repeating-conic-gradient(
            from 0deg,
            transparent 0deg 10deg,
            rgba(16, 185, 129, 0.03) 10deg 20deg
          );
          animation: rotate 30s linear infinite;
        }

        @keyframes rotate {
          100% { transform: rotate(360deg); }
        }

        .irrigation-label {
          font-size: 2rem;
          font-weight: 700;
          color: #10b981;
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }

        .irrigation-value {
          font-size: 8rem;
          font-weight: 900;
          background: linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin: 20px 0;
          position: relative;
          z-index: 1;
          font-family: 'Space Grotesk', sans-serif;
          text-shadow: 0 0 80px rgba(16, 185, 129, 0.5);
        }

        .risk-badge {
          display: inline-block;
          padding: 12px 30px;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          position: relative;
          z-index: 1;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        }

        /* Info Cards */
        .info-card {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(100, 116, 139, 0.2);
          border-radius: 24px;
          padding: 35px;
          transition: all 0.3s ease;
        }

        .info-card:hover {
          border-color: rgba(16, 185, 129, 0.4);
          box-shadow: 0 15px 40px rgba(16, 185, 129, 0.2);
        }

        .info-card-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #fff;
          margin: 0 0 25px 0;
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Space Grotesk', sans-serif;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid rgba(100, 116, 139, 0.2);
        }

        .stat-row:last-child {
          border-bottom: none;
        }

        .stat-label {
          color: #94a3b8;
          font-size: 1rem;
          font-weight: 500;
        }

        .stat-value {
          color: #fff;
          font-size: 1.3rem;
          font-weight: 700;
        }

        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Alert Boxes */
        .alert-box {
          background: rgba(239, 68, 68, 0.1);
          border: 2px solid rgba(239, 68, 68, 0.3);
          border-radius: 16px;
          padding: 20px 25px;
          margin: 20px 0;
        }

        .alert-box.warning {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.3);
        }

        .alert-box.success {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .alert-title {
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .alert-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .alert-list li {
          padding: 8px 0;
          padding-left: 24px;
          position: relative;
          color: #cbd5e1;
          line-height: 1.6;
        }

        .alert-list li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: 700;
        }

        /* History inputs */
        .history-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-top: 15px;
        }

        .history-item {
          text-align: center;
        }

        .history-label {
          display: block;
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .history-input {
          width: 100%;
          background: rgba(30, 41, 59, 0.5);
          border: 2px solid rgba(16, 185, 129, 0.2);
          border-radius: 10px;
          padding: 12px;
          color: #fff;
          font-size: 1.1rem;
          font-weight: 700;
          text-align: center;
          font-family: 'Outfit', sans-serif;
          box-sizing: border-box;
        }

        .history-input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .results-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 3rem;
          }
          .hero-logo {
            display: flex;
            justify-content: center;
            margin: 0 auto 16px;
          }
          .irrigation-value {
            font-size: 5rem;
          }
          .card-title {
            font-size: 1.4rem;
          }
          .history-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Floating particles */}
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <div className="container">
        {/* Hero Header WITH LOGO */}
        <div className="hero-header">
          {/* LOGO - Place your logo.png in public/ folder */}
          <div className="hero-logo">
            <img src="/logo.png" alt="Plantelligence Logo" />
          </div>
          <h1 className="hero-title">Plantelligence</h1>
          <p className="hero-subtitle">
            Precision irrigation powered by advanced analytics
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Plant Information */}
          <div className="neon-card">
            <div className="card-header">
              <div className="card-icon">🌱</div>
              <h3 className="card-title">Plant Profile</h3>
            </div>

            <div className="input-wrapper">
              <label className="input-label">Crop Type</label>
              <select
                className="cyber-input"
                value={cropType}
                onChange={(e) => setCropType(e.target.value as CropType)}
              >
                <option value="lettuce">🥬 Lettuce</option>
                <option value="okra">🫛 Okra</option>
                <option value="tomato">🍅 Tomato</option>
              </select>
            </div>

            <div className="input-wrapper">
              <label className="input-label">Days Since Planting</label>
              <input
                type="number"
                className="cyber-input"
                value={daysSincePlanting}
                onChange={(e) => setDaysSincePlanting(parseInt(e.target.value) || 0)}
                min="1"
                max="365"
              />
              <div className="input-hint">Plant age affects water sensitivity</div>
            </div>
          </div>

          {/* Environmental Sensors */}
          <div className="neon-card">
            <div className="card-header">
              <div className="card-icon">🌡️</div>
              <h3 className="card-title">Environmental Sensors</h3>
            </div>

            <div className="input-wrapper">
              <label className="input-label">💧 Soil Moisture ({soilMoisture}%)</label>
              <input
                type="range"
                className="cyber-input"
                value={soilMoisture}
                onChange={(e) => setSoilMoisture(parseFloat(e.target.value))}
                min="0"
                max="100"
                step="1"
              />
            </div>

            <div className="input-wrapper">
              <label className="input-label">💨 Humidity ({humidity}%)</label>
              <input
                type="range"
                className="cyber-input"
                value={humidity}
                onChange={(e) => setHumidity(parseFloat(e.target.value))}
                min="0"
                max="100"
                step="1"
              />
            </div>

            <div className="input-wrapper">
              <label className="input-label">🌡️ Temperature ({temperature}°C)</label>
              <input
                type="range"
                className="cyber-input"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                min="10"
                max="40"
                step="1"
              />
            </div>
          </div>

          {/* Weather Forecast */}
          <div className="neon-card">
            <div className="card-header">
              <div className="card-icon">🌦️</div>
              <h3 className="card-title">Weather Forecast</h3>
            </div>

            <div className="input-wrapper">
              <label className="input-label">⛈️ Rain Probability 24hr ({rainChance}%)</label>
              <input
                type="range"
                className="cyber-input"
                value={rainChance}
                onChange={(e) => setRainChance(parseFloat(e.target.value))}
                min="0"
                max="100"
                step="1"
              />
              <div className="input-hint">
                {rainChance > 50 ? 'High chance - reduce irrigation' : rainChance > 20 ? 'Moderate chance' : 'Low chance - proceed normally'}
              </div>
            </div>
          </div>

          {/* Irrigation History */}
          <div className="neon-card">
            <div className="card-header">
              <div className="card-icon">📊</div>
              <h3 className="card-title">Irrigation History</h3>
            </div>

            <div className="input-wrapper">
              <label className="input-label">Recent Applications (%)</label>
              <div className="history-grid">
                <div className="history-item">
                  <span className="history-label">Today</span>
                  <input
                    type="number"
                    className="history-input"
                    value={irrigationHistory[0]}
                    onChange={(e) => handleIrrigationHistoryChange(0, e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="history-item">
                  <span className="history-label">Yesterday</span>
                  <input
                    type="number"
                    className="history-input"
                    value={irrigationHistory[1]}
                    onChange={(e) => handleIrrigationHistoryChange(1, e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="history-item">
                  <span className="history-label">2 Days Ago</span>
                  <input
                    type="number"
                    className="history-input"
                    value={irrigationHistory[2]}
                    onChange={(e) => handleIrrigationHistoryChange(2, e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button className="action-button" onClick={calculateRecommendation}>
          ⚡ Calculate Irrigation Plan
        </button>

        {/* Results Section */}
        {irrigationResult && plantHealth && (
          <div className="results-section">
            {/* Giant Irrigation Display */}
            <div className="irrigation-display">
              <div className="irrigation-label">{irrigationResult.label}</div>
              <div className="irrigation-value">{irrigationResult.level.toFixed(1)}%</div>
              <div
                className="risk-badge"
                style={{
                  background: getRiskColor(irrigationResult.riskLevel),
                  color: '#fff',
                }}
              >
                {irrigationResult.riskLevel}
              </div>
            </div>

            <div className="results-grid">
              {/* Water Usage */}
              <div className="info-card">
                <h4 className="info-card-title">
                  <span>💧</span> Water Requirements
                </h4>
                <div className="stat-row">
                  <span className="stat-label">Total Volume</span>
                  <span className="stat-value">{irrigationResult.estimatedLiters?.toFixed(0) || '0'} mL</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Per Plant</span>
                  <span className="stat-value">{irrigationResult.mlPerPlant?.toFixed(0) || '0'} mL</span>
                </div>
              </div>

              {/* Plant Health */}
              <div className="info-card">
                <h4 className="info-card-title">
                  <span>🏥</span> Plant Health
                </h4>
                <div className="stat-row">
                  <span className="stat-label">Health Score</span>
                  <span className="stat-value">{plantHealth.score.toFixed(1)}/100</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Status</span>
                  <span
                    className="status-badge"
                    style={{
                      background: getHealthColor(plantHealth.status),
                      color: '#fff',
                    }}
                  >
                    {plantHealth.status}
                  </span>
                </div>

                {plantHealth.issues.length > 0 && (
                  <div className="alert-box" style={{ marginTop: '20px' }}>
                    <div className="alert-title" style={{ color: '#ef4444' }}>
                      ⚠️ Health Concerns
                    </div>
                    <ul className="alert-list">
                      {plantHealth.issues.map((issue: string, index: number) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Environmental Summary */}
              <div className="info-card">
                <h4 className="info-card-title">
                  <span>🌍</span> Current Conditions
                </h4>
                <div className="stat-row">
                  <span className="stat-label">Soil Moisture</span>
                  <span className="stat-value">{soilMoisture}%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Humidity</span>
                  <span className="stat-value">{humidity}%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Temperature</span>
                  <span className="stat-value">{temperature}°C</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Rain Forecast</span>
                  <span className="stat-value">{rainChance}%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Crop Type</span>
                  <span className="stat-value">{cropType.charAt(0).toUpperCase() + cropType.slice(1)}</span>
                </div>
              </div>

              {/* Safety & Recommendations */}
              <div className="info-card">
                <h4 className="info-card-title">
                  <span>🛡️</span> Safety Analysis
                </h4>
                <div
                  className={`alert-box ${
                    irrigationResult.safetyMessage.includes('✅')
                      ? 'success'
                      : irrigationResult.safetyMessage.includes('⚠️')
                      ? 'warning'
                      : ''
                  }`}
                  style={{ marginTop: 0 }}
                >
                  <div
                    className="alert-title"
                    style={{
                      color: irrigationResult.safetyMessage.includes('✅')
                        ? '#10b981'
                        : irrigationResult.safetyMessage.includes('⚠️')
                        ? '#f59e0b'
                        : '#ef4444',
                    }}
                  >
                    {irrigationResult.safetyMessage}
                  </div>
                </div>

                <div className="alert-box warning" style={{ marginTop: '20px' }}>
                  <div className="alert-title" style={{ color: '#f59e0b' }}>
                    💡 Recommendations
                  </div>
                  <ul className="alert-list">
                    {soilMoisture > 80 && (
                      <>
                        <li>Improve drainage to prevent waterlogging</li>
                        <li>Monitor for root rot or fungal diseases</li>
                      </>
                    )}
                    {soilMoisture < 25 && (
                      <>
                        <li>Verify irrigation system delivery</li>
                        <li>Apply mulch to retain moisture</li>
                      </>
                    )}
                    {calculateRecentIrrigationScore(irrigationHistory) > 70 && (
                      <>
                        <li>Reduce frequency for 2-3 days</li>
                        <li>Watch for over-watering symptoms</li>
                      </>
                    )}
                    {plantHealth.score < 60 && (
                      <>
                        <li>Inspect for pests and diseases</li>
                        <li>Adjust schedule based on observation</li>
                      </>
                    )}
                    {irrigationResult.safetyMessage.includes('✅') && plantHealth.score >= 70 && (
                      <li>Optimal conditions - maintain current plan</li>
                    )}
                    <li>Cross-reference with physical inspection</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartIrrigationSystem;
