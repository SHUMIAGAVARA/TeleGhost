/**
 * DarkVeil Android Configuration
 * Специфичная конфигурация для Android приложения
 */

export const androidConfig = {
  // ============ Версии Android ============
  minSdkVersion: 21, // Android 5.0
  targetSdkVersion: 33, // Android 13

  // ============ Поддержка WebGL ============
  webgl: {
    enabled: true,
    version: 'auto', // 'auto', 'webgl2', 'webgl'
    preserveDrawingBuffer: false,
    antialias: false,
    maxTextureSize: 4096,
    powerPreference: 'low-power' // 'low-power', 'high-performance', 'default'
  },

  // ============ Оптимизация памяти ============
  memory: {
    maxHeapSize: 512 * 1024 * 1024, // 512 MB
    enableGarbageCollection: true,
    gcInterval: 30000, // 30 seconds
    cacheSize: 50 * 1024 * 1024 // 50 MB
  },

  // ============ Батарея и энергосбережение ============
  battery: {
    lowBatteryThreshold: 20, // %
    enableLowBatteryMode: true,
    enableDozeOptimization: true,
    reducedFPSOnBattery: true
  },

  // ============ Рендеринг ============
  rendering: {
    enableHardwareAcceleration: true,
    enableVsync: true,
    targetFrameRate: 60,
    adaptiveFrameRate: true,
    frameRateReduction: {
      lowBattery: 24,
      backgroundApp: 10,
      screenOff: 0
    }
  },

  // ============ Особые режимы Android ============
  modes: {
    darkMode: {
      enabled: true,
      autoDetect: true,
      colors: {
        background: '#000000',
        foreground: '#ffffff'
      }
    },

    lowLightMode: {
      enabled: true,
      brightness: 0.8
    },

    powerSavingMode: {
      enabled: true,
      reduceQuality: true,
      reduceFrameRate: true,
      disableAnimation: false
    }
  },

  // ============ Поддержка ориентации ============
  orientation: {
    allowPortrait: true,
    allowLandscape: true,
    allowReverse: true,
    allowReversePortrait: false,
    allowReverseLandscape: false,
    lockOrientation: false, // true для блокировки
    autoRotate: true
  },

  // ============ Safe Area (для вырезов и notch) ============
  safeArea: {
    enabled: true,
    enableForStatusBar: true,
    enableForNavigationBar: true
  },

  // ============ Сенсорный ввод ============
  touch: {
    enableTouchOptimization: true,
    enableMultiTouch: true,
    tapDelay: 100, // ms
    longPressDelay: 500 // ms
  },

  // ============ Производительность по версиям ============
  versionOptimizations: {
    '5.0': {
      maxQuality: 'low',
      maxFPS: 20,
      disableEffects: ['warp', 'scanlines']
    },
    '6.0': {
      maxQuality: 'low',
      maxFPS: 24,
      disableEffects: ['warp']
    },
    '7.0': {
      maxQuality: 'medium',
      maxFPS: 30,
      disableEffects: []
    },
    '8.0': {
      maxQuality: 'medium',
      maxFPS: 30,
      disableEffects: []
    },
    '9.0': {
      maxQuality: 'medium',
      maxFPS: 30,
      disableEffects: []
    },
    '10.0': {
      maxQuality: 'high',
      maxFPS: 30,
      disableEffects: []
    },
    '11.0': {
      maxQuality: 'high',
      maxFPS: 60,
      disableEffects: []
    },
    '12.0': {
      maxQuality: 'high',
      maxFPS: 60,
      disableEffects: []
    },
    '13.0': {
      maxQuality: 'high',
      maxFPS: 60,
      disableEffects: []
    }
  },

  // ============ Поддержка различных тип устройств ============
  deviceTypes: {
    phone: {
      quality: 'medium',
      fps: 30,
      resolutionScale: 0.75
    },
    tablet: {
      quality: 'high',
      fps: 30,
      resolutionScale: 1.0
    },
    foldable: {
      quality: 'medium',
      fps: 30,
      resolutionScale: 0.75,
      enableFoldableOptimization: true
    }
  },

  // ============ Обработка фонового режима ============
  backgroundMode: {
    pauseWhen: 'backgrounded', // 'backgrounded', 'screenOff', 'never'
    reduceFPSInBackground: true,
    backgroundFPS: 10,
    useWakeLock: false // требует разрешения
  },

  // ============ Запев ============
  startup: {
    delayRendering: 100, // ms - задержка перед началом рендеринга
    showSplashScreen: true,
    splashScreenDuration: 1000 // ms
  },

  // ============ Отладка и логирование ============
  debug: {
    enabled: false,
    logPerformance: false,
    showDeviceInfo: false,
    showMemoryUsage: false,
    showFPS: false,
    enablePerformanceMonitoring: false,
    monitoringInterval: 5000 // ms
  }
};

