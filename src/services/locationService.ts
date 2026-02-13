import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  timestamp: number;
}

const LOCATION_CACHE_KEY = 'plantpal_location';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const requestLocationPermission = async (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding using OpenStreetMap Nominatim (free)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          
          const locationData: LocationData = {
            latitude,
            longitude,
            city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
            country: data.address?.country || 'Unknown',
            timestamp: Date.now()
          };
          
          // Cache in localStorage
          localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationData));
          
          resolve(locationData);
        } catch (error) {
          // Fallback without city name
          const locationData: LocationData = {
            latitude,
            longitude,
            city: 'Unknown',
            country: 'Unknown',
            timestamp: Date.now()
          };
          resolve(locationData);
        }
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

export const getCachedLocation = (): LocationData | null => {
  const cached = localStorage.getItem(LOCATION_CACHE_KEY);
  if (!cached) return null;
  
  const location = JSON.parse(cached) as LocationData;
  if (Date.now() - location.timestamp > CACHE_DURATION) {
    return null;
  }
  
  return location;
};

export const getLocation = async (): Promise<LocationData> => {
  const cached = getCachedLocation();
  if (cached) return cached;
  
  return requestLocationPermission();
};

export const saveUserLocation = async (userId: string, location: LocationData): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', userId), {
      location,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving location:', error);
  }
};

export const getUserLocation = async (userId: string): Promise<LocationData | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return docSnap.data().location || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};
