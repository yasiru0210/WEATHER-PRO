// Forecast management functionality
class ForecastManager {
  constructor() {
    this.forecastData = null;
    this.settings = null;
    this.init();
  }

  /**
   * Initialize forecast manager
   */
  init() {
    this.loadSettings();
  }

  /**
   * Load user settings
   */
  loadSettings() {
    this.settings = Utils.loadFromStorage(CONFIG.STORAGE_KEYS.SETTINGS, CONFIG.DEFAULTS);
  }

  /**
   * Update forecast display
   * @param {array} dailyForecast - Array of daily forecast data
   */
  updateForecast(dailyForecast) {
    this.forecastData = dailyForecast;
    this.renderForecast();
  }

  /**
   * Render forecast display
   */
  renderForecast() {
    if (!this.forecastData) return;

    UIComponents.updateDailyForecast(this.forecastData, this.settings);
    this.addInteractivity();
  }

  /**
   * Add interactive features to forecast items
   */
  addInteractivity() {
    const forecastItems = document.querySelectorAll('.forecast-item');
    
    forecastItems.forEach((item, index) => {
      // Add click handler for detailed view
      item.addEventListener('click', () => {
        this.showDetailedForecast(index);
      });

      // Add hover effects
      item.addEventListener('mouseenter', () => {
        this.showForecastPreview(index);
      });

      item.addEventListener('mouseleave', () => {
        this.hideForecastPreview();
      });
    });
  }

  /**
   * Show detailed forecast for a specific day
   * @param {number} dayIndex - Index of the day
   */
  showDetailedForecast(dayIndex) {
    if (!this.forecastData[dayIndex]) return;

    const dayData = this.forecastData[dayIndex];
    const modal = this.createDetailedForecastModal(dayData, dayIndex);
    
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  }

