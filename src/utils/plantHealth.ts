import type { PlantHealthData } from '@/types/index';

export function assessPlantHealth(
  soilMoisture: number,
  recentWaterHistory: number,
  cropType: string,
  daysSincePlanting: number = 30
): PlantHealthData {
  let healthScore = 70; // Base health score
  const healthIssues: string[] = [];

  // Soil moisture impact on health
  if (soilMoisture > 90) {
    healthScore -= 40;
    healthIssues.push("Root rot risk", "Oxygen deficiency");
  } else if (soilMoisture > 80) {
    healthScore -= 25;
    healthIssues.push("Potential root damage", "Fungal risk");
  } else if (soilMoisture < 15) {
    healthScore -= 30;
    healthIssues.push("Drought stress", "Wilting risk");
  } else if (soilMoisture < 30) {
    healthScore -= 15;
    healthIssues.push("Water stress");
  }

  // Recent irrigation history impact
  if (recentWaterHistory > 80) {
    healthScore -= 20;
    healthIssues.push("Over-irrigation stress");
  }

  // Crop-specific adjustments
  const cropTolerance: { [key: string]: number } = {
    lettuce: 0.8,
    cabbage: 1.0,
    eggplant: 1.2
  };
  const tolerance = cropTolerance[cropType.toLowerCase()] || 1.0;
  healthScore = Math.min(100, healthScore * tolerance);

  // Age factor (young plants are more sensitive)
  if (daysSincePlanting < 14) {
    healthScore *= 0.9;
  }

  healthScore = Math.max(0, healthScore);

  // Determine health status
  let status: string;
  if (healthScore >= 80) {
    status = "Excellent";
  } else if (healthScore >= 60) {
    status = "Healthy";
  } else if (healthScore >= 40) {
    status = "Poor";
  } else {
    status = "Critical";
  }

  return {
    score: healthScore,
    status,
    issues: healthIssues
  };
}

export function calculateRecentIrrigationScore(irrigationHistory: number[]): number {
  if (!irrigationHistory || irrigationHistory.length === 0) {
    return 0;
  }

  // Weight recent irrigations (more recent = higher weight)
  const weights = [1.0, 0.7, 0.4]; // Today, yesterday, day before
  let totalScore = 0;
  let totalWeight = 0;

  for (let i = 0; i < irrigationHistory.length && i < 3; i++) {
    if (i < weights.length) {
      totalScore += irrigationHistory[i] * weights[i];
      totalWeight += weights[i];
    }
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0;
}