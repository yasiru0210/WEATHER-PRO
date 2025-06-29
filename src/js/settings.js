// Settings management functionality
class SettingsManager {
  constructor() {
    this.settings = {};
    this.init();
  }

  /**
   * Initialize settings manager
   */
  init() {
    this.loadSettings();
    this.setupEventListeners();
    this.applyTheme();
  }

  /**
   * Load settings from storage
   */
  loadSettings() {
    this.settings = Utils.loadFromStorage(CONFIG.STORAGE_KEYS.SETTINGS, CONFIG.DEFAULTS);
    this.updateSettingsUI();
  }

  /**
   * Setup event listeners for settings controls
   */
  setupEventListeners() {
    // Temperature unit
    const tempUnit = document.getElementById('temp-unit');
    if (tempUnit) {
      tempUnit.addEventListener('change', (e) => {
        this.updateSetting('temperatureUnit', e.target.value);
      });
    }

    // Wind unit
    const windUnit = document.getElementById('wind-unit');
    if (windUnit) {
      windUnit.addEventListener('change', (e) => {
        this.updateSetting('windUnit', e.target.value);
      });
    }

    // Pressure unit
    const pressureUnit = document.getElementById('pressure-unit');
    if (pressureUnit) {
      pressureUnit.addEventListener('change', (e) => {
        this.updateSetting('pressureUnit', e.target.value);
      });
    }

    // Theme
    const theme = document.getElementById('theme');
    if (theme) {
      theme.addEventListener('change', (e) => {
        this.updateSetting('theme', e.target.value);
        this.applyTheme();
      });
    }

    // Animations toggle
    const animations = document.getElementById('animations');
    if (animations) {
      animations.addEventListener('change', (e) => {
        this.updateSetting('animations', e.target.checked);
        this.applyAnimationSettings();
      });
    }

    // Weather alerts toggle
    const weatherAlerts = document.getElementById('weather-alerts');
    if (weatherAlerts) {
      weatherAlerts.addEventListener('change', (e) => {
        this.updateSetting('weatherAlerts', e.target.checked);
      });
    }

    // Daily forecast toggle
    const dailyForecast = document.getElementById('daily-forecast');
    if (dailyForecast) {
      dailyForecast.addEventListener('change', (e) => {
        this.updateSetting('dailyForecast', e.target.checked);
      });
    }
  }

  /**
   * Update a specific setting
   * @param {string} key - Setting key
   * @param {any} value - Setting value
   */
  updateSetting(key, value) {
    this.settings[key] = value;
    this.saveSettings();
    this.notifySettingsChange(key, value);
  }

  /**
   * Save settings to storage
   */
  saveSettings() {
    Utils.saveToStorage(CONFIG.STORAGE_KEYS.SETTINGS, this.settings);
  }

  /**
   * Update settings UI with current values
   */
  updateSettingsUI() {
    // Temperature unit
    const tempUnit = document.getElementById('temp-unit');
    if (tempUnit) {
      tempUnit.value = this.settings.temperatureUnit || CONFIG.DEFAULTS.TEMPERATURE_UNIT;
    }

    // Wind unit
    const windUnit = document.getElementById('wind-unit');
    if (windUnit) {
      windUnit.value = this.settings.windUnit || CONFIG.DEFAULTS.WIND_UNIT;
    }

    // Pressure unit
    const pressureUnit = document.getElementById('pressure-unit');
    if (pressureUnit) {
      pressureUnit.value = this.settings.pressureUnit || CONFIG.DEFAULTS.PRESSURE_UNIT;
    }

    // Theme
    const theme = document.getElementById('theme');
    if (theme) {
      theme.value = this.settings.theme || CONFIG.DEFAULTS.THEME;
    }

    // Animations
    const animations = document.getElementById('animations');
    if (animations) {
      animations.checked = this.settings.animations !== undefined ? 
        this.settings.animations : CONFIG.DEFAULTS.ANIMATIONS;
    }

    // Weather alerts
    const weatherAlerts = document.getElementById('weather-alerts');
    if (weatherAlerts) {
      weatherAlerts.checked = this.settings.weatherAlerts !== undefined ? 
        this.settings.weatherAlerts : CONFIG.DEFAULTS.WEATHER_ALERTS;
    }

    // Daily forecast
    const dailyForecast = document.getElementById('daily-forecast');
    if (dailyForecast) {
      dailyForecast.checked = this.settings.dailyForecast !== undefined ? 
        this.settings.dailyForecast : CONFIG.DEFAULTS.DAILY_FORECAST;
    }
  }

