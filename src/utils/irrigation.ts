// utils/irrigation.ts

import FuzzyLogic, { CropType } from './fuzzyLogic';
import type { IrrigationResult } from '@/types/index';

export function calculateIrrigation(inputs: {
  soil: number;
  humidity: number;
  temperature: number;
  forecast: number;
  plantHealth: number;
  recentIrrigation: number;
  cropType: CropType;
  daysSincePlanting: number;
}): IrrigationResult {
  // FuzzyLogic returns a 0–100 irrigation level
  const rawLevel = FuzzyLogic.evaluateRules(inputs);

  let adjustedLevel = rawLevel;
  let safetyMessage = '✅ No safety concerns detected';

  if (inputs.soil > 85) {
    adjustedLevel = 0;
    safetyMessage =
      '🚨 SAFETY OVERRIDE: Soil is saturated - irrigation blocked to prevent plant death!';
  } else if (inputs.soil > 75 && inputs.recentIrrigation > 60) {
    adjustedLevel = Math.min(adjustedLevel, 20);
    safetyMessage =
      '⚠️ SAFETY LIMIT: Recent heavy irrigation detected - limiting water to prevent root rot!';
  } else if (inputs.plantHealth < 40 && inputs.soil > 60) {
    adjustedLevel = Math.min(adjustedLevel, 25);
    safetyMessage =
      '🏥 HEALTH PROTECTION: Plant health is poor - reducing irrigation to prevent further stress!';
  }

  adjustedLevel = Math.min(Math.max(adjustedLevel, 0), 100);

  let label: string;
  let riskLevel: string;

  if (adjustedLevel <= 20) {
    label = 'No Irrigation';
    riskLevel = 'Low Risk';
  } else if (adjustedLevel <= 40) {
    label = 'Light Irrigation';
    riskLevel = 'Low Risk';
  } else if (adjustedLevel <= 65) {
    label = 'Moderate Irrigation';
    riskLevel = inputs.soil > 60 ? 'Medium Risk' : 'Low Risk';
  } else {
    label = 'Heavy Irrigation';
    riskLevel =
      inputs.soil > 50 || inputs.recentIrrigation > 40 ? 'High Risk' : 'Medium Risk';
  }

  // Crop + stage specific water estimation (type-safe)
  const stage = FuzzyLogic.getGrowthStage(inputs.daysSincePlanting, inputs.cropType);
  const cropFactor = FuzzyLogic.getCropFactor(inputs.cropType, stage);

  let estimatedLiters: number;
  if (cropFactor) {
    // 2 plots, each 900 cm, 100 cm per plant → 9 plants/plot → 18 plants total
    const plantsPerPlot = 900 / 100; // 9
    const plots = 2;
    const totalPlants = plantsPerPlot * plots; // 18

    const mlPerPlant = (adjustedLevel / 100) * cropFactor.maxML;
    estimatedLiters = (mlPerPlant * totalPlants) / 1000; // mL → L
  } else {
    // Fallback: area-based calculation using real plot dimensions
    // Each plot: 900 cm (9 m) length, 125 cm (1.25 m) width
    const plots = 2;
    const plotLengthM = 900 / 100; // 9 m
    const plotWidthM = 125 / 100;  // 1.25 m
    const totalAreaM2 = plots * plotLengthM * plotWidthM; // 2 * 9 * 1.25 = 22.5 m²

    const waterPerPercent = 0.5; // L per % per m² (your existing heuristic)
    estimatedLiters = adjustedLevel * waterPerPercent * totalAreaM2;
  }

  return {
    level: adjustedLevel,
    label,
    riskLevel,
    estimatedLiters: Number(estimatedLiters.toFixed(2)),
    safetyMessage,
    rawLevel,
  };
}
