import { db } from '@/config/firebaseConfig';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, setDoc, query, where } from 'firebase/firestore';

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  imageData: string;
  stock: number;
  createdAt?: any;
  updatedAt?: any;
}

export const ShopService = {
  async getProducts(): Promise<Product[]> {
    const snapshot = await getDocs(collection(db, 'products'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  },

  async getProduct(id: string): Promise<Product | null> {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Product : null;
  },

  async addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, imageFile: File): Promise<void> {
    try {
      // Convert image to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(imageFile);
      const imageData = await base64Promise;

      // Add product to Firestore with base64 image
      await addDoc(collection(db, 'products'), {
        ...product,
        imageData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  async updateProduct(id: string, product: Partial<Product>, imageFile?: File): Promise<void> {
    try {
      let imageData = product.imageData;
      
      if (imageFile) {
        // Convert new image to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
        reader.readAsDataURL(imageFile);
        imageData = await base64Promise;
      }

      await updateDoc(doc(db, 'products', id), {
        ...product,
        ...(imageData ? { imageData } : {}),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    await deleteDoc(doc(db, 'products', id));
  },

  // Cart functions
  async getCart(userId: string) {
    const docRef = doc(db, 'carts', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().items || [] : [];
  },

  async addToCart(userId: string, productId: string, quantity: number) {
    const docRef = doc(db, 'carts', userId);
    const docSnap = await getDoc(docRef);
    let items = docSnap.exists() ? docSnap.data().items || [] : [];
    const idx = items.findIndex((item: any) => item.productId === productId);
    if (idx > -1) {
      items[idx].quantity += quantity;
    } else {
      items.push({ productId, quantity });
    }
    await setDoc(docRef, { items }, { merge: true });
  },

  async removeFromCart(userId: string, productId: string) {
    const docRef = doc(db, 'carts', userId);
    const docSnap = await getDoc(docRef);
    let items = docSnap.exists() ? docSnap.data().items || [] : [];
    items = items.filter((item: any) => item.productId !== productId);
    await setDoc(docRef, { items }, { merge: true });
  },

  async clearCart(userId: string) {
    await setDoc(doc(db, 'carts', userId), { items: [] }, { merge: true });
  }
}; 