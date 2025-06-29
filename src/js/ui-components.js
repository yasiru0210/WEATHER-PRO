// UI Components and helper functions
const UIComponents = {
  /**
   * Create hourly forecast item
   * @param {object} hourData - Hour weather data
   * @param {object} settings - User settings
   * @returns {HTMLElement} Hourly forecast element
   */
  createHourlyItem(hourData, settings) {
    const item = document.createElement('div');
    item.className = 'hourly-item';
    
    const time = new Date(hourData.time);
    const isNow = Math.abs(time - new Date()) < 30 * 60 * 1000; // Within 30 minutes
    
    item.innerHTML = `
      <div class="hourly-time">${isNow ? 'Now' : Utils.formatDateTime(time, 'time')}</div>
      <div class="hourly-icon">
        <i class="${Utils.getWeatherIcon(hourData.condition, hourData.isDay)}"></i>
      </div>
      <div class="hourly-temp">${Utils.formatTemperature(hourData.temperature, settings.temperatureUnit)}</div>
      <div class="hourly-precipitation">${hourData.chanceOfRain}%</div>
    `;
    
    if (isNow) {
      item.classList.add('current-hour');
    }
    
    return item;
  },

  /**
   * Create daily forecast item
   * @param {object} dayData - Day weather data
   * @param {object} settings - User settings
   * @param {number} index - Day index (0 = today)
   * @returns {HTMLElement} Daily forecast element
   */
  createDailyItem(dayData, settings, index) {
    const item = document.createElement('div');
    item.className = 'forecast-item';
    
    const date = new Date(dayData.date);
    const dayName = index === 0 ? 'Today' : 
                   index === 1 ? 'Tomorrow' : 
                   date.toLocaleDateString([], { weekday: 'long' });
    
    const precipitation = Math.max(dayData.day.chanceOfRain, dayData.day.chanceOfSnow);
    
    item.innerHTML = `
      <div class="forecast-day-info">
        <div class="forecast-day">${dayName}</div>
        <div class="forecast-date">${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
      </div>
      <div class="forecast-icon">
        <i class="${Utils.getWeatherIcon(dayData.day.condition, true)}"></i>
      </div>
      <div class="forecast-condition">${dayData.day.condition}</div>
      <div class="forecast-temps">
        <span class="forecast-high">${Utils.formatTemperature(dayData.day.maxTemp, settings.temperatureUnit)}</span>
        <span class="forecast-low">${Utils.formatTemperature(dayData.day.minTemp, settings.temperatureUnit)}</span>
      </div>
      <div class="forecast-precipitation">
        <i class="fas fa-tint"></i>
        ${precipitation}%
      </div>
    `;
    
    return item;
  },

  /**
   * Create weather alert item
   * @param {object} alertData - Alert data
   * @returns {HTMLElement} Alert element
   */
  createAlertItem(alertData) {
    const item = document.createElement('div');
    item.className = `alert-item ${alertData.severity?.toLowerCase() === 'severe' ? 'severe' : ''}`;
    
    const effectiveDate = new Date(alertData.effective);
    const expiresDate = new Date(alertData.expires);
    
    item.innerHTML = `
      <div class="alert-header">
        <div class="alert-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="alert-title">${alertData.headline || alertData.event}</div>
        <div class="alert-time">${Utils.formatDateTime(effectiveDate, 'relative')}</div>
      </div>
      <div class="alert-description">
        ${alertData.description || alertData.note}
      </div>
      ${alertData.instruction ? `
        <div class="alert-instruction">
          <strong>Instructions:</strong> ${alertData.instruction}
        </div>
      ` : ''}
      <div class="alert-meta">
        <span class="alert-severity">Severity: ${alertData.severity}</span>
        <span class="alert-expires">Expires: ${Utils.formatDateTime(expiresDate, 'datetime')}</span>
      </div>
    `;
    
    return item;
  },

  /**
   * Update current weather display
   * @param {object} weatherData - Current weather data
   * @param {object} settings - User settings
   */
  updateCurrentWeather(weatherData, settings) {
    const { location, current, airQuality } = weatherData;
    
    // Update main weather info
    document.getElementById('current-temp').textContent = 
      Utils.formatTemperature(current.temperature, settings.temperatureUnit);
    
    document.getElementById('current-condition').textContent = current.condition;
    
    document.getElementById('current-location').innerHTML = `
      <i class="fas fa-map-marker-alt"></i>
      ${location.name}, ${location.region}
    `;
    
    // Update weather icon
    const iconElement = document.querySelector('#current-icon i');
    if (iconElement) {
      iconElement.className = Utils.getWeatherIcon(current.condition, current.isDay);
    }
    
    // Update weather details
    document.getElementById('visibility').textContent = `${current.visibility} km`;
    document.getElementById('humidity').textContent = `${current.humidity}%`;
    document.getElementById('wind-speed').textContent = 
      Utils.formatWindSpeed(current.windSpeed, settings.windUnit);
    document.getElementById('feels-like').textContent = 
      Utils.formatTemperature(current.feelsLike, settings.temperatureUnit);
    document.getElementById('pressure').textContent = 
      Utils.formatPressure(current.pressure, settings.pressureUnit);
    document.getElementById('uv-index').textContent = current.uvIndex;
    
    // Update last updated time
    document.getElementById('last-updated').textContent = 
      `Updated ${Utils.formatDateTime(current.lastUpdated, 'relative')}`;
    
    // Update air quality if available
    if (airQuality && airQuality.usEpaIndex) {
      this.updateAirQuality(airQuality.usEpaIndex);
    }
  },

  /**
   * Update air quality display
   * @param {number} aqiValue - AQI value
   */
  updateAirQuality(aqiValue) {
    const aqiInfo = Utils.getAQIInfo(aqiValue);
    
    document.getElementById('aqi-value').textContent = aqiValue;
    document.getElementById('aqi-status').textContent = aqiInfo.label;
    document.getElementById('aqi-description').textContent = aqiInfo.description;
    
    // Update AQI circle color
    const aqiCircle = document.getElementById('aqi-circle');
    if (aqiCircle) {
      aqiCircle.style.background = `conic-gradient(from 0deg, ${aqiInfo.color}, ${aqiInfo.color}40)`;
    }
  },

  /**
   * Update sun and moon information
   * @param {object} astroData - Astronomical data
   */
  updateSunMoon(astroData) {
    document.getElementById('sunrise').textContent = astroData.sunrise;
    document.getElementById('sunset').textContent = astroData.sunset;
    document.getElementById('moon-label').textContent = astroData.moonPhase;
    
    // Update moon phase icon based on phase
    const moonIcon = document.querySelector('#moon-phase i');
    if (moonIcon) {
      const phase = astroData.moonPhase.toLowerCase();
      if (phase.includes('new')) {
        moonIcon.className = 'fas fa-circle';
      } else if (phase.includes('full')) {
        moonIcon.className = 'fas fa-moon';
      } else if (phase.includes('first') || phase.includes('waxing')) {
        moonIcon.className = 'fas fa-adjust';
      } else if (phase.includes('last') || phase.includes('waning')) {
        moonIcon.className = 'fas fa-adjust';
      } else {
        moonIcon.className = 'fas fa-moon';
      }
    }
  },

  /**
   * Update hourly forecast display
   * @param {array} hourlyData - Array of hourly weather data
   * @param {object} settings - User settings
   */
  updateHourlyForecast(hourlyData, settings) {
    const container = document.getElementById('hourly-forecast');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Show next 24 hours
    const now = new Date();
    const next24Hours = hourlyData.filter(hour => {
      const hourTime = new Date(hour.time);
      return hourTime >= now && hourTime <= new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }).slice(0, 24);
    
    next24Hours.forEach(hour => {
      const hourItem = this.createHourlyItem(hour, settings);
      container.appendChild(hourItem);
    });
  },

  /**
   * Update daily forecast display
   * @param {array} dailyData - Array of daily weather data
   * @param {object} settings - User settings
   */
  updateDailyForecast(dailyData, settings) {
    const container = document.getElementById('forecast-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    dailyData.forEach((day, index) => {
      const dayItem = this.createDailyItem(day, settings, index);
      container.appendChild(dayItem);
    });
  },

  /**
   * Update weather alerts display
   * @param {array} alertsData - Array of weather alerts
   */
  updateWeatherAlerts(alertsData) {
    const container = document.getElementById('alerts-container');
    if (!container) return;
    
    if (!alertsData || alertsData.length === 0) {
      container.innerHTML = `
        <div class="no-alerts">
          <i class="fas fa-shield-alt"></i>
          <h3>No Active Alerts</h3>
          <p>There are currently no weather alerts for your location.</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = '';
    
    alertsData.forEach(alert => {
      const alertItem = this.createAlertItem(alert);
      container.appendChild(alertItem);
    });
  },

  /**
   * Show error message
   * @param {string} message - Error message
   * @param {HTMLElement} container - Container element
   */
  showError(message, container) {
    if (!container) return;
    
    container.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <h3>Error</h3>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="location.reload()">
          <i class="fas fa-refresh"></i>
          Try Again
        </button>
      </div>
    `;
  },

  /**
   * Show empty state
   * @param {string} title - Empty state title
   * @param {string} message - Empty state message
   * @param {HTMLElement} container - Container element
   */
  showEmptyState(title, message, container) {
    if (!container) return;
    
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-cloud"></i>
        <h3>${title}</h3>
        <p>${message}</p>
      </div>
    `;
  },

  /**
   * Animate element entrance
   * @param {HTMLElement} element - Element to animate
   * @param {string} animation - Animation type
   */
  animateIn(element, animation = 'fade-in') {
    if (!element) return;
    
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      element.style.transition = 'all 0.5s ease';
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 10);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIComponents;
}