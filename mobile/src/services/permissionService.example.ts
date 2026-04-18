/**
 * Example usage of PermissionService
 * 
 * This file demonstrates how to use the permission service in your components
 */

import { permissionService, permissionUtils } from './permissionService';
import { Alert } from 'react-native';

/**
 * Example 1: Request camera permission before opening camera
 */
export const exampleRequestCameraPermission = async () => {
  // Check current permission status
  const currentStatus = await permissionService.checkCameraPermission();
  
  if (permissionUtils.isGranted(currentStatus)) {
    console.log('Camera permission already granted');
    // Proceed to open camera
    return true;
  }
  
  // Request permission
  const status = await permissionService.requestCameraPermission();
  
  if (permissionUtils.isGranted(status)) {
    console.log('Camera permission granted');
    // Proceed to open camera
    return true;
  } else {
    // Permission denied - show explanation and settings option
    Alert.alert(
      'Camera Permission Required',
      permissionUtils.getCameraPermissionMessage(),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => permissionService.openSettings(),
        },
      ]
    );
    return false;
  }
};

/**
 * Example 2: Request location permission for weather
 */
export const exampleRequestLocationPermission = async () => {
  // Check current permission status
  const currentStatus = await permissionService.checkLocationPermission();
  
  if (permissionUtils.isGranted(currentStatus)) {
    console.log('Location permission already granted');
    // Proceed to get location
    return true;
  }
  
  // Request permission
  const status = await permissionService.requestLocationPermission();
  
  if (permissionUtils.isGranted(status)) {
    console.log('Location permission granted');
    // Proceed to get location
    return true;
  } else {
    // Permission denied - show explanation with manual entry option
    Alert.alert(
      'Location Permission Required',
      permissionUtils.getLocationPermissionMessage(),
      [
        { text: 'Enter City Manually', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => permissionService.openSettings(),
        },
      ]
    );
    return false;
  }
};

/**
 * Example 3: Check all permissions on app startup
 */
export const exampleCheckAllPermissions = async () => {
  const result = await permissionUtils.checkAllPermissions();
  
  console.log('Camera permission:', result.camera);
  console.log('Location permission:', result.location);
  console.log('All permissions granted:', result.allGranted);
  
  if (!result.allGranted) {
    // Show onboarding screen explaining permissions
    console.log('Some permissions are missing');
  }
  
  return result;
};

/**
 * Example 4: Request all permissions during onboarding
 */
export const exampleRequestAllPermissions = async () => {
  const result = await permissionUtils.requestAllPermissions();
  
  if (result.allGranted) {
    console.log('All permissions granted - proceed to main app');
    return true;
  } else {
    // Show which permissions are missing
    if (!permissionUtils.isGranted(result.camera)) {
      console.log('Camera permission denied');
    }
    if (!permissionUtils.isGranted(result.location)) {
      console.log('Location permission denied');
    }
    return false;
  }
};

/**
 * Example 5: Handle permission in a React component
 */
export const exampleComponentUsage = `
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { permissionService, permissionUtils } from '../services/permissionService';

export const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const status = await permissionService.checkCameraPermission();
    setHasPermission(permissionUtils.isGranted(status));
    setIsLoading(false);
  };

  const requestPermission = async () => {
    const status = await permissionService.requestCameraPermission();
    
    if (permissionUtils.isGranted(status)) {
      setHasPermission(true);
    } else {
      Alert.alert(
        'Camera Permission Required',
        permissionUtils.getCameraPermissionMessage(),
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => permissionService.openSettings(),
          },
        ]
      );
    }
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!hasPermission) {
    return (
      <View>
        <Text>Camera permission is required</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View>
      <Text>Camera is ready!</Text>
      {/* Camera component here */}
    </View>
  );
};
`;

/**
 * Example 6: Type guard usage
 */
export const exampleTypeGuards = async () => {
  const status = await permissionService.checkCameraPermission();
  
  // Use type guards for cleaner code
  if (permissionUtils.isGranted(status)) {
    console.log('Permission granted');
  } else if (permissionUtils.isDenied(status)) {
    console.log('Permission denied');
  } else if (permissionUtils.isUndetermined(status)) {
    console.log('Permission not yet requested');
  }
};
