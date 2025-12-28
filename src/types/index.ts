// src/types/index.ts

// Type for the raw data structure directly from OpenWeatherMap API
export interface OpenWeatherMapCurrentData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number; // Optional
    grnd_level?: number; // Optional
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number; // Optional
  };
  rain?: { '1h'?: number; '3h'?: number }; // Optional rain data
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}


// Type for the data structure that your getForecastRainChance function processes and returns
// This is what you store in your component's state
export interface ProcessedWeatherData {
  main: string; // e.g., "Rain", "Clouds"
  description: string; // e.g., "light rain", "overcast clouds"
  rain: number; // processed 1h rain volume, defaults to 0
  cloudiness: number; // processed cloudiness, defaults to 0
  temperature: number; // processed temperature, defaults to 25
  humidity: number; // processed humidity, defaults to 60
}


// Your existing types:
export interface PlantHealthData {
  score: number;
  status: string;
  issues: string[];
}

// types/index.ts
export interface IrrigationResult {
  level: number;
  label: string;
  riskLevel: string;
  estimatedLiters: number; // total mL
  safetyMessage: string;
  rawLevel: number;
  mlPerPlant: number;      // mL per plant
}


export interface FuzzyMembershipFunction {
  name: string;
  points: [number, number, number]; // This typically represents a triangular or trapezoidal membership function
}