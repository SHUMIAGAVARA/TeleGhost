<script>
  /*
   * DarkVeil Mobile - Оптимизированная версия для мобильных устройств
   * Поддерживает Android, iOS и планшеты
   * Автоматическое масштабирование в зависимости от ориентации
   */

  import { onMount, afterUpdate } from 'svelte';
  import { writable } from 'svelte/store';

  export let visible = true;
  export let intensity = 'normal'; // light, normal, heavy
  export let orientation = 'portrait'; // auto, portrait, landscape

  const isMobile = writable(true);
  const isTablet = writable(false);
  const isIOS = writable(false);
  const isAndroid = writable(false);
  const screenOrientation = writable(orientation);

  let canvas;
  let container;
  let gl;
  let program;
  let frameId;
  let startTime;
  let initialized = false;
  let animationFrameTime = 0;
  let lastFrameTime = 0;

  // Улучшенный vertex shader для мобильных устройств
  const vertex = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  // Оптимизированный fragment shader для мобильных
  const fragment = `
    #ifdef GL_ES
    precision mediump float;
    #endif

    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uHueShift;
    uniform float uNoise;
    uniform float uScan;
    uniform float uScanFreq;
    uniform float uWarp;

    float rand(vec2 c) {
      return fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453);
    }

    mat3 rgb2yiq = mat3(0.299, 0.587, 0.114, 0.596, -0.274, -0.322, 0.211, -0.523, 0.312);
    mat3 yiq2rgb = mat3(1.0, 0.956, 0.621, 1.0, -0.272, -0.647, 1.0, -1.106, 1.703);

    vec3 hueShiftRGB(vec3 col, float deg) {
      vec3 yiq = rgb2yiq * col;
      float rad = radians(deg);
      float cosh = cos(rad), sinh = sin(rad);
      vec3 yiqShift = vec3(yiq.x, yiq.y * cosh - yiq.z * sinh, yiq.y * sinh + yiq.z * cosh);
      return clamp(yiq2rgb * yiqShift, 0.0, 1.0);
    }

    vec4 sigmoid(vec4 x) {
      return 1.0 / (1.0 + exp(-x));
    }

    vec4 cppn_fn(vec2 coordinate, float in0, float in1, float in2) {
      vec4 buf[8];
      buf[6] = vec4(coordinate.x, coordinate.y, 0.3948333106474662 + in0, 0.36 + in1);
      buf[7] = vec4(0.14 + in2, sqrt(coordinate.x * coordinate.x + coordinate.y * coordinate.y), 0.0, 0.0);

      buf[0] = mat4(
        vec4(6.5404263, -3.6126034, 0.7590882, -1.13613),
        vec4(2.4582713, 3.1660357, 1.2219609, 0.06276096),
        vec4(-5.478085, -6.159632, 1.8701609, -4.7742867),
        vec4(6.039214, -5.542865, -0.90925294, 3.251348)
      ) * buf[6] + mat4(
        vec4(0.8473259, -5.722911, 3.975766, 1.6522468),
        vec4(-0.24321538, 0.5839259, -1.7661959, -5.350116),
        vec4(0.0, 0.0, 0.0, 0.0),
        vec4(0.0, 0.0, 0.0, 0.0)
      ) * buf[7] + vec4(0.21808943, 1.1243913, -1.7969975, 5.0294676);

      buf[0] = sigmoid(buf[0]);

      buf[1] = mat4(
        vec4(-3.3522482, -6.0612736, 0.55641043, -4.4719114),
        vec4(0.8631464, 1.7432913, 5.643898, 1.6106541),
        vec4(2.4941394, -3.5012043, 1.7184316, 6.357333),
        vec4(3.310376, 8.209261, 1.1355612, -1.165539)
      ) * buf[6] + mat4(
        vec4(5.24046, -13.034365, 0.009859298, 15.870829),
        vec4(2.987511, 3.129433, -0.89023495, -1.6822904),
        vec4(0.0, 0.0, 0.0, 0.0),
        vec4(0.0, 0.0, 0.0, 0.0)
      ) * buf[7] + vec4(-5.9457836, -6.573602, -0.8812491, 1.5436668);

      buf[1] = sigmoid(buf[1]);

      return vec4(buf[0].x, buf[0].y, buf[1].z, 1.0);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / uResolution.xy * 2.0 - 1.0;
      uv.y *= -1.0;
      uv += uWarp * vec2(sin(uv.y * 6.283 + uTime * 0.5), cos(uv.x * 6.283 + uTime * 0.5)) * 0.05;

      vec4 col = cppn_fn(uv, 0.1 * sin(0.3 * uTime), 0.1 * sin(0.69 * uTime), 0.1 * sin(0.44 * uTime));
      col.rgb = hueShiftRGB(col.rgb, uHueShift);

      float scanline_val = sin(gl_FragCoord.y * uScanFreq) * 0.5 + 0.5;
      col.rgb *= 1.0 - (scanline_val * scanline_val) * uScan;
      col.rgb += (rand(gl_FragCoord.xy + uTime) - 0.5) * uNoise;

      gl_FragColor = vec4(clamp(col.rgb, 0.0, 1.0), 1.0);
    }
  `;

  function detectMobileDevice() {
    const ua = navigator.userAgent;
    const isIosDevice = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroidDevice = /Android/.test(ua);
    const isTabletDevice =
      /iPad|Android/.test(ua) && !/Mobile|iPhone/.test(ua);

    isIOS.set(isIosDevice);
    isAndroid.set(isAndroidDevice);
    isTablet.set(isTabletDevice);
    isMobile.set(true);
  }

  function getIntensitySettings() {
    const settings = {
      light: {
        hueShift: 0,
        noiseIntensity: 0.01,
        scanlineIntensity: 0.05,
        speed: 0.3,
        scanlineFrequency: 1.0,
        warpAmount: 0.01,
        frameSkip: 2
      },
      normal: {
        hueShift: 0,
        noiseIntensity: 0.05,
        scanlineIntensity: 0.1,
        speed: 0.5,
        scanlineFrequency: 2.0,
        warpAmount: 0.02,
        frameSkip: 1
      },
      heavy: {
        hueShift: 0,
        noiseIntensity: 0.1,
        scanlineIntensity: 0.2,
        speed: 0.7,
        scanlineFrequency: 3.0,
        warpAmount: 0.03,
        frameSkip: 0
      }
    };

    return settings[intensity] || settings.normal;
  }

  function handleOrientationChange() {
    const isPortrait = window.innerHeight > window.innerWidth;
    screenOrientation.set(isPortrait ? 'portrait' : 'landscape');
  }

  function initWebGL() {
    if (!canvas || !visible || initialized) return;

    try {
      gl = canvas.getContext('webgl', { antialias: false, preserveDrawingBuffer: false });
      if (!gl) {
        console.warn('WebGL not supported on this mobile device');
        return;
      }

      const triangleBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, vertex);
      gl.compileShader(vertexShader);

      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('Vertex shader error:', gl.getShaderInfoLog(vertexShader));
        return;
      }

      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, fragment);
      gl.compileShader(fragmentShader);

      if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('Fragment shader error:', gl.getShaderInfoLog(fragmentShader));
        return;
      }

      program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return;
      }

      gl.useProgram(program);

      const posAttrib = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(posAttrib);
      gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);

      startTime = performance.now();
      initialized = true;
      animate();
    } catch (e) {
      console.error('WebGL initialization error:', e);
    }
  }

  function resizeCanvas() {
    if (!canvas || !container || !gl) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    gl.viewport(0, 0, canvas.width, canvas.height);

    if (program) {
      const uResolution = gl.getUniformLocation(program, 'uResolution');
      gl.uniform2f(uResolution, w, h);
    }
  }

  function animate() {
    if (!gl || !program || !visible) return;

    const settings = getIntensitySettings();
    const now = performance.now();
    animationFrameTime = now - lastFrameTime;
    lastFrameTime = now;

    const elapsed = (now - startTime) / 1000;

    gl.useProgram(program);

    gl.uniform1f(gl.getUniformLocation(program, 'uTime'), elapsed * settings.speed);
    gl.uniform1f(gl.getUniformLocation(program, 'uHueShift'), settings.hueShift);
    gl.uniform1f(gl.getUniformLocation(program, 'uNoise'), settings.noiseIntensity);
    gl.uniform1f(gl.getUniformLocation(program, 'uScan'), settings.scanlineIntensity);
    gl.uniform1f(gl.getUniformLocation(program, 'uScanFreq'), settings.scanlineFrequency);
    gl.uniform1f(gl.getUniformLocation(program, 'uWarp'), settings.warpAmount);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    frameId = requestAnimationFrame(animate);
  }

  onMount(() => {
    detectMobileDevice();
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', handleOrientationChange);

    initWebGL();

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (gl) {
        gl.deleteProgram(program);
      }
    };
  });

  afterUpdate(() => {
    if (visible && !initialized) {
      initWebGL();
    }
    resizeCanvas();
  });
