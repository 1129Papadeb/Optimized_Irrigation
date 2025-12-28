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

  // Safety overrides
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

  // Clamp 0–100
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

  // Crop + stage specific water estimation (per plant, in mL)
  const stage = FuzzyLogic.getGrowthStage(inputs.daysSincePlanting, inputs.cropType);
  const cropFactor = FuzzyLogic.getCropFactor(inputs.cropType, stage);

  // Spacing:
  // - Area per plant: 50 x 50 cm
  // - Area per crop row: 50 x 150 cm  → 3 plants per crop row
  // - We have 3 crops  → 3 * 3 = 9 plants total
// AFTER – 1 crop selected in the UI
const plantsPerCrop = 150 / 50; // 3 plants in that 50×150 cm row
const totalPlants = plantsPerCrop; // 3 plants total


// mL per plant based on fuzzy level and crop max
const rawMlPerPlant = (adjustedLevel / 100) * cropFactor.maxML;

// Global realism scaling (tune between 0.3–0.8)
const scalingFactor = 0.8;
const mlPerPlant = rawMlPerPlant * scalingFactor;

const totalML = mlPerPlant * totalPlants;

  return {
    level: adjustedLevel,
    label,
    riskLevel,
    // Note: field name kept as estimatedLiters for compatibility, but value is mL
    estimatedLiters: Number(totalML.toFixed(0)), // mL total, rounded
    safetyMessage,
    rawLevel,
    mlPerPlant: Number(mlPerPlant.toFixed(0)),
  };
}
