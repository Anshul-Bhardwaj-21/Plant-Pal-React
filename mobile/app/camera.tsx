/**
 * CameraScreen - Camera interface for capturing plant photos
 * 
 * Provides live camera preview, photo capture, camera flip, and gallery selection.
 * Handles permission requests and displays appropriate modals for denied permissions.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.10, 14.1, 14.2, 14.3
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { permissionService } from '../src/services/permissionService';
import { imageService } from '../src/services/imageService';

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  
  // State
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // Check permission status on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const status = await permissionService.checkCameraPermission();
    if (status === 'denied') {
      setShowPermissionModal(true);
    }
  };

  // Handle permission request
  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result.granted) {
      setShowPermissionModal(false);
    } else {
      setShowPermissionModal(true);
    }
  };

  // Toggle camera facing (front/back)
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // Capture photo
  const capturePhoto = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);

      // Take picture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (!photo) {
        throw new Error('Failed to capture photo');
      }

      // Process the image (resize and compress)
      const processedUri = await imageService.processImage(photo.uri);

      // Navigate back with the image URI
      // The calling screen should handle the image
      router.back();
      
      // TODO: Pass the image URI to the calling screen
      // This will be handled in the plant identification flow (Task 8)
      console.log('[CameraScreen] Photo captured and processed:', processedUri);
      
    } catch (error) {
      console.error('[CameraScreen] Failed to capture photo:', error);
      Alert.alert(
        'Capture Failed',
        'Failed to capture photo. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Select from gallery
  const selectFromGallery = async () => {
    try {
      setIsProcessing(true);

      const imageUri = await imageService.selectFromGallery();

      if (imageUri) {
        // Navigate back with the image URI
        router.back();
        
        // TODO: Pass the image URI to the calling screen
        console.log('[CameraScreen] Image selected from gallery:', imageUri);
      }
    } catch (error) {
      console.error('[CameraScreen] Failed to select from gallery:', error);
      
      if (error instanceof Error && error.message.includes('permission')) {
        Alert.alert(
          'Permission Required',
          'Gallery permission is required to select photos. Please enable it in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => permissionService.openSettings() },
          ]
        );
      } else {
        Alert.alert(
          'Selection Failed',
          'Failed to select image from gallery. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Open device settings
  const openSettings = async () => {
    try {
      await permissionService.openSettings();
    } catch (error) {
      console.error('[CameraScreen] Failed to open settings:', error);
      Alert.alert(
        'Error',
        'Unable to open device settings. Please open settings manually and enable camera permission for PlantPal.',
        [{ text: 'OK' }]
      );
    }
  };

  // Permission Modal
  const renderPermissionModal = () => (
    <Modal
      visible={showPermissionModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowPermissionModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Camera Permission Required</Text>
          <Text style={styles.modalMessage}>
            Camera access is needed to capture plant photos for identification and disease detection.
          </Text>
          
          <View style={styles.modalButtons}>
            <Pressable
              style={[styles.modalButton, styles.settingsButton]}
              onPress={openSettings}
            >
              <Text style={styles.modalButtonText}>Open Settings</Text>
            </Pressable>
            
            <Pressable
              style={[styles.modalButton, styles.galleryButton]}
              onPress={() => {
                setShowPermissionModal(false);
                selectFromGallery();
              }}
            >
              <Text style={styles.modalButtonText}>Use Gallery Instead</Text>
            </Pressable>
            
            <Pressable
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowPermissionModal(false);
                router.back();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Loading indicator
  if (isProcessing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Processing image...</Text>
      </View>
    );
  }

  // Permission not granted
  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionMessage}>
            We need camera access to capture plant photos for identification and disease detection.
          </Text>
          
          <Pressable
            style={styles.permissionButton}
            onPress={handleRequestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
          
          <Pressable
            style={styles.galleryFallbackButton}
            onPress={selectFromGallery}
          >
            <Text style={styles.galleryFallbackText}>Use Gallery Instead</Text>
          </Pressable>
          
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
        
        {renderPermissionModal()}
      </View>
    );
  }

  // Camera view
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        onCameraReady={() => setCameraReady(true)}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Text style={styles.headerButtonText}>✕</Text>
          </Pressable>
          
          <Text style={styles.headerTitle}>Take Photo</Text>
          
          <View style={styles.headerButton} />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Gallery button */}
          <Pressable
            style={styles.controlButton}
            onPress={selectFromGallery}
            disabled={isProcessing}
          >
            <Text style={styles.controlButtonText}>📷</Text>
            <Text style={styles.controlButtonLabel}>Gallery</Text>
          </Pressable>

          {/* Capture button */}
          <Pressable
            style={[
              styles.captureButton,
              !cameraReady && styles.captureButtonDisabled,
            ]}
            onPress={capturePhoto}
            disabled={!cameraReady || isProcessing}
          >
            <View style={styles.captureButtonInner} />
          </Pressable>

          {/* Flip camera button */}
          <Pressable
            style={styles.controlButton}
            onPress={toggleCameraFacing}
            disabled={isProcessing}
          >
            <Text style={styles.controlButtonText}>🔄</Text>
            <Text style={styles.controlButtonLabel}>Flip</Text>
          </Pressable>
        </View>
      </CameraView>

      {/* Loading overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#4ade80" />
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}

      {renderPermissionModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  // Controls
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
  },
  controlButtonText: {
    fontSize: 32,
    marginBottom: 4,
  },
  controlButtonLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },

  // Capture button
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },

  // Permission screen
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#4ade80',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    maxWidth: 300,
  },
  permissionButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  galleryFallbackButton: {
    backgroundColor: '#374151',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    maxWidth: 300,
  },
  galleryFallbackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: {
    gap: 12,
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  settingsButton: {
    backgroundColor: '#4ade80',
  },
  galleryButton: {
    backgroundColor: '#374151',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '600',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
});
