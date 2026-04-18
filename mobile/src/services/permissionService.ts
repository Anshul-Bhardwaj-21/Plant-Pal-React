/**
 * PermissionService - Device permission management for camera and location
 * 
 * Handles requesting and checking permissions for camera and location access.
 * Provides utilities to open device settings when permissions are denied.
 * 
 * Requirements: 3.2, 3.3, 7.2, 7.3, 14.1, 14.2, 14.4, 14.5, 14.7, 14.8
 */

import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';
import { PermissionService, PermissionStatus } from '../types';

/**
 * Convert expo permission status to our PermissionStatus type
 */
const convertPermissionStatus = (
  status: 'granted' | 'denied' | 'undetermined'
): PermissionStatus => {
  return status as PermissionStatus;
};

/**
 * PermissionService implementation
 */
export const permissionService: PermissionService = {
  /**
   * Request camera permission from the user
   * Returns the permission status after the request
   */
  async requestCameraPermission(): Promise<PermissionStatus> {
    try {
      console.log('[PermissionService] Requesting camera permission');
      
      const { status } = await Camera.requestCameraPermissionsAsync();
      
      console.log('[PermissionService] Camera permission status:', status);
      return convertPermissionStatus(status);
    } catch (error) {
      console.error('[PermissionService] Failed to request camera permission:', error);
      // Return denied on error to prevent app crashes
      return 'denied';
    }
  },

  /**
   * Check current camera permission status without requesting
   * Returns the current permission status
   */
  async checkCameraPermission(): Promise<PermissionStatus> {
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      
      console.log('[PermissionService] Camera permission check:', status);
      return convertPermissionStatus(status);
    } catch (error) {
      console.error('[PermissionService] Failed to check camera permission:', error);
      return 'undetermined';
    }
  },

  /**
   * Request location permission from the user
   * Returns the permission status after the request
   */
  async requestLocationPermission(): Promise<PermissionStatus> {
    try {
      console.log('[PermissionService] Requesting location permission');
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      console.log('[PermissionService] Location permission status:', status);
      return convertPermissionStatus(status);
    } catch (error) {
      console.error('[PermissionService] Failed to request location permission:', error);
      // Return denied on error to prevent app crashes
      return 'denied';
    }
  },

  /**
   * Check current location permission status without requesting
   * Returns the current permission status
   */
  async checkLocationPermission(): Promise<PermissionStatus> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      console.log('[PermissionService] Location permission check:', status);
      return convertPermissionStatus(status);
    } catch (error) {
      console.error('[PermissionService] Failed to check location permission:', error);
      return 'undetermined';
    }
  },

  /**
   * Open device settings to allow user to manually enable permissions
   * This is useful when permissions are permanently denied
   */
  async openSettings(): Promise<void> {
    try {
      console.log('[PermissionService] Opening device settings');
      
      // Linking.openSettings() opens the app's settings page
      await Linking.openSettings();
    } catch (error) {
      console.error('[PermissionService] Failed to open settings:', error);
      
      // Fallback: try to open general settings
      try {
        const settingsUrl = Platform.select({
          ios: 'app-settings:',
          android: 'android.settings.APPLICATION_DETAILS_SETTINGS',
        });
        
        if (settingsUrl) {
          await Linking.openURL(settingsUrl);
        }
      } catch (fallbackError) {
        console.error('[PermissionService] Fallback settings open failed:', fallbackError);
        throw new Error('Unable to open device settings');
      }
    }
  },
};

/**
 * Export utility functions for permission handling
 */
export const permissionUtils = {
  /**
   * Check if permission status is granted
   */
  isGranted: (status: PermissionStatus): boolean => {
    return status === 'granted';
  },

  /**
   * Check if permission status is denied
   */
  isDenied: (status: PermissionStatus): boolean => {
    return status === 'denied';
  },

  /**
   * Check if permission status is undetermined (not yet requested)
   */
  isUndetermined: (status: PermissionStatus): boolean => {
    return status === 'undetermined';
  },

  /**
   * Check if we should show permission rationale
   * Returns true if permission is denied but not permanently
   */
  shouldShowRationale: (status: PermissionStatus): boolean => {
    // On iOS, denied means permanently denied
    // On Android, we can check if we should show rationale
    return status === 'denied';
  },

  /**
   * Get user-friendly message for camera permission denial
   */
  getCameraPermissionMessage: (): string => {
    return 'Camera access is needed to capture plant photos for identification and disease detection. Please enable camera permission in your device settings.';
  },

  /**
   * Get user-friendly message for location permission denial
   */
  getLocationPermissionMessage: (): string => {
    return 'Location access is needed to provide accurate weather information for your plants. You can also manually enter your city if you prefer not to share your location.';
  },

  /**
   * Check if both camera and location permissions are granted
   */
  checkAllPermissions: async (): Promise<{
    camera: PermissionStatus;
    location: PermissionStatus;
    allGranted: boolean;
  }> => {
    const camera = await permissionService.checkCameraPermission();
    const location = await permissionService.checkLocationPermission();
    
    return {
      camera,
      location,
      allGranted: camera === 'granted' && location === 'granted',
    };
  },

  /**
   * Request all permissions at once
   * Useful for initial app setup
   */
  requestAllPermissions: async (): Promise<{
    camera: PermissionStatus;
    location: PermissionStatus;
    allGranted: boolean;
  }> => {
    const camera = await permissionService.requestCameraPermission();
    const location = await permissionService.requestLocationPermission();
    
    return {
      camera,
      location,
      allGranted: camera === 'granted' && location === 'granted',
    };
  },
};

export default permissionService;
