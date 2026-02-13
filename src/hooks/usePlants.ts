import { useState, useEffect, useCallback } from 'react';
import { Plant } from '@/types/plant';
import { generateId } from '@/lib/plantUtils';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  setDoc
} from 'firebase/firestore';

const PLANTS_COLLECTION = 'plants';

export const usePlants = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const plantsRef = collection(db, PLANTS_COLLECTION);
    const q = query(plantsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plantsData: Plant[] = [];
      snapshot.forEach((doc) => {
        plantsData.push({ id: doc.id, ...doc.data() } as Plant);
      });
      setPlants(plantsData);
      setLoading(false);
    }, (error) => {
      console.error('Firestore error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addPlant = useCallback(async (plantData: Omit<Plant, 'id' | 'createdAt'>) => {
    try {
      const newPlant = {
        ...plantData,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, PLANTS_COLLECTION), newPlant);
      return { id: docRef.id, ...newPlant } as Plant;
    } catch (error) {
      console.error('Error adding plant:', error);
      throw error;
    }
  }, []);

  const updatePlant = useCallback(async (id: string, updates: Partial<Plant>) => {
    try {
      const plantRef = doc(db, PLANTS_COLLECTION, id);
      await updateDoc(plantRef, updates);
    } catch (error) {
      console.error('Error updating plant:', error);
      throw error;
    }
  }, []);

  const deletePlant = useCallback(async (id: string) => {
    try {
      const plantRef = doc(db, PLANTS_COLLECTION, id);
      await deleteDoc(plantRef);
    } catch (error) {
      console.error('Error deleting plant:', error);
      throw error;
    }
  }, []);

  const waterPlant = useCallback(async (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    await updatePlant(id, { lastWatered: today });
  }, [updatePlant]);

  const getPlantById = useCallback(
    (id: string) => plants.find((plant) => plant.id === id),
    [plants]
  );

  return {
    plants,
    loading,
    addPlant,
    updatePlant,
    deletePlant,
    waterPlant,
    getPlantById,
  };
};
