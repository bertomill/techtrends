// Define the Persona type
export interface Persona {
  id?: string;
  name: string;
  position: string;
  interests: string;
  background: string;
}

// Get all personas from localStorage
export const getPersonas = (): Persona[] => {
  try {
    const savedPersonas = localStorage.getItem('personas');
    if (savedPersonas) {
      return JSON.parse(savedPersonas);
    }
    return [];
  } catch (error) {
    console.error('Error fetching personas:', error);
    return [];
  }
};

// Save a new persona to localStorage
export const savePersona = (persona: Persona): Persona => {
  try {
    const personas = getPersonas();
    const newPersona = {
      ...persona,
      id: persona.id || Date.now().toString() // Generate ID if not provided
    };
    
    const updatedPersonas = [...personas, newPersona];
    localStorage.setItem('personas', JSON.stringify(updatedPersonas));
    
    return newPersona;
  } catch (error) {
    console.error('Error saving persona:', error);
    throw new Error('Failed to save persona');
  }
};

// Update an existing persona in localStorage
export const updatePersona = (persona: Persona): Persona => {
  try {
    if (!persona.id) {
      throw new Error('Persona ID is required for updates');
    }
    
    const personas = getPersonas();
    const index = personas.findIndex(p => p.id === persona.id);
    
    if (index === -1) {
      throw new Error('Persona not found');
    }
    
    personas[index] = persona;
    localStorage.setItem('personas', JSON.stringify(personas));
    
    return persona;
  } catch (error) {
    console.error('Error updating persona:', error);
    throw new Error('Failed to update persona');
  }
};

// Delete a persona from localStorage
export const deletePersona = (id: string): void => {
  if (!id) {
    throw new Error('Persona ID is required for deletion');
  }
  
  try {
    const personas = getPersonas();
    const updatedPersonas = personas.filter(p => p.id !== id);
    localStorage.setItem('personas', JSON.stringify(updatedPersonas));
  } catch (error) {
    console.error('Error deleting persona:', error);
    throw new Error('Failed to delete persona');
  }
};

// Get a single persona by ID
export const getPersonaById = (id: string): Persona | null => {
  try {
    const personas = getPersonas();
    const persona = personas.find(p => p.id === id);
    return persona || null;
  } catch (error) {
    console.error('Error fetching persona:', error);
    return null;
  }
}; 