export interface WeatherData {
  main: string;
  description: string;
  rain?: { '1h'?: number };
  clouds?: { all?: number };
}

export interface PlantHealthData {
  score: number;
  status: string;
  issues: string[];
}

export interface IrrigationResult {
  level: number;
  label: string;
  riskLevel: string;
  estimatedLiters: number;
  safetyMessage: string;
  rawLevel: number;
}

export interface FuzzyMembershipFunction {
  name: string;
  points: [number, number, number];
}