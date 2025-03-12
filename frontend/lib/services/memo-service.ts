import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  Timestamp,
  FirestoreError 
} from 'firebase/firestore';

// Define the Memo interface
export interface Memo {
  id?: string;
  research_task: string;
  news_links: string[];
  context: string;
  date_discovered: string;
  theme: string;
  analysis: string;
  created_at?: Timestamp;
}

// Collection reference
const memosCollection = collection(db, 'memos');

// Save a memo to Firestore
export const saveMemo = async (memo: Memo): Promise<Memo> => {
  try {
    // Add timestamp
    const memoWithTimestamp = {
      ...memo,
      created_at: Timestamp.now()
    };
    
    // Add to Firestore
    const docRef = await addDoc(memosCollection, memoWithTimestamp);
    
    // Return the memo with the generated ID
    return {
      ...memo,
      id: docRef.id
    };
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error saving memo:', firestoreError.code, firestoreError.message);
    
    if (firestoreError.code === 'permission-denied') {
      throw new Error('Permission denied: Check your Firebase security rules');
    }
    
    throw error;
  }
};

// Get all memos from Firestore
export const getMemos = async (): Promise<Memo[]> => {
  try {
    // Create a query ordered by created_at in descending order
    const q = query(memosCollection, orderBy('created_at', 'desc'));
    
    // Get the documents
    const querySnapshot = await getDocs(q);
    
    // Map the documents to Memo objects
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Memo));
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error getting memos:', firestoreError.code, firestoreError.message);
    
    if (firestoreError.code === 'permission-denied') {
      throw new Error('Permission denied: Check your Firebase security rules');
    }
    
    throw error;
  }
};

// Filter and sort memos
export interface FilterOptions {
  searchQuery?: string;
  theme?: string;
  sortBy?: 'date_discovered' | 'theme' | 'research_task';
  sortOrder?: 'asc' | 'desc';
}

export const getFilteredMemos = async (options: FilterOptions = {}): Promise<Memo[]> => {
  try {
    // Get all memos first
    const allMemos = await getMemos();
    
    // Apply filters and sorting in memory
    let filteredMemos = [...allMemos];
    
    // Apply search filter
    if (options.searchQuery) {
      const searchLower = options.searchQuery.toLowerCase();
      filteredMemos = filteredMemos.filter(memo => 
        memo.research_task.toLowerCase().includes(searchLower) ||
        memo.theme.toLowerCase().includes(searchLower) ||
        memo.context.toLowerCase().includes(searchLower) ||
        memo.analysis.toLowerCase().includes(searchLower) ||
        memo.news_links.some(link => link.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply theme filter
    if (options.theme) {
      filteredMemos = filteredMemos.filter(memo => 
        memo.theme.toLowerCase() === options.theme?.toLowerCase()
      );
    }
    
    // Apply sorting
    const sortBy = options.sortBy || 'date_discovered';
    const sortOrder = options.sortOrder || 'desc';
    
    filteredMemos.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date_discovered') {
        const dateA = new Date(a.date_discovered);
        const dateB = new Date(b.date_discovered);
        comparison = dateA.getTime() - dateB.getTime();
      } else {
        const valueA = a[sortBy].toLowerCase();
        const valueB = b[sortBy].toLowerCase();
        comparison = valueA.localeCompare(valueB);
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return filteredMemos;
  } catch (error) {
    console.error('Error filtering memos:', error);
    throw error;
  }
};

// Get unique themes for filtering
export const getUniqueThemes = async (): Promise<string[]> => {
  try {
    const memos = await getMemos();
    const themes = new Set<string>();
    
    memos.forEach(memo => {
      if (memo.theme) {
        themes.add(memo.theme);
      }
    });
    
    return Array.from(themes).sort();
  } catch (error) {
    console.error('Error getting unique themes:', error);
    throw error;
  }
};

// Delete a memo from Firestore
export const deleteMemo = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'memos', id);
    await deleteDoc(docRef);
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error deleting memo:', firestoreError.code, firestoreError.message);
    
    if (firestoreError.code === 'permission-denied') {
      throw new Error('Permission denied: Check your Firebase security rules');
    }
    
    throw error;
  }
}; 