  /**
   * Create detailed forecast modal
   * @param {object} dayData - Day forecast data
   * @param {number} dayIndex - Day index
   * @returns {HTMLElement} Modal element
   */
  createDetailedForecastModal(dayData, dayIndex) {
    const modal = document.createElement('div');
    modal.className = 'forecast-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    const date = new Date(dayData.date);
    const dayName = dayIndex === 0 ? 'Today' : 
                   dayIndex === 1 ? 'Tomorrow' : 
                   date.toLocaleDateString([], { weekday: 'long' });

    modal.innerHTML = `
      <div class="forecast-modal-content" style="
        background: var(--bg-card);
        border-radius: var(--radius-xl);
        padding: var(--spacing-2xl);
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
      ">
        <button class="modal-close" style="
          position: absolute;
          top: var(--spacing-lg);
          right: var(--spacing-lg);
          background: none;
          border: none;
          font-size: var(--font-size-xl);
          color: var(--text-secondary);
          cursor: pointer;
          padding: var(--spacing-sm);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        ">
          <i class="fas fa-times"></i>
        </button>
        
        <div class="modal-header" style="margin-bottom: var(--spacing-xl);">
          <h2 style="color: var(--text-primary); margin-bottom: var(--spacing-sm);">
            ${dayName}
          </h2>
          <p style="color: var(--text-secondary);">
            ${date.toLocaleDateString([], { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div class="modal-weather-summary" style="
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
          padding: var(--spacing-lg);
          background: var(--bg-tertiary);
          border-radius: var(--radius-lg);
        ">
          <div class="weather-icon" style="
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            border-radius: var(--radius-xl);
            color: var(--text-inverse);
            font-size: 2.5rem;
          ">
            <i class="${Utils.getWeatherIcon(dayData.day.condition, true)}"></i>
          </div>
          <div>
            <div style="font-size: var(--font-size-3xl); font-weight: 700; color: var(--text-primary);">
              ${Utils.formatTemperature(dayData.day.maxTemp, this.settings.temperatureUnit)} / 
              ${Utils.formatTemperature(dayData.day.minTemp, this.settings.temperatureUnit)}
            </div>
            <div style="font-size: var(--font-size-lg); color: var(--text-secondary); margin: var(--spacing-xs) 0;">
              ${dayData.day.condition}
            </div>
            <div style="font-size: var(--font-size-sm); color: var(--text-tertiary);">
              <i class="fas fa-tint"></i> ${Math.max(dayData.day.chanceOfRain, dayData.day.chanceOfSnow)}% chance of precipitation
            </div>
          </div>
        </div>

        <div class="modal-details" style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        ">
          <div class="detail-card" style="
            padding: var(--spacing-lg);
            background: var(--bg-tertiary);
            border-radius: var(--radius-lg);
          ">
            <h4 style="color: var(--text-primary); margin-bottom: var(--spacing-md);">
              <i class="fas fa-wind"></i> Wind
            </h4>
            <p style="color: var(--text-secondary);">
              Max: ${Utils.formatWindSpeed(dayData.day.maxWind, this.settings.windUnit)}
            </p>
          </div>
          
          <div class="detail-card" style="
            padding: var(--spacing-lg);
            background: var(--bg-tertiary);
            border-radius: var(--radius-lg);
          ">
            <h4 style="color: var(--text-primary); margin-bottom: var(--spacing-md);">
              <i class="fas fa-tint"></i> Humidity
            </h4>
            <p style="color: var(--text-secondary);">
              Average: ${dayData.day.avgHumidity}%
            </p>
          </div>
          
          <div class="detail-card" style="
            padding: var(--spacing-lg);
            background: var(--bg-tertiary);
            border-radius: var(--radius-lg);
          ">
            <h4 style="color: var(--text-primary); margin-bottom: var(--spacing-md);">
              <i class="fas fa-sun"></i> UV Index
            </h4>
            <p style="color: var(--text-secondary);">
              ${dayData.day.uvIndex}
            </p>
          </div>
          
          <div class="detail-card" style="
            padding: var(--spacing-lg);
            background: var(--bg-tertiary);
            border-radius: var(--radius-lg);
          ">
            <h4 style="color: var(--text-primary); margin-bottom: var(--spacing-md);">
              <i class="fas fa-cloud-rain"></i> Precipitation
            </h4>
            <p style="color: var(--text-secondary);">
              ${dayData.day.totalPrecipitation} mm
            </p>
          </div>
        </div>

        ${dayData.astro ? `
          <div class="modal-astro" style="
            padding: var(--spacing-lg);
            background: var(--bg-tertiary);
            border-radius: var(--radius-lg);
            margin-bottom: var(--spacing-xl);
          ">
            <h4 style="color: var(--text-primary); margin-bottom: var(--spacing-md);">
              <i class="fas fa-sun"></i> Sun & Moon
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--spacing-md);">
              <div>
                <span style="color: var(--text-secondary); font-size: var(--font-size-sm);">Sunrise</span>
                <div style="color: var(--text-primary); font-weight: 600;">${dayData.astro.sunrise}</div>
              </div>
              <div>
                <span style="color: var(--text-secondary); font-size: var(--font-size-sm);">Sunset</span>
                <div style="color: var(--text-primary); font-weight: 600;">${dayData.astro.sunset}</div>
              </div>
              <div>
                <span style="color: var(--text-secondary); font-size: var(--font-size-sm);">Moon Phase</span>
                <div style="color: var(--text-primary); font-weight: 600;">${dayData.astro.moonPhase}</div>
              </div>
            </div>
          </div>
        ` : ''}

        ${dayData.hourly ? `
          <div class="modal-hourly">
            <h4 style="color: var(--text-primary); margin-bottom: var(--spacing-md);">
              <i class="fas fa-clock"></i> Hourly Forecast
            </h4>
            <div class="hourly-scroll" style="
              display: flex;
              gap: var(--spacing-md);
              overflow-x: auto;
              padding: var(--spacing-sm) 0;
            ">
              ${dayData.hourly.map(hour => `
                <div class="hourly-item" style="
                  flex: 0 0 auto;
                  text-align: center;
                  padding: var(--spacing-md);
                  background: var(--bg-card);
                  border-radius: var(--radius-md);
                  min-width: 80px;
                  border: 1px solid var(--border-color);
                ">
                  <div style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--spacing-xs);">
                    ${Utils.formatDateTime(hour.time, 'time')}
                  </div>
                  <div style="font-size: var(--font-size-xl); margin: var(--spacing-xs) 0; color: var(--primary-color);">
                    <i class="${Utils.getWeatherIcon(hour.condition, hour.isDay)}"></i>
                  </div>
                  <div style="font-weight: 600; font-size: var(--font-size-sm); color: var(--text-primary);">
                    ${Utils.formatTemperature(hour.temperature, this.settings.temperatureUnit)}
                  </div>
                  <div style="font-size: var(--font-size-xs); color: var(--text-tertiary);">
                    ${hour.chanceOfRain}%
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Add close functionality
    const closeBtn = modal.querySelector('.modal-close');
    const closeModal = () => {
      modal.classList.remove('active');
      setTimeout(() => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
      }, 300);
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Close on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    return modal;
  }

  /**
   * Show forecast preview on hover
   * @param {number} dayIndex - Index of the day
   */
  showForecastPreview(dayIndex) {
    // Implementation for hover preview
    // This could show a tooltip with additional information
  }

  /**
   * Hide forecast preview
   */
  hideForecastPreview() {
    // Implementation for hiding hover preview
  }

  /**
   * Refresh forecast data
   */
  async refresh() {
    if (window.weatherDisplay) {
      const weatherData = window.weatherDisplay.getCurrentWeatherData();
      if (weatherData?.forecast?.daily) {
        this.updateForecast(weatherData.forecast.daily);
      }
    }
  }

  /**
   * Update settings
   * @param {object} newSettings - New settings
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    if (this.forecastData) {
      this.renderForecast();
    }
  }
}

// Initialize forecast manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.forecastManager = new ForecastManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ForecastManager;
}