  /**
   * Apply theme settings
   */
  applyTheme() {
    const theme = this.settings.theme || CONFIG.DEFAULTS.THEME;
    
    // Remove existing theme classes
    document.documentElement.removeAttribute('data-theme');
    
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else if (theme === 'auto') {
      // Auto theme based on system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
      
      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.settings.theme === 'auto') {
          if (e.matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
          } else {
            document.documentElement.removeAttribute('data-theme');
          }
        }
      });
    }
  }

  /**
   * Apply animation settings
   */
  applyAnimationSettings() {
    const animations = this.settings.animations !== undefined ? 
      this.settings.animations : CONFIG.DEFAULTS.ANIMATIONS;
    
    if (animations) {
      document.documentElement.classList.remove('no-animations');
    } else {
      document.documentElement.classList.add('no-animations');
    }
  }

  /**
   * Notify other components of settings changes
   * @param {string} key - Changed setting key
   * @param {any} value - New value
   */
  notifySettingsChange(key, value) {
    // Update weather display if units changed
    if (['temperatureUnit', 'windUnit', 'pressureUnit'].includes(key)) {
      if (window.weatherDisplay) {
        window.weatherDisplay.updateSettings(this.settings);
      }
      if (window.forecastManager) {
        window.forecastManager.updateSettings(this.settings);
      }
    }

    // Show confirmation toast
    Utils.showToast('Settings updated successfully', 'success');

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('settingsChanged', {
      detail: { key, value, settings: this.settings }
    }));
  }

  /**
   * Reset settings to defaults
   */
  resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      this.settings = { ...CONFIG.DEFAULTS };
      this.saveSettings();
      this.updateSettingsUI();
      this.applyTheme();
      this.applyAnimationSettings();
      
      // Notify components
      if (window.weatherDisplay) {
        window.weatherDisplay.updateSettings(this.settings);
      }
      if (window.forecastManager) {
        window.forecastManager.updateSettings(this.settings);
      }

      Utils.showToast('Settings reset to defaults', 'success');
    }
  }

  /**
   * Export settings as JSON
   */
  exportSettings() {
    const dataStr = JSON.stringify(this.settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'weather-pro-settings.json';
    link.click();
    
    Utils.showToast('Settings exported successfully', 'success');
  }

  /**
   * Import settings from JSON file
   * @param {File} file - JSON file with settings
   */
  async importSettings(file) {
    try {
      const text = await file.text();
      const importedSettings = JSON.parse(text);
      
      // Validate imported settings
      const validSettings = this.validateSettings(importedSettings);
      
      this.settings = { ...CONFIG.DEFAULTS, ...validSettings };
      this.saveSettings();
      this.updateSettingsUI();
      this.applyTheme();
      this.applyAnimationSettings();
      
      // Notify components
      if (window.weatherDisplay) {
        window.weatherDisplay.updateSettings(this.settings);
      }
      if (window.forecastManager) {
        window.forecastManager.updateSettings(this.settings);
      }

      Utils.showToast('Settings imported successfully', 'success');
    } catch (error) {
      console.error('Failed to import settings:', error);
      Utils.showToast('Failed to import settings. Please check the file format.', 'error');
    }
  }

  /**
   * Validate imported settings
   * @param {object} settings - Settings to validate
   * @returns {object} Validated settings
   */
  validateSettings(settings) {
    const validSettings = {};
    
    // Validate each setting
    const validations = {
      temperatureUnit: (value) => ['celsius', 'fahrenheit'].includes(value),
      windUnit: (value) => ['kmh', 'mph', 'ms'].includes(value),
      pressureUnit: (value) => ['hpa', 'inhg', 'mmhg'].includes(value),
      theme: (value) => ['auto', 'light', 'dark'].includes(value),
      animations: (value) => typeof value === 'boolean',
      weatherAlerts: (value) => typeof value === 'boolean',
      dailyForecast: (value) => typeof value === 'boolean'
    };

    Object.keys(validations).forEach(key => {
      if (settings[key] !== undefined && validations[key](settings[key])) {
        validSettings[key] = settings[key];
      }
    });

    return validSettings;
  }

  /**
   * Get current settings
   * @returns {object} Current settings
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Get a specific setting value
   * @param {string} key - Setting key
   * @param {any} defaultValue - Default value if setting doesn't exist
   * @returns {any} Setting value
   */
  getSetting(key, defaultValue = null) {
    return this.settings[key] !== undefined ? this.settings[key] : defaultValue;
  }
}

// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.settingsManager = new SettingsManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SettingsManager;
}