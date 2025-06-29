// Utility functions for Weather Pro application
const Utils = {
  /**
   * Format temperature based on user preference
   * @param {number} temp - Temperature in Celsius
   * @param {string} unit - Temperature unit ('celsius' or 'fahrenheit')
   * @returns {string} Formatted temperature string
   */
  formatTemperature(temp, unit = 'celsius') {
    if (unit === 'fahrenheit') {
      return `${Math.round((temp * 9/5) + 32)}°F`;
    }
    return `${Math.round(temp)}°C`;
  },

  /**
   * Format wind speed based on user preference
   * @param {number} speed - Wind speed in km/h
   * @param {string} unit - Wind unit ('kmh', 'mph', or 'ms')
   * @returns {string} Formatted wind speed string
   */
  formatWindSpeed(speed, unit = 'kmh') {
    switch (unit) {
      case 'mph':
        return `${Math.round(speed * 0.621371)} mph`;
      case 'ms':
        return `${Math.round(speed * 0.277778)} m/s`;
      default:
        return `${Math.round(speed)} km/h`;
    }
  },

  /**
   * Format pressure based on user preference
   * @param {number} pressure - Pressure in hPa
   * @param {string} unit - Pressure unit ('hpa', 'inhg', or 'mmhg')
   * @returns {string} Formatted pressure string
   */
  formatPressure(pressure, unit = 'hpa') {
    switch (unit) {
      case 'inhg':
        return `${(pressure * 0.02953).toFixed(2)} inHg`;
      case 'mmhg':
        return `${Math.round(pressure * 0.750062)} mmHg`;
      default:
        return `${Math.round(pressure)} hPa`;
    }
  },

  /**
   * Format date and time
   * @param {Date|string} date - Date object or ISO string
   * @param {string} format - Format type ('time', 'date', 'datetime', 'relative')
   * @returns {string} Formatted date string
   */
  formatDateTime(date, format = 'datetime') {
    const dateObj = new Date(date);
    const now = new Date();
    
    switch (format) {
      case 'time':
        return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'date':
        return dateObj.toLocaleDateString([], { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'relative':
        const diffMs = now - dateObj;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return dateObj.toLocaleDateString();
      default:
        return dateObj.toLocaleString();
    }
  },

  /**
   * Get weather icon class based on condition
   * @param {string} condition - Weather condition text
   * @param {boolean} isDay - Whether it's daytime
   * @returns {string} Font Awesome icon class
   */
  getWeatherIcon(condition, isDay = true) {
    const conditionLower = condition.toLowerCase();
    
    // Check for specific conditions first
    for (const [key, icon] of Object.entries(CONFIG.WEATHER_ICONS)) {
      if (conditionLower.includes(key)) {
        // Special handling for sun/moon based on time of day
        if (key === 'clear' || key === 'sunny') {
          return isDay ? 'fas fa-sun' : 'fas fa-moon';
        }
        return icon;
      }
    }
    
    // Default icon
    return isDay ? 'fas fa-sun' : 'fas fa-moon';
  },

  /**
   * Get Air Quality Index information
   * @param {number} aqi - AQI value
   * @returns {object} AQI information object
   */
  getAQIInfo(aqi) {
    for (const [key, range] of Object.entries(CONFIG.AQI_RANGES)) {
      if (aqi >= range.min && aqi <= range.max) {
        return {
          level: key,
          label: range.label,
          color: range.color,
          description: this.getAQIDescription(key)
        };
      }
    }
    
    return {
      level: 'UNKNOWN',
      label: 'Unknown',
      color: '#64748b',
      description: 'Air quality data unavailable'
    };
  },

  /**
   * Get AQI description based on level
   * @param {string} level - AQI level
   * @returns {string} Description text
   */
  getAQIDescription(level) {
    const descriptions = {
      GOOD: 'Air quality is satisfactory and poses little or no health risk.',
      MODERATE: 'Air quality is acceptable for most people.',
      UNHEALTHY_SENSITIVE: 'Sensitive individuals may experience minor health effects.',
      UNHEALTHY: 'Everyone may experience health effects.',
      VERY_UNHEALTHY: 'Health alert: everyone may experience serious health effects.',
      HAZARDOUS: 'Emergency conditions: everyone is likely to be affected.'
    };
    
    return descriptions[level] || 'Air quality information unavailable.';
  },

  /**
   * Debounce function to limit API calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Show loading state
   * @param {boolean} show - Whether to show loading
   */
  showLoading(show = true) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      if (show) {
        overlay.classList.add('active');
      } else {
        overlay.classList.remove('active');
      }
    }
  },

  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - Toast type ('success', 'error', 'warning', 'info')
   */
  showToast(message, type = 'info') {
    // Create toast element if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      `;
      document.body.appendChild(toastContainer);
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      padding: 12px 16px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      max-width: 300px;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
      cursor: pointer;
    `;

    // Set background color based on type
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    toast.style.backgroundColor = colors[type] || colors.info;

    toast.textContent = message;
    toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 10);

    // Auto remove after 5 seconds
    const removeToast = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    };

    toast.addEventListener('click', removeToast);
    setTimeout(removeToast, 5000);
  },

  /**
   * Get user's current location
   * @returns {Promise} Promise that resolves with coordinates
   */
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          let message = 'Unable to retrieve your location.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out.';
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  },

  /**
   * Save data to localStorage
   * @param {string} key - Storage key
   * @param {any} data - Data to save
   */
  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  /**
   * Load data from localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Loaded data or default value
   */
  loadFromStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return defaultValue;
    }
  },

  /**
   * Animate element with CSS classes
   * @param {HTMLElement} element - Element to animate
   * @param {string} animation - Animation class name
   * @param {Function} callback - Callback function after animation
   */
  animate(element, animation, callback) {
    element.classList.add(animation);
    
    const handleAnimationEnd = () => {
      element.classList.remove(animation);
      element.removeEventListener('animationend', handleAnimationEnd);
      if (callback) callback();
    };
    
    element.addEventListener('animationend', handleAnimationEnd);
  }
};

// Export Utils for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}