/**
 * Получить конфигурацию для конкретной версии Android
 */
export function getAndroidVersionConfig(version) {
  const major = parseInt(version.split('.')[0]);
  const config = androidConfig.versionOptimizations[major.toString()];
  return config || androidConfig.versionOptimizations['13.0'];
}

/**
 * Определить тип устройства
 */
export function detectAndroidDeviceType() {
  // Через Android API (доступно в Wails приложении)
  if (window.wails && window.wails.runtime) {
    // Потом можно добавить реальное определение
  }

  // Через navigator
  const userAgent = navigator.userAgent.toLowerCase();

  if (/tablet|ipad|playbook|silk/.test(userAgent)) {
    return 'tablet';
  }

  if (/foldable|fold/.test(userAgent)) {
    return 'foldable';
  }

  return 'phone';
}

/**
 * Применить конфигурацию для текущего устройства
 */
export function applyAndroidConfig() {
  const deviceType = detectAndroidDeviceType();
  const baseConfig = androidConfig.deviceTypes[deviceType];

  // Дополнительно применить оптимизации для версии
  if (window.navigator.userAgent) {
    const versionMatch = navigator.userAgent.match(/Android (\d+(?:\.\d+)?)/);
    if (versionMatch) {
      const versionConfig = getAndroidVersionConfig(versionMatch[1]);
      return { ...baseConfig, ...versionConfig };
    }
  }

  return baseConfig;
}

/**
 * Настроить обработчик изменения батареи
 */
export function setupBatteryOptimization() {
  if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
      const updateBatteryStatus = () => {
        const isLowBattery = battery.level * 100 < androidConfig.battery.lowBatteryThreshold;
        console.log(`Battery: ${Math.round(battery.level * 100)}%, Charging: ${battery.charging}, Low: ${isLowBattery}`);
        
        // Отправить событие об изменении батареи
        window.dispatchEvent(new CustomEvent('battery-status-changed', {
          detail: {
            level: battery.level,
            charging: battery.charging,
            isLow: isLowBattery
          }
        }));
      };

      battery.addEventListener('levelchange', updateBatteryStatus);
      battery.addEventListener('chargingchange', updateBatteryStatus);

      return updateBatteryStatus;
    });
  }
}

/**
 * Инициализировать все Android специфичные оптимизации
 */
export function initializeAndroidOptimizations() {
  const config = applyAndroidConfig();

  // Применить батарея оптимизацию
  if (config.enableDozeOptimization) {
    setupBatteryOptimization();
  }

  // Применить power saving режим
  if ('permissions' in navigator) {
    navigator.permissions.query({ name: 'notifications' });
  }

  // Настроить orientation
  if (!androidConfig.orientation.lockOrientation) {
    window.addEventListener('orientationchange', handleOrientationChange);
  }

  return config;
}

/**
 * Обработчик изменения ориентации
 */
function handleOrientationChange() {
  const angle = window.orientation || 0;
  console.log(`Orientation changed: ${angle}°`);

  // Отправить событие об изменении ориентации
  window.dispatchEvent(new CustomEvent('device-orientation-changed', {
    detail: { angle, isLandscape: Math.abs(angle) === 90 }
  }));
}

/**
 * Получить информацию об Android устройстве
 */
export function getAndroidDeviceInfo() {
  const ua = navigator.userAgent;

  return {
    userAgent: ua,
    isAndroid: /Android/.test(ua),
    deviceType: detectAndroidDeviceType(),
    model: ua.match(/Android.*; (.*?)\)/)?.[1] || 'Unknown',
    version: ua.match(/Android (\d+(?:\.\d+)?)/)?.[1] || 'Unknown',
    isFoldable: /foldable|fold/.test(ua.toLowerCase()),
    hasNotch: /notch/.test(ua.toLowerCase()),
    screenDensity: window.devicePixelRatio,
    maxMemory: navigator.deviceMemory,
    cores: navigator.hardwareConcurrency
  };
}

export default {
  androidConfig,
  getAndroidVersionConfig,
  detectAndroidDeviceType,
  applyAndroidConfig,
  setupBatteryOptimization,
  initializeAndroidOptimizations,
  getAndroidDeviceInfo
};
