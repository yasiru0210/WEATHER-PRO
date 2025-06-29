// Weather API service for fetching weather data
class WeatherAPI {
  constructor() {
    this.baseUrl = CONFIG.WEATHER_API.BASE_URL;
    this.apiKey = CONFIG.WEATHER_API.KEY;
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  /**
   * Make API request with caching
   * @param {string} endpoint - API endpoint
   * @param {object} params - Query parameters
   * @returns {Promise} API response
   */
  async makeRequest(endpoint, params = {}) {
    const queryParams = new URLSearchParams({
      key: this.apiKey,
      ...params
    });
    
    const url = `${this.baseUrl}${endpoint}?${queryParams}`;
    const cacheKey = url;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the response
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  }

  /**
   * Get current weather for a location
   * @param {string} location - Location query (city name, coordinates, etc.)
   * @returns {Promise} Current weather data
   */
  async getCurrentWeather(location) {
    try {
      const data = await this.makeRequest(CONFIG.WEATHER_API.ENDPOINTS.CURRENT, {
        q: location,
        aqi: 'yes'
      });
      
      return this.formatCurrentWeather(data);
    } catch (error) {
      throw new Error(`Failed to get current weather: ${error.message}`);
    }
  }

  /**
   * Get weather forecast for a location
   * @param {string} location - Location query
   * @param {number} days - Number of forecast days (1-10)
   * @returns {Promise} Forecast data
   */
  async getForecast(location, days = 7) {
    try {
      const data = await this.makeRequest(CONFIG.WEATHER_API.ENDPOINTS.FORECAST, {
        q: location,
        days: Math.min(days, 10),
        aqi: 'yes',
        alerts: 'yes'
      });
      
      return this.formatForecast(data);
    } catch (error) {
      throw new Error(`Failed to get forecast: ${error.message}`);
    }
  }

  /**
   * Search for locations
   * @param {string} query - Search query
   * @returns {Promise} Array of location suggestions
   */
  async searchLocations(query) {
    try {
      const data = await this.makeRequest(CONFIG.WEATHER_API.ENDPOINTS.SEARCH, {
        q: query
      });
      
      return data.map(location => ({
        id: `${location.lat},${location.lon}`,
        name: location.name,
        region: location.region,
        country: location.country,
        lat: location.lat,
        lon: location.lon,
        displayName: `${location.name}, ${location.region}, ${location.country}`
      }));
    } catch (error) {
      console.error('Location search failed:', error);
      return [];
    }
  }

  /**
   * Get historical weather data
   * @param {string} location - Location query
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise} Historical weather data
   */
  async getHistoricalWeather(location, date) {
    try {
      const data = await this.makeRequest(CONFIG.WEATHER_API.ENDPOINTS.HISTORY, {
        q: location,
        dt: date
      });
      
      return this.formatHistoricalWeather(data);
    } catch (error) {
      throw new Error(`Failed to get historical weather: ${error.message}`);
    }
  }

  /**
   * Format current weather data
   * @param {object} data - Raw API data
   * @returns {object} Formatted current weather data
   */
  formatCurrentWeather(data) {
    const { location, current } = data;
    
    return {
      location: {
        name: location.name,
        region: location.region,
        country: location.country,
        lat: location.lat,
        lon: location.lon,
        timezone: location.tz_id,
        localtime: location.localtime
      },
      current: {
        temperature: current.temp_c,
        feelsLike: current.feelslike_c,
        condition: current.condition.text,
        conditionIcon: current.condition.icon,
        conditionCode: current.condition.code,
        humidity: current.humidity,
        windSpeed: current.wind_kph,
        windDirection: current.wind_dir,
        windDegree: current.wind_degree,
        pressure: current.pressure_mb,
        visibility: current.vis_km,
        uvIndex: current.uv,
        isDay: current.is_day === 1,
        lastUpdated: current.last_updated
      },
      airQuality: current.air_quality ? {
        co: current.air_quality.co,
        no2: current.air_quality.no2,
        o3: current.air_quality.o3,
        so2: current.air_quality.so2,
        pm2_5: current.air_quality.pm2_5,
        pm10: current.air_quality.pm10,
        usEpaIndex: current.air_quality['us-epa-index'],
        gbDefraIndex: current.air_quality['gb-defra-index']
      } : null
    };
  }

  /**
   * Format forecast data
   * @param {object} data - Raw API data
   * @returns {object} Formatted forecast data
   */
  formatForecast(data) {
    const { location, current, forecast, alerts } = data;
    
    return {
      location: {
        name: location.name,
        region: location.region,
        country: location.country,
        lat: location.lat,
        lon: location.lon,
        timezone: location.tz_id,
        localtime: location.localtime
      },
      current: this.formatCurrentWeather(data).current,
      airQuality: this.formatCurrentWeather(data).airQuality,
      forecast: {
        daily: forecast.forecastday.map(day => ({
          date: day.date,
          dateEpoch: day.date_epoch,
          day: {
            maxTemp: day.day.maxtemp_c,
            minTemp: day.day.mintemp_c,
            avgTemp: day.day.avgtemp_c,
            condition: day.day.condition.text,
            conditionIcon: day.day.condition.icon,
            conditionCode: day.day.condition.code,
            maxWind: day.day.maxwind_kph,
            totalPrecipitation: day.day.totalprecip_mm,
            avgHumidity: day.day.avghumidity,
            chanceOfRain: day.day.daily_chance_of_rain,
            chanceOfSnow: day.day.daily_chance_of_snow,
            uvIndex: day.day.uv
          },
          astro: {
            sunrise: day.astro.sunrise,
            sunset: day.astro.sunset,
            moonrise: day.astro.moonrise,
            moonset: day.astro.moonset,
            moonPhase: day.astro.moon_phase,
            moonIllumination: day.astro.moon_illumination
          },
          hourly: day.hour.map(hour => ({
            time: hour.time,
            timeEpoch: hour.time_epoch,
            temperature: hour.temp_c,
            feelsLike: hour.feelslike_c,
            condition: hour.condition.text,
            conditionIcon: hour.condition.icon,
            conditionCode: hour.condition.code,
            windSpeed: hour.wind_kph,
            windDirection: hour.wind_dir,
            windDegree: hour.wind_degree,
            pressure: hour.pressure_mb,
            humidity: hour.humidity,
            visibility: hour.vis_km,
            uvIndex: hour.uv,
            chanceOfRain: hour.chance_of_rain,
            chanceOfSnow: hour.chance_of_snow,
            isDay: hour.is_day === 1
          }))
        }))
      },
      alerts: alerts?.alert?.map(alert => ({
        headline: alert.headline,
        msgType: alert.msgtype,
        severity: alert.severity,
        urgency: alert.urgency,
        areas: alert.areas,
        category: alert.category,
        certainty: alert.certainty,
        event: alert.event,
        note: alert.note,
        effective: alert.effective,
        expires: alert.expires,
        description: alert.desc,
        instruction: alert.instruction
      })) || []
    };
  }

  /**
   * Format historical weather data
   * @param {object} data - Raw API data
   * @returns {object} Formatted historical weather data
   */
  formatHistoricalWeather(data) {
    const { location, forecast } = data;
    const day = forecast.forecastday[0];
    
    return {
      location: {
        name: location.name,
        region: location.region,
        country: location.country,
        lat: location.lat,
        lon: location.lon
      },
      date: day.date,
      day: {
        maxTemp: day.day.maxtemp_c,
        minTemp: day.day.mintemp_c,
        avgTemp: day.day.avgtemp_c,
        condition: day.day.condition.text,
        conditionIcon: day.day.condition.icon,
        maxWind: day.day.maxwind_kph,
        totalPrecipitation: day.day.totalprecip_mm,
        avgHumidity: day.day.avghumidity
      },
      hourly: day.hour.map(hour => ({
        time: hour.time,
        temperature: hour.temp_c,
        condition: hour.condition.text,
        conditionIcon: hour.condition.icon,
        windSpeed: hour.wind_kph,
        humidity: hour.humidity,
        pressure: hour.pressure_mb
      }))
    };
  }

  /**
   * Clear API cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache size
   * @returns {number} Number of cached items
   */
  getCacheSize() {
    return this.cache.size;
  }
}

// Create global instance
const weatherAPI = new WeatherAPI();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WeatherAPI;
}