</script>

<div bind:this={container} class="darkveil-mobile" class:ios={$isIOS} class:android={$isAndroid} class:tablet={$isTablet}>
  <canvas bind:this={canvas} class="darkveil-mobile-canvas" />
</div>

<style>
  :global .darkveil-mobile {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000;
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      touch-action: none;
    }

    .darkveil-mobile-canvas {
      display: block;
      width: 100%;
      height: 100%;
      image-rendering: pixelated;
      image-rendering: -ms-interpolation-mode-nearest-neighbor;
    }

    .darkveil-mobile.ios {
      -webkit-appearance: none;
      appearance: none;
    }

    .darkveil-mobile.android {
      will-change: transform;
    }

    .darkveil-mobile.tablet .darkveil-mobile-canvas {
      image-rendering: -webkit-optimize-contrast;
    }

    /* Portrait orientation */
    @media (orientation: portrait) {
      .darkveil-mobile {
        display: flex;
        flex-direction: column;
      }
    }

    /* Landscape orientation */
    @media (orientation: landscape) {
      .darkveil-mobile {
        display: flex;
        flex-direction: row;
      }
    }

    /* iPhone X+ notch support */
    @supports (padding: max(0px)) {
      .darkveil-mobile.ios {
        padding-top: max(0px, env(safe-area-inset-top));
        padding-left: max(0px, env(safe-area-inset-left));
        padding-right: max(0px, env(safe-area-inset-right));
        padding-bottom: max(0px, env(safe-area-inset-bottom));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .darkveil-mobile-canvas {
        animation: none;
      }
    }
</style>
