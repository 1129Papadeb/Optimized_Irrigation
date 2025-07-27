import FuzzyLogic from './fuzzyLogic';
import type { IrrigationResult } from '@/types/index';

export function calculateIrrigation(inputs: {
  soil: number;
  humidity: number;
  temperature: number;
  forecast: number;
  plantHealth: number;
  recentIrrigation: number;
  cropType: string;
}): IrrigationResult {
  const rawLevel = FuzzyLogic.evaluateRules(inputs);

  // Crop sensitivity scaling
  const multiplier: { [key: string]: number } = {
    lettuce: 1.2,
    cabbage: 1.0,
    eggplant: 0.8
  };
  const cropMultiplier = multiplier[inputs.cropType.toLowerCase()] || 1.0;
  let adjustedLevel = rawLevel * cropMultiplier;

  // Safety overrides
  let safetyMessage = "✅ No safety concerns detected";

  if (inputs.soil > 85) {
    adjustedLevel = 0;
    safetyMessage = "🚨 SAFETY OVERRIDE: Soil is saturated - irrigation blocked to prevent plant death!";
  } else if (inputs.soil > 75 && inputs.recentIrrigation > 60) {
    adjustedLevel = Math.min(adjustedLevel, 20);
    safetyMessage = "⚠️ SAFETY LIMIT: Recent heavy irrigation detected - limiting water to prevent root rot!";
  } else if (inputs.plantHealth < 40 && inputs.soil > 60) {
    adjustedLevel = Math.min(adjustedLevel, 25);
    safetyMessage = "🏥 HEALTH PROTECTION: Plant health is poor - reducing irrigation to prevent further stress!";
  }

  adjustedLevel = Math.min(Math.max(adjustedLevel, 0), 100);

  // Determine irrigation label and risk level
  let label: string;
  let riskLevel: string;

  if (adjustedLevel <= 20) {
    label = "No Irrigation";
    riskLevel = "Low Risk";
  } else if (adjustedLevel <= 40) {
    label = "Light Irrigation";
    riskLevel = "Low Risk";
  } else if (adjustedLevel <= 65) {
    label = "Moderate Irrigation";
    riskLevel = inputs.soil > 60 ? "Medium Risk" : "Low Risk";
  } else {
    label = "Heavy Irrigation";
    riskLevel = inputs.soil > 50 || inputs.recentIrrigation > 40 ? "High Risk" : "Medium Risk";
  }

  // Calculate estimated water usage
  const areaM2 = 10;
  const waterPerPercent = 0.5;
  const estimatedLiters = adjustedLevel * waterPerPercent * areaM2;

  return {
    level: adjustedLevel,
    label,
    riskLevel,
    estimatedLiters,
    safetyMessage,
    rawLevel
  };
}