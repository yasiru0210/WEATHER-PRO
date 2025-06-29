// Weather maps functionality
class MapsManager {
  constructor() {
    this.map = null;
    this.currentLayer = 'temperature';
    this.markers = [];
    this.weatherData = null;
    this.init();
  }

  /**
   * Initialize maps manager
   */
  init() {
    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Map layer controls
    const layerButtons = document.querySelectorAll('.map-control-btn');
    layerButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const layer = btn.getAttribute('data-layer');
        this.switchLayer(layer);
        
        // Update active state
        layerButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  /**
   * Initialize Google Maps
   */
  initializeMap() {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not loaded');
      this.showMapError('Google Maps failed to load. Please check your internet connection.');
      return;
    }

    const mapContainer = document.getElementById('weather-map');
    if (!mapContainer) return;

    // Default location (London)
    const defaultLocation = { lat: 51.5074, lng: -0.1278 };
    
    // Get current location from weather display if available
    let center = defaultLocation;
    if (window.weatherDisplay) {
      const weatherData = window.weatherDisplay.getCurrentWeatherData();
      if (weatherData?.location) {
        center = {
          lat: weatherData.location.lat,
          lng: weatherData.location.lon
        };
      }
    }

    // Initialize map
    this.map = new google.maps.Map(mapContainer, {
      center: center,
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: this.getMapStyles(),
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true
    });

    // Add weather layer
    this.addWeatherLayer(this.currentLayer);

    // Add location marker if we have weather data
    if (window.weatherDisplay) {
      const weatherData = window.weatherDisplay.getCurrentWeatherData();
      if (weatherData) {
        this.addLocationMarker(weatherData);
      }
    }

    // Add click handler for weather info
    this.map.addListener('click', (event) => {
      this.showWeatherAtLocation(event.latLng);
    });
  }

