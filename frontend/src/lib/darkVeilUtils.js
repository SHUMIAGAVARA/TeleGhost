/**
 * DarkVeil Platform Detector and Utils
 * Автоматическое определение платформы и выбор оптимального варианта
 */

export const platformDetector = {
  /**
   * Определяет текущую платформу
   */
  getPlatform() {
    const ua = navigator.userAgent;

    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
      return {
        name: 'iOS',
        isMobile: true,
        isTablet: /iPad/.test(ua),
        isHandset: /iPhone|iPod/.test(ua),
        version: this.getIOSVersion()
      };
    }

    if (/Android/.test(ua)) {
      return {
        name: 'Android',
        isMobile: true,
        isTablet: !/Mobile/.test(ua),
        isHandset: /Mobile/.test(ua),
        version: this.getAndroidVersion()
      };
    }

    if (/Mac/.test(ua)) {
      return {
        name: 'macOS',
        isMobile: false,
        isTablet: false,
        isHandset: false,
        version: this.getMacOSVersion()
      };
    }

    if (/Windows/.test(ua)) {
      return {
        name: 'Windows',
        isMobile: false,
        isTablet: false,
        isHandset: false,
        version: this.getWindowsVersion()
      };
    }

    if (/Linux/.test(ua)) {
      return {
        name: 'Linux',
        isMobile: false,
        isTablet: false,
        isHandset: false,
        version: '1.0'
      };
    }

    return {
      name: 'Unknown',
      isMobile: false,
      isTablet: false,
      isHandset: false,
      version: '1.0'
    };
  },

  getIOSVersion() {
    const match = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    return match ? `${match[1]}.${match[2]}` : 'unknown';
  },

  getAndroidVersion() {
    const match = navigator.userAgent.match(/Android (\d+(?:\.\d+)?)/);
    return match ? match[1] : 'unknown';
  },

  getMacOSVersion() {
    const match = navigator.userAgent.match(/Mac OS X (\d+)[_.](\d+)/);
    return match ? `${match[1]}.${match[2]}` : 'unknown';
  },

  getWindowsVersion() {
    const match = navigator.userAgent.match(/Windows NT (\d+\.\d+)/);
    return match ? match[1] : 'unknown';
  },

  /**
   * Определяет возможности устройства
   */
  getDeviceCapabilities() {
    const capabilities = {
      webgl: this.hasWebGL(),
      webgl2: this.hasWebGL2(),
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      deviceMemory: navigator.deviceMemory || 4,
      maxDPR: Math.min(window.devicePixelRatio || 1, 3),
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
    };

    // Определяем производительность
    if (capabilities.deviceMemory >= 8 && capabilities.hardwareConcurrency >= 4) {
      capabilities.performanceClass = 'high';
    } else if (capabilities.deviceMemory >= 4 && capabilities.hardwareConcurrency >= 2) {
      capabilities.performanceClass = 'medium';
    } else {
      capabilities.performanceClass = 'low';
    }

    return capabilities;
  },

  hasWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  },

  hasWebGL2() {
    try {
      const canvas = document.createElement('canvas');
      return !!canvas.getContext('webgl2');
    } catch (e) {
      return false;
    }
  },

  /**
   * Рекомендует оптимальный уровень качества
   */
  recommendedQuality() {
    const capabilities = this.getDeviceCapabilities();

    if (capabilities.performanceClass === 'high') {
      return 'high';
    } else if (capabilities.performanceClass === 'medium') {
      return 'medium';
    } else {
      return 'low';
    }
  },

  /**
   * Рекомендует интенсивность эффектов
   */
  recommendedIntensity() {
    const platform = this.getPlatform();
    const capabilities = this.getDeviceCapabilities();

    if (!platform.isMobile) {
      return 'heavy';
    }

    if (capabilities.performanceClass === 'high') {
      return 'normal';
    } else if (capabilities.performanceClass === 'medium') {
      return 'light';
    } else {
      return 'light';
    }
  },

  /**
   * Определяет нужен ли низкий FPS режим
   */
  shouldReduceFPS() {
    const capabilities = this.getDeviceCapabilities();
    return capabilities.performanceClass === 'low' || (capabilities.deviceMemory && capabilities.deviceMemory < 4);
  },

  /**
   * Проверяет поддержку режима низкого энергопотребления
   */
  isLowPowerModeEnabled() {
    // iOS
    if (navigator.getBattery) {
      return navigator.getBattery().then(battery => battery.level < 0.2 && !battery.charging);
    }

    // Android - проверяем через API если доступен
    return Promise.resolve(false);
  }
};

