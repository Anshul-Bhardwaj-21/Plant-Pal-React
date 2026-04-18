/**
 * ImageService - File system operations for plant images
 * 
 * Handles saving, processing, and managing plant photos using expo-file-system
 * and expo-image-manipulator. Includes image resizing, compression, and cleanup.
 * 
 * Requirements: 3.7, 3.8, 12.1, 12.2, 12.3, 12.4, 12.6, 12.8, 12.9
 */

import { Paths, Directory, File } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { ImageService } from '../types';

// Constants
const IMAGE_DIRECTORY_NAME = 'plant_images';
const MAX_IMAGE_WIDTH = 1024;
const IMAGE_QUALITY = 0.8;
const MAX_STORAGE_MB = 100;

/**
 * Get or create the image directory
 */
const getImageDirectory = (): Directory => {
  return new Directory(Paths.document, IMAGE_DIRECTORY_NAME);
};

/**
 * Ensure the image directory exists
 */
const ensureDirectoryExists = async (): Promise<void> => {
  try {
    const imageDir = getImageDirectory();
    
    if (!imageDir.exists) {
      imageDir.create({ intermediates: true, idempotent: true });
      console.log('[ImageService] Created image directory');
    }
  } catch (error) {
    console.error('[ImageService] Failed to create directory:', error);
    throw new Error('Failed to initialize image storage');
  }
};

/**
 * Generate unique filename for plant image
 */
const generateFilename = (plantId: string): string => {
  const timestamp = Date.now();
  return `${plantId}_${timestamp}.jpg`;
};

/**
 * Check if storage limit is exceeded
 */
const checkStorageLimit = async (): Promise<void> => {
  try {
    const imageDir = getImageDirectory();
    
    if (imageDir.exists) {
      const files = imageDir.list();
      let totalSize = 0;
      
      for (const file of files) {
        if (file instanceof File) {
          totalSize += file.size;
        }
      }
      
      const sizeMB = totalSize / (1024 * 1024);
      if (sizeMB > MAX_STORAGE_MB) {
        console.warn(`[ImageService] Storage limit exceeded: ${sizeMB.toFixed(2)}MB / ${MAX_STORAGE_MB}MB`);
        throw new Error('Image storage limit exceeded - please delete old plants');
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('storage limit')) {
      throw error;
    }
    // Ignore other errors
    console.warn('[ImageService] Could not check storage limit:', error);
  }
};

/**
 * ImageService implementation
 */
export const imageService: ImageService = {
  /**
   * Process image: resize to max 1024px width and compress to 0.8 quality
   * Returns the URI of the processed image
   */
  async processImage(uri: string): Promise<string> {
    try {
      console.log('[ImageService] Processing image:', uri);

      // Manipulate the image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              width: MAX_IMAGE_WIDTH,
            },
          },
        ],
        {
          compress: IMAGE_QUALITY,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      console.log('[ImageService] Image processed successfully');
      return manipulatedImage.uri;
    } catch (error) {
      console.error('[ImageService] Failed to process image:', error);
      // Return original URI as fallback
      return uri;
    }
  },

  /**
   * Save image to file system with unique filename
   * Returns the file path of the saved image
   */
  async saveImage(uri: string, plantId: string): Promise<string> {
    try {
      // Ensure directory exists
      await ensureDirectoryExists();

      // Check storage limit
      await checkStorageLimit();

      // Process the image first
      const processedUri = await this.processImage(uri);

      // Generate unique filename
      const filename = generateFilename(plantId);
      const imageDir = getImageDirectory();
      const sourceFile = new File(processedUri);
      const destFile = new File(imageDir, filename);

      // Copy the processed image to permanent storage
      sourceFile.copy(destFile);

      console.log('[ImageService] Image saved successfully:', destFile.uri);
      return destFile.uri;
    } catch (error) {
      console.error('[ImageService] Failed to save image:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('storage limit')) {
          throw error;
        }
        throw new Error('Failed to save image - please try again');
      }
      
      throw new Error('Failed to save image');
    }
  },

  /**
   * Delete image from file system
   * Gracefully handles missing files
   */
  async deleteImage(filePath: string): Promise<void> {
    try {
      const file = new File(filePath);
      
      if (file.exists) {
        file.delete();
        console.log('[ImageService] Image deleted successfully:', filePath);
      } else {
        console.warn('[ImageService] Image file not found:', filePath);
      }
    } catch (error) {
      console.error('[ImageService] Failed to delete image:', error);
      // Don't throw error - deletion failure shouldn't block other operations
    }
  },

  /**
   * Select image from device gallery
   * Returns the URI of the selected image, or null if cancelled
   */
  async selectFromGallery(): Promise<string | null> {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('[ImageService] Gallery permission denied');
        throw new Error('Gallery permission is required to select photos');
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled) {
        console.log('[ImageService] Image selection cancelled');
        return null;
      }

      console.log('[ImageService] Image selected from gallery');
      return result.assets[0].uri;
    } catch (error) {
      console.error('[ImageService] Failed to select from gallery:', error);
      
      if (error instanceof Error && error.message.includes('permission')) {
        throw error;
      }
      
      throw new Error('Failed to select image from gallery');
    }
  },
};