  /**
   * Get custom map styles
   * @returns {array} Map styles array
   */
  getMapStyles() {
    return [
      {
        featureType: 'all',
        elementType: 'geometry.fill',
        stylers: [{ color: '#f8fafc' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#3b82f6' }]
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#f1f5f9' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }]
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{ color: '#e2e8f0' }]
      }
    ];
  }

  /**
   * Add weather layer to map
   * @param {string} layerType - Type of weather layer
   */
  addWeatherLayer(layerType) {
    if (!this.map) return;

    // Remove existing weather layers
    this.removeWeatherLayers();

    // OpenWeatherMap API key would be needed for real weather layers
    // For demo purposes, we'll show a placeholder
    const layerInfo = this.getLayerInfo(layerType);
    
    // Create overlay with layer information
    const overlay = new google.maps.OverlayView();
    overlay.onAdd = function() {
      const div = document.createElement('div');
      div.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        background: rgba(255, 255, 255, 0.9);
        padding: 10px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        font-size: 14px;
        color: #333;
        max-width: 200px;
      `;
      div.innerHTML = `
        <strong>${layerInfo.name}</strong><br>
        <small>${layerInfo.description}</small>
      `;
      
      this.getPanes().overlayLayer.appendChild(div);
      this.div = div;
    };
    
    overlay.draw = function() {};
    overlay.onRemove = function() {
      if (this.div) {
        this.div.parentNode.removeChild(this.div);
      }
    };
    
    overlay.setMap(this.map);
    this.currentOverlay = overlay;
  }

  /**
   * Remove weather layers
   */
  removeWeatherLayers() {
    if (this.currentOverlay) {
      this.currentOverlay.setMap(null);
      this.currentOverlay = null;
    }
  }

  /**
   * Get layer information
   * @param {string} layerType - Layer type
   * @returns {object} Layer information
   */
  getLayerInfo(layerType) {
    const layers = {
      temperature: {
        name: 'Temperature',
        description: 'Current temperature across the region',
        color: '#ff6b6b'
      },
      precipitation: {
        name: 'Precipitation',
        description: 'Current rainfall and precipitation',
        color: '#4ecdc4'
      },
      wind: {
        name: 'Wind',
        description: 'Wind speed and direction',
        color: '#45b7d1'
      },
      clouds: {
        name: 'Cloud Cover',
        description: 'Current cloud coverage',
        color: '#96ceb4'
      }
    };

    return layers[layerType] || layers.temperature;
  }

  /**
   * Switch weather layer
   * @param {string} layerType - New layer type
   */
  switchLayer(layerType) {
    this.currentLayer = layerType;
    if (this.map) {
      this.addWeatherLayer(layerType);
    }
  }

  /**
   * Add location marker
   * @param {object} weatherData - Weather data with location
   */
  addLocationMarker(weatherData) {
    if (!this.map || !weatherData.location) return;

    // Clear existing markers
    this.clearMarkers();

    const position = {
      lat: weatherData.location.lat,
      lng: weatherData.location.lon
    };

    // Create custom marker
    const marker = new google.maps.Marker({
      position: position,
      map: this.map,
      title: `${weatherData.location.name}, ${weatherData.location.region}`,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
            <circle cx="20" cy="20" r="8" fill="#ffffff"/>
            <text x="20" y="25" text-anchor="middle" fill="#2563eb" font-size="10" font-weight="bold">
              ${Math.round(weatherData.current.temperature)}°
            </text>
          </svg>
        `),
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20)
      }
    });

    // Create info window
    const infoWindow = new google.maps.InfoWindow({
      content: this.createMarkerInfoContent(weatherData)
    });

    // Show info window on marker click
    marker.addListener('click', () => {
      infoWindow.open(this.map, marker);
    });

    this.markers.push(marker);

    // Center map on location
    this.map.setCenter(position);
  }

  /**
   * Create marker info window content
   * @param {object} weatherData - Weather data
   * @returns {string} HTML content
   */
  createMarkerInfoContent(weatherData) {
    const settings = Utils.loadFromStorage(CONFIG.STORAGE_KEYS.SETTINGS, CONFIG.DEFAULTS);
    
    return `
      <div style="padding: 10px; min-width: 200px;">
        <h3 style="margin: 0 0 10px 0; color: #1e293b;">
          ${weatherData.location.name}
        </h3>
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
          <i class="${Utils.getWeatherIcon(weatherData.current.condition, weatherData.current.isDay)}" 
             style="font-size: 24px; color: #2563eb;"></i>
          <div>
            <div style="font-size: 18px; font-weight: bold; color: #1e293b;">
              ${Utils.formatTemperature(weatherData.current.temperature, settings.temperatureUnit)}
            </div>
            <div style="font-size: 14px; color: #64748b;">
              ${weatherData.current.condition}
            </div>
          </div>
        </div>
        <div style="font-size: 12px; color: #64748b; line-height: 1.4;">
          <div>Feels like: ${Utils.formatTemperature(weatherData.current.feelsLike, settings.temperatureUnit)}</div>
          <div>Humidity: ${weatherData.current.humidity}%</div>
          <div>Wind: ${Utils.formatWindSpeed(weatherData.current.windSpeed, settings.windUnit)}</div>
        </div>
      </div>
    `;
  }

  /**
   * Clear all markers
   */
  clearMarkers() {
    this.markers.forEach(marker => {
      marker.setMap(null);
    });
    this.markers = [];
  }

  /**
   * Show weather at clicked location
   * @param {google.maps.LatLng} latLng - Clicked coordinates
   */
  async showWeatherAtLocation(latLng) {
    try {
      const lat = latLng.lat();
      const lng = latLng.lng();
      
      Utils.showLoading(true);
      
      const weatherData = await weatherAPI.getCurrentWeather(`${lat},${lng}`);
      
      // Create temporary marker with weather info
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: this.map,
        animation: google.maps.Animation.DROP
      });

      const infoWindow = new google.maps.InfoWindow({
        content: this.createMarkerInfoContent(weatherData)
      });

      infoWindow.open(this.map, marker);

      // Remove marker after info window is closed
      infoWindow.addListener('closeclick', () => {
        marker.setMap(null);
      });

    } catch (error) {
      console.error('Failed to get weather for location:', error);
      Utils.showToast('Failed to get weather for this location', 'error');
    } finally {
      Utils.showLoading(false);
    }
  }

  /**
   * Show map error
   * @param {string} message - Error message
   */
  showMapError(message) {
    const mapContainer = document.getElementById('weather-map');
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-secondary);
          text-align: center;
          padding: var(--spacing-xl);
        ">
          <i class="fas fa-map" style="font-size: 3rem; margin-bottom: var(--spacing-lg); color: var(--text-tertiary);"></i>
          <h3 style="color: var(--text-primary); margin-bottom: var(--spacing-sm);">Map Unavailable</h3>
          <p>${message}</p>
          <button onclick="window.mapsManager.initializeMap()" style="
            margin-top: var(--spacing-lg);
            padding: var(--spacing-sm) var(--spacing-lg);
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: var(--radius-md);
            cursor: pointer;
          ">
            Try Again
          </button>
        </div>
      `;
    }
  }

  /**
   * Update map with new weather data
   * @param {object} weatherData - New weather data
   */
  updateWeatherData(weatherData) {
    this.weatherData = weatherData;
    if (this.map && weatherData) {
      this.addLocationMarker(weatherData);
    }
  }

  /**
   * Resize map (call when container size changes)
   */
  resize() {
    if (this.map) {
      google.maps.event.trigger(this.map, 'resize');
    }
  }
}

// Global callback for Google Maps API
window.initMap = function() {
  if (window.mapsManager) {
    window.mapsManager.initializeMap();
  }
};

// Initialize maps manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.mapsManager = new MapsManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapsManager;
}