// In gpsWatcher.ts
 
export interface GPSUpdate {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  heading?: number | null;
  speed?: number | null;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
}
 
export interface GPSWatcher {
  stop: () => void;
  getLastKnownPosition: () => GPSUpdate | null;
}
 
export function startGPSWatcher(
  onUpdate: (data: GPSUpdate) => void,
  onError?: (err: GeolocationPositionError) => void
): GPSWatcher {
  if (!("geolocation" in navigator)) {
    const err = {
      code: 1, // PERMISSION_DENIED
      message: "Geolocation not supported",
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3
    } as GeolocationPositionError;
 
    onError?.(err);
    return {
      stop: () => { },
      getLastKnownPosition: () => null
    };
  }
 
  let watchId: number | null = null;
  let active = true;
  let lastKnownPosition: GPSUpdate | null = null;
  let retryCount = 0;
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 2000;
  const MIN_ACCURACY = 100; // meters
  const MIN_DISTANCE_CHANGE = 5; // meters
 
  const options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0, // Always get a fresh position
  };
 
  // Helper: one-shot getCurrentPosition as a Promise
  const singlePosition = (opts: PositionOptions) =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      try {
        navigator.geolocation.getCurrentPosition(resolve, reject, opts);
      } catch (err) {
        reject(err);
      }
    });
 
  // Check permission state if Permissions API is available
  const getGeolocationPermissionState = async (): Promise<PermissionState | 'unsupported'> => {
    try {
      if (!('permissions' in navigator)) return 'unsupported';
      // Some TS definitions require casting here
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const status = await navigator.permissions.query({ name: 'geolocation' });
      return status.state as PermissionState;
    } catch (err) {
      return 'unsupported';
    }
  };
 
  const handlePosition = (pos: GeolocationPosition) => {
    if (!active) return;
 
    const newPosition: GPSUpdate = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy ?? Number.MAX_SAFE_INTEGER,
      heading: pos.coords.heading ?? null,
      speed: pos.coords.speed ?? null,
      altitude: pos.coords.altitude ?? null,
      altitudeAccuracy: pos.coords.altitudeAccuracy ?? null,
      timestamp: pos.timestamp || Date.now(),
    };
 
    // Only update if position has changed significantly or accuracy improved
    const shouldUpdate =
      !lastKnownPosition ||
      haversineMeters(lastKnownPosition, newPosition) > MIN_DISTANCE_CHANGE ||
      (newPosition.accuracy < lastKnownPosition.accuracy * 0.8 && newPosition.accuracy < MIN_ACCURACY * 2) ||
      (newPosition.accuracy < MIN_ACCURACY && lastKnownPosition.accuracy > MIN_ACCURACY);
 
    if (shouldUpdate) {
      lastKnownPosition = newPosition;
      onUpdate(newPosition);
    }
  };
 
  const handleError = (err: GeolocationPositionError) => {
    if (!active) return;
 
    // If we get a timeout and haven't exceeded max retries, try again
    if ((err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE) && retryCount < MAX_RETRIES) {
      retryCount++;
      const delay = RETRY_DELAY * Math.pow(2, retryCount - 1); // Exponential backoff
      setTimeout(() => {
        if (active) attachWatcher();
      }, Math.min(delay, 30000)); // Max 30 seconds delay
      return;
    }
 
    onError?.(err);
  };
 
  const attachWatcher = () => {
    if (!active) return;
 
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
 
    try {
      watchId = navigator.geolocation.watchPosition(
        handlePosition,
        handleError,
        options
      );
    } catch (err) {
      onError?.(err as GeolocationPositionError);
    }
  };
 
  (async () => {
    // Try a one-shot position immediately unless permission is explicitly denied.
    const perm = await getGeolocationPermissionState();
    if (perm === 'denied') {
      // Inform caller about denied permission but still attach watcher (watch will also error)
      const err = {
        code: 1,
        message: 'Geolocation permission denied',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      } as GeolocationPositionError;
      onError?.(err);
    } else {
      try {
        const pos = await singlePosition(options);
        handlePosition(pos);
      } catch (err) {
        // If one-shot failed (including user prompt flow), continue to attach watcher
      }
    }
 
    // Always attach watcher to continue updates / retries
    attachWatcher();
  })();
 
  return {
    stop() {
      active = false;
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
    },
    getLastKnownPosition: () => lastKnownPosition
  };
}
 