/**
 * Утилита для выбора правильного компонента
 */
export const componentSelector = {
  shouldUseMobileVersion() {
    const platform = platformDetector.getPlatform();
    const capabilities = platformDetector.getDeviceCapabilities();

    // На мобильных устройствах всегда используем мобильную версию
    if (platform.isMobile) {
      return true;
    }

    // На планшетах могут использовать обе версии в зависимости от качества
    if (capabilities.performanceClass === 'low') {
      return true;
    }

    return false;
  },

  getOptimalProps() {
    const capabilities = platformDetector.getDeviceCapabilities();
    const quality = platformDetector.recommendedQuality();
    const intensity = platformDetector.recommendedIntensity();

    return {
      quality,
      intensity,
      disabled: !capabilities.webgl && !capabilities.webgl2,
      speed: quality === 'high' ? 0.5 : 0.3,
      noiseIntensity: intensity === 'heavy' ? 0.1 : intensity === 'normal' ? 0.05 : 0.01,
      scanlineIntensity: intensity === 'heavy' ? 0.2 : intensity === 'normal' ? 0.1 : 0.05,
      scanlineFrequency: intensity === 'heavy' ? 3.0 : intensity === 'normal' ? 2.0 : 1.0,
      warpAmount: intensity === 'heavy' ? 0.03 : intensity === 'normal' ? 0.02 : 0.01,
      hueShift: 0
    };
  }
};

/**
 * Store для отслеживания состояния DarkVeil
 */
export const darkVeilStore = createDarkVeilStore();

function createDarkVeilStore() {
  const platform = platformDetector.getPlatform();
  const capabilities = platformDetector.getDeviceCapabilities();
  const useMobile = componentSelector.shouldUseMobileVersion();
  const optimalProps = componentSelector.getOptimalProps();

  const store = {
    platform,
    capabilities,
    useMobileVersion: useMobile,
    optimalProps,
    isEnabled: !optimalProps.disabled,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    lowBattery: false,

    /**
     * Обновляет состояние хранилища
     */
    update() {
      this.platform = platformDetector.getPlatform();
      this.capabilities = platformDetector.getDeviceCapabilities();
      this.useMobileVersion = componentSelector.shouldUseMobileVersion();
      this.optimalProps = componentSelector.getOptimalProps();
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

      platformDetector.isLowPowerModeEnabled().then(enabled => {
        this.lowBattery = enabled;
      });
    },

    /**
     * Устанавливает пользовательское качество
     */
    setQuality(quality) {
      this.optimalProps.quality = quality;
    },

    /**
     * Устанавливает пользовательскую интенсивность
     */
    setIntensity(intensity) {
      this.optimalProps.intensity = intensity;
    },

    /**
     * Получает текущие рекомендуемые настройки
     */
    getCurrentSettings() {
      return {
        ...this.optimalProps,
        platform: this.platform.name,
        isLowPower: this.lowBattery,
        reducedMotion: this.reducedMotion
      };
    }
  };

  return store;
}

/**
 * Утилита для применения платформо-специфичных классов
 */
export const platformStyles = {
  getContainerClasses() {
    const platform = platformDetector.getPlatform();
    const store = darkVeilStore;

    const classes = ['dark-veil-wrapper'];

    if (platform.isMobile) {
      classes.push('mobile');
      if (platform.name === 'iOS') {
        classes.push('ios');
      } else if (platform.name === 'Android') {
        classes.push('android');
      }
      if (store.capabilities.orientation === 'landscape') {
        classes.push('landscape');
      } else {
        classes.push('portrait');
      }
    }

    if (store.reducedMotion) {
      classes.push('reduced-motion');
    }

    if (store.darkMode) {
      classes.push('dark-mode');
    }

    return classes.join(' ');
  },

  getPlatformAttribute() {
    return platformDetector.getPlatform().name.toLowerCase();
  }
};

export default {
  platformDetector,
  componentSelector,
  darkVeilStore,
  platformStyles
};
