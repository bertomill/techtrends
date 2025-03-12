import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { getPersonas, Persona } from '@/lib/services/persona-service';

interface PersonaSelectorProps {
  onPersonaSelect: (persona: Persona | null) => void;
}

export default function PersonaSelector({ onPersonaSelect }: PersonaSelectorProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('none');

  // Fetch personas on component mount
  useEffect(() => {
    const fetchPersonas = () => {
      try {
        const fetchedPersonas = getPersonas();
        // Ensure all personas have an ID
        const validPersonas = fetchedPersonas.map(persona => ({
          ...persona,
          id: persona.id || `persona-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        }));
        setPersonas(validPersonas);
      } catch (error) {
        console.error('Error fetching personas:', error);
      }
    };

    fetchPersonas();
  }, []);

  // Handle persona selection
  const handlePersonaSelect = (personaId: string) => {
    setSelectedPersonaId(personaId);
    
    if (personaId === 'none') {
      onPersonaSelect(null);
      return;
    }

    const selectedPersona = personas.find(p => p.id === personaId);
    if (selectedPersona) {
      onPersonaSelect(selectedPersona);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Select Persona (Optional)</h3>
        {personas.length === 0 && (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="text-xs"
            onClick={() => window.location.href = '/personas'}
          >
            Create personas first
          </Button>
        )}
      </div>
      
      {personas.length > 0 ? (
        <Select
          value={selectedPersonaId}
          onValueChange={handlePersonaSelect}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a persona" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {personas.map((persona) => (
              <SelectItem key={persona.id} value={persona.id}>
                {persona.name} - {persona.position}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
          <Users size={16} />
          <span className="text-sm text-muted-foreground">No personas created yet</span>
        </div>
      )}
    </div>
  );
} 