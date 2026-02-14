/**
 * DarkVeil Configuration
 * Конфигурация для разных платформ и устройств
 */

export const darkVeilConfig = {
  // ============ Глобальные настройки ============
  global: {
    enabled: true,
    zIndex: -1,
    smoothRendering: true,
    enableCache: false
  },

  // ============ Настройки для Desktop ============
  desktop: {
    quality: 'high',
    dpr: 2,
    resolutionScale: 1,
    fps: 60,
    hueShift: 0,
    noiseIntensity: 0.05,
    scanlineIntensity: 0.1,
    scanlineFrequency: 2.0,
    speed: 0.5,
    warpAmount: 0.02,
    updateInterval: 16, // ms (60 fps)
    enableEffects: true,
    maxWidth: null,
    maxHeight: null
  },

  // ============ Настройки для Tablet ============
  tablet: {
    quality: 'medium',
    dpr: 2,
    resolutionScale: 0.75,
    fps: 30,
    hueShift: 0,
    noiseIntensity: 0.03,
    scanlineIntensity: 0.08,
    scanlineFrequency: 1.5,
    speed: 0.4,
    warpAmount: 0.015,
    updateInterval: 33, // ms (30 fps)
    enableEffects: true,
    maxWidth: null,
    maxHeight: null
  },

  // ============ Настройки для Mobile (Handset) ============
  mobile: {
    quality: 'low',
    dpr: 1,
    resolutionScale: 0.5,
    fps: 24,
    hueShift: 0,
    noiseIntensity: 0.02,
    scanlineIntensity: 0.05,
    scanlineFrequency: 1.0,
    speed: 0.3,
    warpAmount: 0.01,
    updateInterval: 42, // ms (24 fps)
    enableEffects: false,
    maxWidth: 393, // Typical mobile width
    maxHeight: 851, // Typical mobile height
    frameSkip: 1
  },

  // ============ Специфичные настройки для iOS ============
  ios: {
    // Наследуется из mobile/tablet в зависимости от типа устройства
    allowMemoryCaching: false,
    useMetalIfAvailable: true,
    enableSafeAreaSupport: true,
    respectSystemSettings: true,
    cpuThrottle: 0.9, // Немного медленнее из-за особенностей iOS
    memoryLimit: 256 * 1024 * 1024 // 256 MB
  },

  // ============ Специфичные настройки для Android ============
  android: {
    // Наследуется из mobile/tablet в зависимости от типа устройства
    allowMemoryCaching: true,
    useVulkanIfAvailable: false,
    enableStatusBarSupport: true,
    respectSystemSettings: true,
    cpuThrottle: 1.0,
    memoryLimit: 512 * 1024 * 1024, // 512 MB для Android
    lowBatteryThreshold: 20, // % батареи

    // Android версии
    versions: {
      '6.0': { quality: 'low', fps: 20 },
      '7.0': { quality: 'low', fps: 24 },
      '8.0': { quality: 'medium', fps: 24 },
      '9.0': { quality: 'medium', fps: 30 },
      '10.0': { quality: 'medium', fps: 30 },
      '11.0': { quality: 'high', fps: 30 },
      '12.0': { quality: 'high', fps: 30 },
      '13.0': { quality: 'high', fps: 60 }
    }
  },

  // ============ Специфичные настройки для iOS версий ============
  iosVersions: {
    '12': { quality: 'low', fps: 24 },
    '13': { quality: 'medium', fps: 30 },
    '14': { quality: 'medium', fps: 30 },
    '15': { quality: 'high', fps: 30 },
    '16': { quality: 'high', fps: 60 },
    '17': { quality: 'high', fps: 60 }
  },

  // ============ Настройки производительности ============
  performance: {
    high: {
      quality: 'high',
      dpr: 2,
      resolutionScale: 1,
      fps: 60,
      noiseIntensity: 0.1,
      scanlineIntensity: 0.2,
      enableAllEffects: true
    },
    medium: {
      quality: 'medium',
      dpr: 1.5,
      resolutionScale: 0.75,
      fps: 30,
      noiseIntensity: 0.05,
      scanlineIntensity: 0.1,
      enableAllEffects: true
    },
    low: {
      quality: 'low',
      dpr: 1,
      resolutionScale: 0.5,
      fps: 24,
      noiseIntensity: 0.02,
      scanlineIntensity: 0.05,
      enableAllEffects: false
    }
  },

  // ============ Режимы интенсивности эффектов ============
  intensity: {
    heavy: {
      hueShift: 0,
      noiseIntensity: 0.1,
      scanlineIntensity: 0.2,
      speed: 0.7,
      scanlineFrequency: 3.0,
      warpAmount: 0.03,
      frameSkip: 0
    },
    normal: {
      hueShift: 0,
      noiseIntensity: 0.05,
      scanlineIntensity: 0.1,
      speed: 0.5,
      scanlineFrequency: 2.0,
      warpAmount: 0.02,
      frameSkip: 0
    },
    light: {
      hueShift: 0,
      noiseIntensity: 0.01,
      scanlineIntensity: 0.05,
      speed: 0.3,
      scanlineFrequency: 1.0,
      warpAmount: 0.01,
      frameSkip: 1
    }
  },

  // ============ Брейкпоинты для адаптивности ============
  breakpoints: {
    mobile: {
      max: 599,
      orientation: 'portrait',
      dpr: 1
    },
    mobileLandscape: {
      min: 600,
      max: 904,
      orientation: 'landscape',
      dpr: 1
    },
    tablet: {
      min: 600,
      max: 1024,
      dpr: 2
    },
    desktop: {
      min: 1025,
      dpr: 2
    },
    ultrawide: {
      min: 1441,
      dpr: 2
    }
  },

  // ============ Поддержка батареи ============
  battery: {
    enabled: true,
    lowThreshold: 20, // %
    lowMode: {
      quality: 'low',
      fps: 12,
      noiseIntensity: 0,
      scanlineIntensity: 0.03,
      warpAmount: 0
    }
  },

  // ============ Поддержка Motion ============
  motion: {
    enabled: true,
    reducedMotionMode: {
      speed: 0,
      fps: 1,
      noiseIntensity: 0,
      scanlineIntensity: 0.05,
      warpAmount: 0,
      animationDuration: 0
    }
  },

  // ============ Поддержка видимости ============
  visibility: {
    pauseWhenHidden: true,
    pauseWhenInactive: true,
    inactivityTimeout: 60000 // ms
  },

  // ============ Кэширование ============
  cache: {
    enabled: false,
    maxSize: 10 * 1024 * 1024, // 10 MB
    ttl: 3600000 // 1 hour
  },

  // ============ Отладка ============
  debug: {
    enabled: false,
    logPerformance: false,
    showDeviceInfo: false,
    showFrameRate: false,
    highlightUpdates: false
  }
};

