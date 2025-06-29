// Weather display management
class WeatherDisplay {
  constructor() {
    this.currentLocation = null;
    this.weatherData = null;
    this.settings = null;
    this.updateInterval = null;
    this.init();
  }

  /**
   * Initialize weather display
   */
  init() {
    this.loadSettings();
    this.setupEventListeners();
    this.loadLastLocation();
  }

  /**
   * Load user settings
   */
  loadSettings() {
    this.settings = Utils.loadFromStorage(CONFIG.STORAGE_KEYS.SETTINGS, CONFIG.DEFAULTS);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('location-search');
    const searchBtn = document.getElementById('search-btn');
    const locationBtn = document.getElementById('location-btn');

    if (searchInput) {
      // Debounced search as user types
      const debouncedSearch = Utils.debounce((query) => {
        if (query.length > 2) {
          this.showSearchSuggestions(query);
        } else {
          this.hideSearchSuggestions();
        }
      }, 300);

      searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
      });

      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.searchLocation(e.target.value);
        }
      });

      // Hide suggestions when clicking outside
      document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target)) {
          this.hideSearchSuggestions();
        }
      });
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        const query = searchInput?.value;
        if (query) {
          this.searchLocation(query);
        }
      });
    }

    if (locationBtn) {
      locationBtn.addEventListener('click', () => {
        this.getCurrentLocationWeather();
      });
    }
  }

  /**
   * Load last used location
   */
  loadLastLocation() {
    const lastLocation = Utils.loadFromStorage(CONFIG.STORAGE_KEYS.LAST_LOCATION);
    if (lastLocation) {
      this.loadWeatherData(lastLocation);
    } else {
      // Try to get current location or use default
      this.getCurrentLocationWeather().catch(() => {
        this.loadWeatherData(CONFIG.DEFAULTS.LOCATION);
      });
    }
  }

  /**
   * Search for location and load weather data
   * @param {string} query - Search query
   */
  async searchLocation(query) {
    try {
      Utils.showLoading(true);
      
      const locations = await weatherAPI.searchLocations(query);
      
      if (locations.length > 0) {
        const location = locations[0];
        await this.loadWeatherData(`${location.lat},${location.lon}`);
        this.hideSearchSuggestions();
        
        // Clear search input
        const searchInput = document.getElementById('location-search');
        if (searchInput) {
          searchInput.value = '';
        }
      } else {
        Utils.showToast('Location not found. Please try a different search term.', 'error');
      }
    } catch (error) {
      console.error('Search error:', error);
      Utils.showToast('Failed to search for location. Please try again.', 'error');
    } finally {
      Utils.showLoading(false);
    }
  }

  /**
   * Show search suggestions
   * @param {string} query - Search query
   */
  async showSearchSuggestions(query) {
    try {
      const locations = await weatherAPI.searchLocations(query);
      
      // Create or get suggestions container
      let suggestionsContainer = document.getElementById('search-suggestions');
      if (!suggestionsContainer) {
        suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'search-suggestions';
        suggestionsContainer.className = 'search-suggestions';
        
        const searchBox = document.querySelector('.search-box');
        if (searchBox) {
          searchBox.appendChild(suggestionsContainer);
        }
      }

      if (locations.length > 0) {
        suggestionsContainer.innerHTML = locations.slice(0, 5).map(location => `
          <div class="suggestion-item" data-location="${location.lat},${location.lon}">
            <i class="fas fa-map-marker-alt"></i>
            <span>${location.displayName}</span>
          </div>
        `).join('');

        // Add click handlers
        suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
          item.addEventListener('click', () => {
            const locationCoords = item.getAttribute('data-location');
            this.loadWeatherData(locationCoords);
            this.hideSearchSuggestions();
            
            // Clear search input
            const searchInput = document.getElementById('location-search');
            if (searchInput) {
              searchInput.value = '';
            }
          });
        });

        suggestionsContainer.style.display = 'block';
      } else {
        this.hideSearchSuggestions();
      }
    } catch (error) {
      console.error('Suggestions error:', error);
      this.hideSearchSuggestions();
    }
  }

  /**
   * Hide search suggestions
   */
  hideSearchSuggestions() {
    const suggestionsContainer = document.getElementById('search-suggestions');
    if (suggestionsContainer) {
      suggestionsContainer.style.display = 'none';
    }
  }

  /**
   * Get current location weather
   */
  async getCurrentLocationWeather() {
    try {
      Utils.showLoading(true);
      
      const coords = await Utils.getCurrentLocation();
      await this.loadWeatherData(`${coords.lat},${coords.lng}`);
      
      Utils.showToast('Location updated successfully', 'success');
    } catch (error) {
      console.error('Geolocation error:', error);
      Utils.showToast(error.message, 'error');
      
      // Load default location weather data as fallback
      try {
        await this.loadWeatherData(CONFIG.DEFAULTS.LOCATION);
      } catch (fallbackError) {
        console.error('Failed to load default location:', fallbackError);
        Utils.showToast('Failed to load weather data. Please try searching for a location.', 'error');
      }
    } finally {
      Utils.showLoading(false);
    }
  }

  /**
   * Load weather data for location
   * @param {string} location - Location query
   */
  async loadWeatherData(location) {
    try {
      Utils.showLoading(true);
      
      // Get current weather and forecast
      const [currentWeather, forecast] = await Promise.all([
        weatherAPI.getCurrentWeather(location),
        weatherAPI.getForecast(location, 7)
      ]);

      this.weatherData = forecast; // Forecast includes current weather
      this.currentLocation = location;

      // Save last location
      Utils.saveToStorage(CONFIG.STORAGE_KEYS.LAST_LOCATION, location);

      // Update displays
      this.updateCurrentWeatherDisplay();
      this.updateHourlyForecastDisplay();
      this.updateAstronomicalDisplay();
      
      // Update other sections if they're active
      if (window.forecastManager) {
        window.forecastManager.updateForecast(this.weatherData.forecast.daily);
      }

      // Start auto-refresh
      this.startAutoRefresh();

      Utils.showToast('Weather data updated', 'success');
    } catch (error) {
      console.error('Weather data error:', error);
      Utils.showToast('Failed to load weather data. Please try again.', 'error');
      
      // Show error in UI
      const container = document.querySelector('.weather-grid');
      if (container) {
        UIComponents.showError(error.message, container);
      }
    } finally {
      Utils.showLoading(false);
    }
  }

  /**
   * Update current weather display
   */
  updateCurrentWeatherDisplay() {
    if (!this.weatherData) return;

    UIComponents.updateCurrentWeather(this.weatherData, this.settings);
  }

  /**
   * Update hourly forecast display
   */
  updateHourlyForecastDisplay() {
    if (!this.weatherData?.forecast?.daily) return;

    // Get all hourly data from today and tomorrow
    const allHourlyData = [];
    this.weatherData.forecast.daily.slice(0, 2).forEach(day => {
      allHourlyData.push(...day.hourly);
    });

    UIComponents.updateHourlyForecast(allHourlyData, this.settings);
  }

  /**
   * Update astronomical information display
   */
  updateAstronomicalDisplay() {
    if (!this.weatherData?.forecast?.daily?.[0]?.astro) return;

    const astroData = this.weatherData.forecast.daily[0].astro;
    UIComponents.updateSunMoon(astroData);
  }

  /**
   * Refresh weather alerts
   */
  async refreshAlerts() {
    if (!this.currentLocation) return;

    try {
      const forecast = await weatherAPI.getForecast(this.currentLocation, 1);
      UIComponents.updateWeatherAlerts(forecast.alerts);
    } catch (error) {
      console.error('Failed to refresh alerts:', error);
    }
  }

  /**
   * Start auto-refresh timer
   */
  startAutoRefresh() {
    // Clear existing interval
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Set new interval
    this.updateInterval = setInterval(() => {
      if (this.currentLocation) {
        this.loadWeatherData(this.currentLocation);
      }
    }, CONFIG.UPDATE_INTERVALS.CURRENT_WEATHER);
  }

  /**
   * Stop auto-refresh timer
   */
  stopAutoRefresh() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Update settings and refresh display
   * @param {object} newSettings - New settings object
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    Utils.saveToStorage(CONFIG.STORAGE_KEYS.SETTINGS, this.settings);
    
    // Refresh displays with new settings
    if (this.weatherData) {
      this.updateCurrentWeatherDisplay();
      this.updateHourlyForecastDisplay();
    }
  }

  /**
   * Get current weather data
   * @returns {object} Current weather data
   */
  getCurrentWeatherData() {
    return this.weatherData;
  }

  /**
   * Get current location
   * @returns {string} Current location query
   */
  getCurrentLocation() {
    return this.currentLocation;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stopAutoRefresh();
  }
}

// Initialize weather display when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.weatherDisplay = new WeatherDisplay();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WeatherDisplay;
}