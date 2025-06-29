// Configuration file for Weather Pro application
const CONFIG = {
  // Weather API configuration
  WEATHER_API: {
    KEY: 'edfa7945f1a74d22bf4115257242908',
    BASE_URL: 'https://api.weatherapi.com/v1',
    ENDPOINTS: {
      CURRENT: '/current.json',
      FORECAST: '/forecast.json',
      SEARCH: '/search.json',
      HISTORY: '/history.json',
      ALERTS: '/alerts.json'
    }
  },

  // Google Maps API configuration
  GOOGLE_MAPS: {
    KEY: 'YOUR_GOOGLE_MAPS_API_KEY_HERE' // Replace with your actual Google Maps API key
  },

  // Default settings
  DEFAULTS: {
    LOCATION: 'London',
    TEMPERATURE_UNIT: 'celsius',
    WIND_UNIT: 'kmh',
    PRESSURE_UNIT: 'hpa',
    THEME: 'auto',
    ANIMATIONS: true,
    WEATHER_ALERTS: true,
    DAILY_FORECAST: false
  },

  // Update intervals (in milliseconds)
  UPDATE_INTERVALS: {
    CURRENT_WEATHER: 10 * 60 * 1000, // 10 minutes
    FORECAST: 30 * 60 * 1000, // 30 minutes
    ALERTS: 5 * 60 * 1000 // 5 minutes
  },

  // Storage keys for localStorage
  STORAGE_KEYS: {
    SETTINGS: 'weather_pro_settings',
    LAST_LOCATION: 'weather_pro_last_location',
    FAVORITES: 'weather_pro_favorites'
  },

  // Weather condition icons mapping
  WEATHER_ICONS: {
    'clear': 'fas fa-sun',
    'sunny': 'fas fa-sun',
    'partly cloudy': 'fas fa-cloud-sun',
    'cloudy': 'fas fa-cloud',
    'overcast': 'fas fa-cloud',
    'mist': 'fas fa-smog',
    'fog': 'fas fa-smog',
    'rain': 'fas fa-cloud-rain',
    'drizzle': 'fas fa-cloud-drizzle',
    'snow': 'fas fa-snowflake',
    'sleet': 'fas fa-cloud-meatball',
    'thunderstorm': 'fas fa-bolt',
    'wind': 'fas fa-wind',
    'tornado': 'fas fa-tornado'
  },

  // Air Quality Index ranges
  AQI_RANGES: {
    GOOD: { min: 0, max: 50, color: '#10b981', label: 'Good' },
    MODERATE: { min: 51, max: 100, color: '#f59e0b', label: 'Moderate' },
    UNHEALTHY_SENSITIVE: { min: 101, max: 150, color: '#f97316', label: 'Unhealthy for Sensitive Groups' },
    UNHEALTHY: { min: 151, max: 200, color: '#ef4444', label: 'Unhealthy' },
    VERY_UNHEALTHY: { min: 201, max: 300, color: '#8b5cf6', label: 'Very Unhealthy' },
    HAZARDOUS: { min: 301, max: 500, color: '#7c2d12', label: 'Hazardous' }
  },

  // Animation durations
  ANIMATIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  }
};

// Export configuration for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}