/**
 * Export utility functions for advanced usage and testing
 */
export const imageUtils = {
  /**
   * Get all image files in the storage directory
   */
  getAllImages: async (): Promise<string[]> => {
    try {
      const imageDir = getImageDirectory();
      
      if (!imageDir.exists) {
        return [];
      }

      const files = imageDir.list();
      return files
        .filter(item => item instanceof File)
        .map(file => file.uri);
    } catch (error) {
      console.error('[ImageService] Failed to get all images:', error);
      return [];
    }
  },

  /**
   * Get storage usage information
   */
  getStorageInfo: async (): Promise<{
    totalSizeMB: number;
    fileCount: number;
    limitMB: number;
  }> => {
    try {
      const imageDir = getImageDirectory();
      
      if (!imageDir.exists) {
        return {
          totalSizeMB: 0,
          fileCount: 0,
          limitMB: MAX_STORAGE_MB,
        };
      }

      const files = imageDir.list();
      let totalSize = 0;
      let fileCount = 0;

      for (const item of files) {
        if (item instanceof File) {
          totalSize += item.size;
          fileCount++;
        }
      }
      
      return {
        totalSizeMB: totalSize / (1024 * 1024),
        fileCount,
        limitMB: MAX_STORAGE_MB,
      };
    } catch (error) {
      console.error('[ImageService] Failed to get storage info:', error);
      return {
        totalSizeMB: 0,
        fileCount: 0,
        limitMB: MAX_STORAGE_MB,
      };
    }
  },

  /**
   * Clear all images (use with caution!)
   */
  clearAllImages: async (): Promise<void> => {
    try {
      const imageDir = getImageDirectory();
      
      if (imageDir.exists) {
        imageDir.delete();
        console.log('[ImageService] All images cleared');
      }
    } catch (error) {
      console.error('[ImageService] Failed to clear all images:', error);
      throw new Error('Failed to clear images');
    }
  },

  /**
   * Clean up orphaned images (images not associated with any plant)
   */
  cleanupOrphanedImages: async (validFilePaths: string[]): Promise<number> => {
    try {
      const allImages = await imageUtils.getAllImages();
      const validSet = new Set(validFilePaths);
      let deletedCount = 0;

      for (const imagePath of allImages) {
        if (!validSet.has(imagePath)) {
          await imageService.deleteImage(imagePath);
          deletedCount++;
        }
      }

      console.log(`[ImageService] Cleaned up ${deletedCount} orphaned images`);
      return deletedCount;
    } catch (error) {
      console.error('[ImageService] Failed to cleanup orphaned images:', error);
      return 0;
    }
  },
};

export default imageService;
