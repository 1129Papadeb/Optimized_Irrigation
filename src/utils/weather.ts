// Assuming this is your utils/weather.ts file
import { OpenWeatherMapCurrentData, ProcessedWeatherData } from '@/types/index'; // Import both types

export async function getForecastRainChance(
  apiKey: string,
  city: string = "Leon,Iloilo,PH"
): Promise<{
  rainChance: number;
  weatherData: ProcessedWeatherData | null;
}> {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    // Type assertion for the incoming data
    const data: OpenWeatherMapCurrentData = await response.json();

    if (!data.weather || !data.weather[0]) {
      throw new Error('Invalid weather data received');
    }

    const weatherMain = data.weather[0].main.toLowerCase();
    const weatherDesc = data.weather[0].description.toLowerCase();
    const rainVolume = data.rain?.['1h'] || 0; // Access rain volume safely
    const cloudiness = data.clouds?.all || 0; // Access cloudiness safely

    let rainChance: number;

    if (rainVolume > 0 || weatherMain.includes("rain")) {
      rainChance = 100; // Raining now
    } else if (weatherMain.includes("drizzle") || weatherDesc.includes("light rain")) {
      rainChance = 80; // Likely to rain
    } else if (cloudiness >= 70) {
      rainChance = 60; // Cloudy or overcast
    } else if (cloudiness >= 40) {
      rainChance = 40; // Partly cloudy
    } else {
      rainChance = 10; // Clear
    }

    return {
      rainChance,
      weatherData: {
        main: weatherMain,
        description: weatherDesc,
        rain: rainVolume,
        cloudiness,
        temperature: data.main?.temp || 25, // Use optional chaining for main.temp
        humidity: data.main?.humidity || 60 // Use optional chaining for main.humidity
      }
    };
  } catch (error) {
    console.error("Weather API error:", error);
    return {
      rainChance: 30, // Default fallback
      weatherData: null
    };
  }
}