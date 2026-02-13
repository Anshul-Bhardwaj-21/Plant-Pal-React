import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

const defaultPlants = [
  {
    name: 'Rose',
    type: 'flower',
    waterFrequency: 'daily',
    sunlight: 'full-sun',
    lastWatered: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Aloe Vera',
    type: 'succulent',
    waterFrequency: 'weekly',
    sunlight: 'partial-sun',
    lastWatered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Basil',
    type: 'herb',
    waterFrequency: 'every-2-days',
    sunlight: 'full-sun',
    lastWatered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
];

export const initializeDefaultPlants = async () => {
  try {
    const plantsRef = collection(db, 'plants');
    const snapshot = await getDocs(plantsRef);
    
    if (snapshot.empty) {
      for (const plant of defaultPlants) {
        await addDoc(plantsRef, plant);
      }
      console.log('Default plants initialized');
    }
  } catch (error) {
    console.error('Error initializing plants:', error);
  }
};
