import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';

export const uploadPlantImage = async (imageData: string, plantId: string): Promise<string> => {
  try {
    const imageRef = ref(storage, `plants/${plantId}/${Date.now()}.jpg`);
    await uploadString(imageRef, imageData, 'data_url');
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deletePlantImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};
