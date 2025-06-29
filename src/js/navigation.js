// Navigation and routing functionality
class Navigation {
  constructor() {
    this.currentSection = 'dashboard';
    this.init();
  }

  /**
   * Initialize navigation
   */
  init() {
    this.setupEventListeners();
    this.setupMobileMenu();
    this.handleInitialRoute();
  }

  /**
   * Setup navigation event listeners
   */
  setupEventListeners() {
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('data-section');
        if (section) {
          this.navigateToSection(section);
        }
      });
    });

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
      const section = e.state?.section || 'dashboard';
      this.showSection(section, false);
    });

    // Handle hash changes
    window.addEventListener('hashchange', () => {
      this.handleHashChange();
    });
  }

  /**
   * Setup mobile menu functionality
   */
  setupMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
      });

      // Close mobile menu when clicking on a link
      const navLinks = navMenu.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          navToggle.classList.remove('active');
          navMenu.classList.remove('active');
        });
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
          navToggle.classList.remove('active');
          navMenu.classList.remove('active');
        }
      });
    }
  }

  /**
   * Handle initial route on page load
   */
  handleInitialRoute() {
    const hash = window.location.hash.substring(1);
    const section = hash || 'dashboard';
    this.showSection(section, false);
  }

  /**
   * Handle hash changes
   */
  handleHashChange() {
    const hash = window.location.hash.substring(1);
    const section = hash || 'dashboard';
    if (section !== this.currentSection) {
      this.showSection(section, false);
    }
  }

  /**
   * Navigate to a specific section
   * @param {string} section - Section name
   */
  navigateToSection(section) {
    // Update URL
    const newUrl = `${window.location.pathname}#${section}`;
    history.pushState({ section }, '', newUrl);
    
    // Show section
    this.showSection(section, true);
  }

  /**
   * Show a specific section
   * @param {string} section - Section name
   * @param {boolean} animate - Whether to animate the transition
   */
  showSection(section, animate = true) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => {
      s.classList.remove('active');
      if (animate) {
        s.style.opacity = '0';
        s.style.transform = 'translateY(20px)';
      }
    });

    // Update navigation active state
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === section) {
        link.classList.add('active');
      }
    });

    // Show target section
    const targetSection = document.getElementById(section);
    if (targetSection) {
      if (animate) {
        setTimeout(() => {
          targetSection.classList.add('active');
          targetSection.style.transition = 'all 0.3s ease';
          targetSection.style.opacity = '1';
          targetSection.style.transform = 'translateY(0)';
        }, 150);
      } else {
        targetSection.classList.add('active');
        targetSection.style.opacity = '1';
        targetSection.style.transform = 'translateY(0)';
      }

      // Trigger section-specific initialization
      this.initializeSection(section);
    }

    this.currentSection = section;
  }

  /**
   * Initialize section-specific functionality
   * @param {string} section - Section name
   */
  initializeSection(section) {
    switch (section) {
      case 'dashboard':
        // Dashboard is initialized by default
        break;
      case 'forecast':
        if (window.forecastManager) {
          window.forecastManager.refresh();
        }
        break;
      case 'maps':
        if (window.mapsManager) {
          window.mapsManager.initializeMap();
        }
        break;
      case 'alerts':
        if (window.weatherDisplay) {
          window.weatherDisplay.refreshAlerts();
        }
        break;
      case 'settings':
        if (window.settingsManager) {
          window.settingsManager.loadSettings();
        }
        break;
    }
  }

  /**
   * Get current section
   * @returns {string} Current section name
   */
  getCurrentSection() {
    return this.currentSection;
  }

  /**
   * Check if section exists
   * @param {string} section - Section name
   * @returns {boolean} Whether section exists
   */
  sectionExists(section) {
    return document.getElementById(section) !== null;
  }

  /**
   * Add breadcrumb navigation
   * @param {array} breadcrumbs - Array of breadcrumb objects
   */
  updateBreadcrumbs(breadcrumbs) {
    const breadcrumbContainer = document.getElementById('breadcrumbs');
    if (!breadcrumbContainer) return;

    breadcrumbContainer.innerHTML = '';

    breadcrumbs.forEach((crumb, index) => {
      const isLast = index === breadcrumbs.length - 1;
      
      const breadcrumbItem = document.createElement('span');
      breadcrumbItem.className = 'breadcrumb-item';
      
      if (isLast) {
        breadcrumbItem.textContent = crumb.label;
        breadcrumbItem.classList.add('active');
      } else {
        const link = document.createElement('a');
        link.href = `#${crumb.section}`;
        link.textContent = crumb.label;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.navigateToSection(crumb.section);
        });
        breadcrumbItem.appendChild(link);
      }

      breadcrumbContainer.appendChild(breadcrumbItem);

      if (!isLast) {
        const separator = document.createElement('span');
        separator.className = 'breadcrumb-separator';
        separator.innerHTML = '<i class="fas fa-chevron-right"></i>';
        breadcrumbContainer.appendChild(separator);
      }
    });
  }

  /**
   * Show loading state for section
   * @param {string} section - Section name
   * @param {boolean} show - Whether to show loading
   */
  showSectionLoading(section, show = true) {
    const sectionElement = document.getElementById(section);
    if (!sectionElement) return;

    if (show) {
      sectionElement.classList.add('loading');
    } else {
      sectionElement.classList.remove('loading');
    }
  }

  /**
   * Update page title based on current section
   * @param {string} section - Section name
   */
  updatePageTitle(section) {
    const titles = {
      dashboard: 'Dashboard - Weather Pro',
      forecast: 'Forecast - Weather Pro',
      maps: 'Weather Maps - Weather Pro',
      alerts: 'Weather Alerts - Weather Pro',
      settings: 'Settings - Weather Pro'
    };

    document.title = titles[section] || 'Weather Pro';
  }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.navigation = new Navigation();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Navigation;
}