/**
 * Получить конфигурацию для конкретной платформы
 */
export function getConfigForPlatform(platform, capabilities) {
  let config = { ...darkVeilConfig[platform.name.toLowerCase()] };

  // Наследовать платформо-специфичные настройки
  if (platform.name === 'iOS') {
    config = { ...config, ...darkVeilConfig.ios };
  } else if (platform.name === 'Android') {
    config = { ...config, ...darkVeilConfig.android };
  }

  // Применить настройки версии
  if (platform.name === 'iOS' && darkVeilConfig.iosVersions[platform.version]) {
    config = { ...config, ...darkVeilConfig.iosVersions[platform.version] };
  }

  // Применить настройки производительности
  config = { ...config, ...darkVeilConfig.performance[capabilities.performanceClass] };

  return config;
}

/**
 * Получить интенсивность эффектов
 */
export function getIntensityConfig(intensity) {
  return darkVeilConfig.intensity[intensity] || darkVeilConfig.intensity.normal;
}

/**
 * Применить режим низкой батареи
 */
export function getLowBatteryConfig() {
  return darkVeilConfig.battery.lowMode;
}

/**
 * Применить режим reduced motion
 */
export function getReducedMotionConfig() {
  return darkVeilConfig.motion.reducedMotionMode;
}

/**
 * Получить конфигурацию для брейкпоинта
 */
export function getBreakpointConfig(width, height, dpr) {
  let breakpoint = null;

  if (width <= 599) {
    breakpoint = height > width ? 'mobile' : 'mobileLandscape';
  } else if (width <= 1024) {
    breakpoint = 'tablet';
  } else if (width <= 1440) {
    breakpoint = 'desktop';
  } else {
    breakpoint = 'ultrawide';
  }

  return { breakpoint, config: darkVeilConfig.breakpoints[breakpoint] };
}

export default darkVeilConfig;
