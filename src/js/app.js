// Main application initialization and coordination
class WeatherProApp {
  constructor() {
    this.initialized = false;
    this.components = {};
    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initializeApp());
      } else {
        this.initializeApp();
      }
    } catch (error) {
      console.error('Failed to initialize Weather Pro:', error);
      this.showInitializationError(error);
    }
  }

  /**
   * Initialize application components
   */
  initializeApp() {
    try {
      // Initialize core components
      this.initializeComponents();
      
      // Setup global error handling
      this.setupErrorHandling();
      
      // Setup service worker for offline functionality
      this.setupServiceWorker();
      
      // Setup keyboard shortcuts
      this.setupKeyboardShortcuts();
      
      // Setup performance monitoring
      this.setupPerformanceMonitoring();
      
      // Mark as initialized
      this.initialized = true;
      
      console.log('Weather Pro initialized successfully');
      
      // Dispatch initialization complete event
      window.dispatchEvent(new CustomEvent('weatherProInitialized'));
      
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.showInitializationError(error);
    }
  }

  /**
   * Initialize application components
   */
  initializeComponents() {
    // Components are initialized by their respective modules
    // This method coordinates their initialization
    
    // Wait for all components to be available
    const checkComponents = () => {
      const requiredComponents = [
        'navigation',
        'weatherDisplay',
        'forecastManager',
        'mapsManager',
        'settingsManager'
      ];
      
      const availableComponents = requiredComponents.filter(name => window[name]);
      
      if (availableComponents.length === requiredComponents.length) {
        this.components = {
          navigation: window.navigation,
          weatherDisplay: window.weatherDisplay,
          forecastManager: window.forecastManager,
          mapsManager: window.mapsManager,
          settingsManager: window.settingsManager
        };
        
        this.setupComponentCommunication();
      } else {
        // Wait a bit more for components to initialize
        setTimeout(checkComponents, 100);
      }
    };
    
    checkComponents();
  }

  /**
   * Setup communication between components
   */
  setupComponentCommunication() {
    // Listen for weather data updates
    window.addEventListener('weatherDataUpdated', (event) => {
      const { weatherData } = event.detail;
      
      // Update maps with new location
      if (this.components.mapsManager) {
        this.components.mapsManager.updateWeatherData(weatherData);
      }
      
      // Update forecast display
      if (this.components.forecastManager && weatherData.forecast) {
        this.components.forecastManager.updateForecast(weatherData.forecast.daily);
      }
    });

    // Listen for settings changes
    window.addEventListener('settingsChanged', (event) => {
      const { settings } = event.detail;
      
      // Apply settings to all components
      Object.values(this.components).forEach(component => {
        if (component.updateSettings) {
          component.updateSettings(settings);
        }
      });
    });

    // Listen for navigation changes
    window.addEventListener('sectionChanged', (event) => {
      const { section } = event.detail;
      
      // Handle section-specific initialization
      this.handleSectionChange(section);
    });
  }

  /**
   * Handle section changes
   * @param {string} section - New section name
   */
  handleSectionChange(section) {
    switch (section) {
      case 'maps':
        // Initialize map when maps section is shown
        if (this.components.mapsManager) {
          setTimeout(() => {
            this.components.mapsManager.initializeMap();
          }, 100);
        }
        break;
      
      case 'forecast':
        // Refresh forecast data
        if (this.components.forecastManager) {
          this.components.forecastManager.refresh();
        }
        break;
      
      case 'alerts':
        // Refresh alerts
        if (this.components.weatherDisplay) {
          this.components.weatherDisplay.refreshAlerts();
        }
        break;
    }
  }

  /**
   * Setup global error handling
   */
  setupErrorHandling() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      console.error('Uncaught error:', event.error);
      this.handleError(event.error, 'Uncaught Error');
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleError(event.reason, 'Promise Rejection');
    });

    // Handle API errors
    window.addEventListener('apiError', (event) => {
      const { error, context } = event.detail;
      this.handleError(error, `API Error: ${context}`);
    });
  }

  /**
   * Handle application errors
   * @param {Error} error - Error object
   * @param {string} context - Error context
   */
  handleError(error, context = 'Application Error') {
    // Log error details
    console.error(`${context}:`, error);
    
    // Show user-friendly error message
    const message = this.getUserFriendlyErrorMessage(error);
    Utils.showToast(message, 'error');
    
    // Report error to monitoring service (if available)
    this.reportError(error, context);
  }

  /**
   * Get user-friendly error message
   * @param {Error} error - Error object
   * @returns {string} User-friendly message
   */
  getUserFriendlyErrorMessage(error) {
    if (error.message.includes('fetch')) {
      return 'Network error. Please check your internet connection.';
    }
    
    if (error.message.includes('API')) {
      return 'Weather service is temporarily unavailable. Please try again later.';
    }
    
    if (error.message.includes('location')) {
      return 'Unable to access location. Please enable location services or search manually.';
    }
    
    return 'Something went wrong. Please try refreshing the page.';
  }

  /**
   * Report error to monitoring service
   * @param {Error} error - Error object
   * @param {string} context - Error context
   */
  reportError(error, context) {
    // This would integrate with error reporting services like Sentry
    // For now, we'll just log to console
    console.log('Error reported:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  /**
   * Setup service worker for offline functionality
   */
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Only handle shortcuts when not typing in input fields
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      // Handle keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'k':
            event.preventDefault();
            this.focusSearch();
            break;
          case 'r':
            event.preventDefault();
            this.refreshWeatherData();
            break;
          case ',':
            event.preventDefault();
            this.openSettings();
            break;
        }
      }

      // Handle number keys for navigation
      if (event.key >= '1' && event.key <= '5') {
        const sections = ['dashboard', 'forecast', 'maps', 'alerts', 'settings'];
        const sectionIndex = parseInt(event.key) - 1;
        if (sections[sectionIndex] && this.components.navigation) {
          event.preventDefault();
          this.components.navigation.navigateToSection(sections[sectionIndex]);
        }
      }

      // Handle escape key
      if (event.key === 'Escape') {
        this.handleEscapeKey();
      }
    });
  }

  /**
   * Focus search input
   */
  focusSearch() {
    const searchInput = document.getElementById('location-search');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  /**
   * Refresh weather data
   */
  refreshWeatherData() {
    if (this.components.weatherDisplay) {
      const currentLocation = this.components.weatherDisplay.getCurrentLocation();
      if (currentLocation) {
        this.components.weatherDisplay.loadWeatherData(currentLocation);
      }
    }
  }

  /**
   * Open settings
   */
  openSettings() {
    if (this.components.navigation) {
      this.components.navigation.navigateToSection('settings');
    }
  }

  /**
   * Handle escape key press
   */
  handleEscapeKey() {
    // Close any open modals or overlays
    const modals = document.querySelectorAll('.modal, .overlay');
    modals.forEach(modal => {
      if (modal.classList.contains('active')) {
        modal.classList.remove('active');
      }
    });

    // Hide search suggestions
    if (this.components.weatherDisplay) {
      this.components.weatherDisplay.hideSearchSuggestions();
    }
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page load performance:', {
          loadTime: perfData.loadEventEnd - perfData.loadEventStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          totalTime: perfData.loadEventEnd - perfData.fetchStart
        });
      }, 0);
    });

    // Monitor API call performance
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        console.log(`API call to ${args[0]} took ${endTime - startTime}ms`);
        return response;
      } catch (error) {
        const endTime = performance.now();
        console.log(`Failed API call to ${args[0]} took ${endTime - startTime}ms`);
        throw error;
      }
    };
  }

  /**
   * Show initialization error
   * @param {Error} error - Initialization error
   */
  showInitializationError(error) {
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        padding: 2rem;
        text-align: center;
        background: #f8fafc;
        color: #1e293b;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="
          background: white;
          padding: 3rem;
          border-radius: 1rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          max-width: 500px;
        ">
          <i class="fas fa-exclamation-triangle" style="
            font-size: 3rem;
            color: #f59e0b;
            margin-bottom: 1.5rem;
          "></i>
          <h1 style="margin-bottom: 1rem; font-size: 1.5rem;">
            Failed to Initialize Weather Pro
          </h1>
          <p style="margin-bottom: 2rem; color: #64748b; line-height: 1.6;">
            We encountered an error while starting the application. 
            Please refresh the page or try again later.
          </p>
          <button onclick="location.reload()" style="
            background: #2563eb;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.2s;
          " onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">
            Refresh Page
          </button>
          <details style="margin-top: 2rem; text-align: left;">
            <summary style="cursor: pointer; color: #64748b;">Technical Details</summary>
            <pre style="
              margin-top: 1rem;
              padding: 1rem;
              background: #f1f5f9;
              border-radius: 0.5rem;
              font-size: 0.875rem;
              overflow-x: auto;
              color: #374151;
            ">${error.stack || error.message}</pre>
          </details>
        </div>
      </div>
    `;
  }

  /**
   * Get application status
   * @returns {object} Application status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      components: Object.keys(this.components),
      version: '1.0.0'
    };
  }
}

// Initialize the application
const weatherProApp = new WeatherProApp();

// Make app instance globally available for debugging
window.weatherProApp = weatherProApp;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WeatherProApp;
}