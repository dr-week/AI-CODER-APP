/**
 * Adaptive Environment Manager (Platform Runtime Abstraction)
 * Detects whether Velocity is running on Desktop (Node.js/Electron/Web) or Android (Capacitor/Mobile)
 * and dynamically swaps storage adapters, terminal execution, and local network tethering.
 */

export type PlatformMode = 'desktop' | 'android' | 'web';

export interface PlatformConfig {
  mode: PlatformMode;
  isTouch: boolean;
  defaultOllamaEndpoint: string;
  supportsWebContainers: boolean;
  defaultTargetDir: string;
}

export function detectPlatformRuntime(): PlatformConfig {
  let mode: PlatformMode = 'web';

  // Check Capacitor / Native Android Bridge
  if (typeof window !== 'undefined' && (window as any).Capacitor?.getPlatform() === 'android') {
    mode = 'android';
  } else if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    mode = 'desktop';
  }

  const isAndroid = mode === 'android';

  return {
    mode,
    isTouch: isAndroid || (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)),
    defaultOllamaEndpoint: isAndroid ? 'http://192.168.1.100:11434' : 'http://localhost:11434',
    supportsWebContainers: !isAndroid, // Desktop/Web native support
    defaultTargetDir: isAndroid ? 'Documents/Velocity' : 'src/app',
  };
}

/**
 * Scans local Wi-Fi LAN subnet on Android to tether to PC Ollama instance,
 * failing over gracefully to Groq cloud API if PC is offline.
 */
export async function tetherMobileOllama(lanIp = '192.168.1.100'): Promise<{ reachable: boolean; endpoint: string; fallbackProvider: string }> {
  const endpoint = `http://${lanIp}:11434/api/tags`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      return { reachable: true, endpoint: `http://${lanIp}:11434/api/chat`, fallbackProvider: 'Ollama-LAN' };
    }
  } catch (e) {
    // Failover to Groq Cloud API
  }

  return {
    reachable: false,
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    fallbackProvider: 'Groq',
  };
}