export async function getCurrentLocation(
  desiredAccuracy = 30, // meters (ignore on browsers - just return first result)
  maxWaitMs = 20000,    // 20 seconds max
  maxRetries = 3        // Maximum number of retry attempts
): Promise<{ lat: number; lng: number; accuracy: number }> {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    throw new Error('Geolocation not supported');
  }

  let lastError: Error | null = null;
 
  // Quick permission check
  const checkPermissionState = async (): Promise<PermissionState | 'unsupported'> => {
    try {
      if (!('permissions' in navigator)) return 'unsupported';
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const status = await navigator.permissions.query({ name: 'geolocation' });
      return status.state as PermissionState;
    } catch (err) {
      return 'unsupported';
    }
  };
 
  const singlePosition = (opts: PositionOptions) =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      const timeoutId = setTimeout(
        () => reject(new Error('getCurrentPosition timeout')),
        opts.timeout || 10000
      );
      
      try {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeoutId);
            resolve(pos);
          },
          (err) => {
            clearTimeout(timeoutId);
            reject(err);
          },
          opts
        );
      } catch (err) {
        clearTimeout(timeoutId);
        reject(err);
      }
    });
 
  try {
    const perm = await checkPermissionState();
    if (perm === 'denied') {
      throw new Error('Geolocation permission denied');
    }
  } catch (err) {
    if ((err as Error).message === 'Geolocation permission denied') {
      throw err;
    }
  }

  // 🔥 FAST PATH: Try immediate fast fetch with short timeout (browser-friendly)
  try {
    const fastOptions: PositionOptions = {
      enableHighAccuracy: false,  // ⚡ Faster on browsers
      timeout: 8000,              // 8 seconds for fast path
      maximumAge: 5000,           // Accept cached position if < 5s old
    };
    const pos = await singlePosition(fastOptions);
    const accuracy = pos.coords.accuracy ?? Number.MAX_SAFE_INTEGER;
    
    console.warn('✅ Fast path success:', { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy });
    
    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy,
    };
  } catch (err) {
    console.warn('⚠️ Fast path failed, retrying...', (err as Error).message);
  }

  // 🔄 RETRY LOOP: Multiple attempts with increasing tolerance
  const overallStart = Date.now();

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      // Check if we've exceeded overall time budget
      const elapsed = Date.now() - overallStart;
      if (elapsed >= maxWaitMs) {
        throw new Error('Overall timeout exceeded');
      }

      const remainingTime = maxWaitMs - elapsed;
      
      // Give each attempt enough time (prefer longer timeout on first attempts)
      const perAttemptTimeout = attempt === 1 
        ? Math.min(10000, Math.max(5000, remainingTime - 2000))
        : Math.min(8000, Math.max(3000, remainingTime - 1000));

      const options: PositionOptions = {
        enableHighAccuracy: attempt <= 2 ? false : true,  // Use high accuracy only on later attempts
        timeout: perAttemptTimeout,
        maximumAge: attempt === 1 ? 5000 : 0,            // Accept cache on first attempt only
      };

      console.warn(`🔄 Attempt ${attempt}/${maxRetries + 1}: timeout=${perAttemptTimeout}ms, enableHighAccuracy=${options.enableHighAccuracy}`);

      const pos = await singlePosition(options);
      const accuracy = pos.coords.accuracy ?? Number.MAX_SAFE_INTEGER;

      console.warn(`✅ Attempt ${attempt} success:`, { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy });

      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy,
      };
    } catch (error) {
      lastError = error as Error;
      console.warn(`❌ Attempt ${attempt} failed:`, (error as Error).message);
     
      // If we have more retries left, wait before trying again
      if (attempt <= maxRetries) {
        const backoffTime = 500 + (attempt * 300); // 800ms, 1100ms, 1400ms
        console.warn(`⏳ Waiting ${backoffTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }
 
  // If we've exhausted all retries, throw the last error
  console.error('❌ Failed after all attempts. Last error:', lastError?.message);
  throw lastError || new Error('Failed to get location after multiple attempts');
}
 
// Helper function to calculate distance between two points in meters using Haversine formula
function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
 
  const a_hav =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a_hav), Math.sqrt(1 - a_hav));
 
  return R * c;
}