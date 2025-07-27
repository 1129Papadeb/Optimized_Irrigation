class FuzzyLogic {
  // Triangular membership function
  static trimf(x: number, points: [number, number, number]): number {
    const [a, b, c] = points;
    if (x <= a || x >= c) return 0;
    if (x === b) return 1;
    if (x < b) return (x - a) / (b - a);
    return (c - x) / (c - b);
  }

  // Membership functions for soil moisture
  static soilMembership = {
    dry: (x: number) => this.trimf(x, [0, 0, 40]),
    moist: (x: number) => this.trimf(x, [30, 50, 70]),
    wet: (x: number) => this.trimf(x, [60, 85, 100]),
    saturated: (x: number) => this.trimf(x, [85, 100, 100])
  };

  // Membership functions for humidity
  static humidityMembership = {
    low: (x: number) => this.trimf(x, [0, 0, 50]),
    medium: (x: number) => this.trimf(x, [30, 50, 70]),
    high: (x: number) => this.trimf(x, [60, 100, 100])
  };

  // Membership functions for temperature
  static temperatureMembership = {
    low: (x: number) => this.trimf(x, [10, 15, 20]),
    medium: (x: number) => this.trimf(x, [18, 25, 32]),
    high: (x: number) => this.trimf(x, [30, 40, 40])
  };

  // Membership functions for forecast
  static forecastMembership = {
    dry: (x: number) => this.trimf(x, [0, 0, 40]),
    cloudy: (x: number) => this.trimf(x, [30, 50, 70]),
    rain: (x: number) => this.trimf(x, [60, 100, 100])
  };

  // Membership functions for plant health
  static plantHealthMembership = {
    critical: (x: number) => this.trimf(x, [0, 0, 30]),
    poor: (x: number) => this.trimf(x, [20, 40, 60]),
    healthy: (x: number) => this.trimf(x, [50, 75, 90]),
    excellent: (x: number) => this.trimf(x, [80, 100, 100])
  };

  // Membership functions for recent irrigation
  static recentIrrigationMembership = {
    none: (x: number) => this.trimf(x, [0, 0, 20]),
    light: (x: number) => this.trimf(x, [10, 30, 50]),
    moderate: (x: number) => this.trimf(x, [40, 60, 80]),
    heavy: (x: number) => this.trimf(x, [70, 100, 100])
  };

  // Output membership functions for irrigation
  static irrigationMembership = {
    none: (x: number) => this.trimf(x, [0, 0, 20]),
    light: (x: number) => this.trimf(x, [10, 25, 40]),
    moderate: (x: number) => this.trimf(x, [35, 50, 65]),
    heavy: (x: number) => this.trimf(x, [60, 80, 100])
  };

  // Fuzzy rules implementation
  static evaluateRules(inputs: {
    soil: number;
    humidity: number;
    temperature: number;
    forecast: number;
    plantHealth: number;
    recentIrrigation: number;
  }): number {
    const { soil, humidity, temperature, forecast, plantHealth, recentIrrigation } = inputs;

    // Get membership values
    const soilVals = {
      dry: this.soilMembership.dry(soil),
      moist: this.soilMembership.moist(soil),
      wet: this.soilMembership.wet(soil),
      saturated: this.soilMembership.saturated(soil)
    };

    const humidityVals = {
      low: this.humidityMembership.low(humidity),
      medium: this.humidityMembership.medium(humidity),
      high: this.humidityMembership.high(humidity)
    };

    const tempVals = {
      low: this.temperatureMembership.low(temperature),
      medium: this.temperatureMembership.medium(temperature),
      high: this.temperatureMembership.high(temperature)
    };

    const forecastVals = {
      dry: this.forecastMembership.dry(forecast),
      cloudy: this.forecastMembership.cloudy(forecast),
      rain: this.forecastMembership.rain(forecast)
    };

    const healthVals = {
      critical: this.plantHealthMembership.critical(plantHealth),
      poor: this.plantHealthMembership.poor(plantHealth),
      healthy: this.plantHealthMembership.healthy(plantHealth),
      excellent: this.plantHealthMembership.excellent(plantHealth)
    };

    const recentVals = {
      none: this.recentIrrigationMembership.none(recentIrrigation),
      light: this.recentIrrigationMembership.light(recentIrrigation),
      moderate: this.recentIrrigationMembership.moderate(recentIrrigation),
      heavy: this.recentIrrigationMembership.heavy(recentIrrigation)
    };

    // Define fuzzy rules and their outputs
    const rules = [
      // Over-irrigation protection rules (highest priority)
      { strength: soilVals.saturated, output: 0 },
      { strength: Math.min(soilVals.wet, recentVals.heavy), output: 0 },
      { strength: Math.min(soilVals.wet, recentVals.moderate, healthVals.poor), output: 0 },
      { strength: Math.min(healthVals.critical, soilVals.wet), output: 0 },
      { strength: Math.min(recentVals.heavy, humidityVals.high), output: 0 },

      // Standard irrigation rules
      { strength: Math.min(soilVals.dry, tempVals.high, forecastVals.dry, healthVals.healthy), output: 80 },
      { strength: Math.min(soilVals.dry, tempVals.high, forecastVals.dry, healthVals.poor), output: 50 },
      { strength: Math.min(soilVals.moist, humidityVals.medium, forecastVals.dry, healthVals.healthy), output: 50 },
      { strength: Math.min(soilVals.moist, humidityVals.medium, forecastVals.cloudy), output: 25 },
      { strength: forecastVals.rain, output: 0 },
      { strength: Math.min(humidityVals.low, soilVals.dry, healthVals.healthy), output: 50 },
      { strength: Math.min(tempVals.low, soilVals.moist), output: 25 },

      // Plant health considerations
      { strength: Math.min(healthVals.critical, soilVals.dry), output: 25 },
      { strength: Math.min(healthVals.excellent, soilVals.moist), output: 25 },

      // Recent irrigation considerations
      { strength: Math.min(recentVals.heavy, soilVals.moist), output: 0 },
      { strength: Math.min(recentVals.moderate, soilVals.wet), output: 0 },
      { strength: Math.min(recentVals.none, soilVals.dry, healthVals.healthy), output: 50 }
    ];

    // Weighted average defuzzification
    let numerator = 0;
    let denominator = 0;

    rules.forEach(rule => {
      numerator += rule.strength * rule.output;
      denominator += rule.strength;
    });

    return denominator > 0 ? numerator / denominator : 0;
  }
}

export default FuzzyLogic;