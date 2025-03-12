'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getPersonas, savePersona, updatePersona, deletePersona, Persona } from '@/lib/services/persona-service';

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<Persona>({
    name: '',
    position: '',
    interests: '',
    background: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch personas on component mount
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        setLoading(true);
        const fetchedPersonas = getPersonas();
        setPersonas(fetchedPersonas);
      } catch (error) {
        console.error('Error fetching personas:', error);
        toast.error('Failed to load personas');
      } finally {
        setLoading(false);
      }
    };

    fetchPersonas();
  }, []);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPersona.name || !currentPersona.position) {
      toast.error('Name and position are required');
      return;
    }

    try {
      if (isEditing && currentPersona.id) {
        // Update existing persona
        const updatedPersona = updatePersona(currentPersona);
        setPersonas(prev => 
          prev.map(p => p.id === updatedPersona.id ? updatedPersona : p)
        );
        toast.success('Persona updated successfully!');
      } else {
        // Add new persona
        const newPersona = savePersona(currentPersona);
        setPersonas(prev => [...prev, newPersona]);
        toast.success('Persona created successfully!');
      }

      // Reset form and close dialog
      setCurrentPersona({
        name: '',
        position: '',
        interests: '',
        background: ''
      });
      setIsEditing(false);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving persona:', error);
      toast.error('Failed to save persona');
    }
  };

  // Handle persona deletion
  const handleDeletePersona = (id: string | undefined) => {
    if (!id) {
      toast.error('Cannot delete persona without an ID');
      return;
    }
    
    try {
      deletePersona(id);
      setPersonas(prev => prev.filter(p => p.id !== id));
      toast.success('Persona deleted successfully!');
    } catch (error) {
      console.error('Error deleting persona:', error);
      toast.error('Failed to delete persona');
    }
  };

  // Handle editing a persona
  const handleEditPersona = (persona: Persona) => {
    setCurrentPersona(persona);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // Filter personas based on search query
  const filteredPersonas = personas.filter(persona => 
    persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    persona.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    persona.interests.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Personas</h2>
            <p className="text-muted-foreground">
              Create and manage personas for your research memos.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" onClick={() => {
                setCurrentPersona({
                  name: '',
                  position: '',
                  interests: '',
                  background: ''
                });
                setIsEditing(false);
              }}>
                <Plus size={16} />
                <span>New Persona</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{isEditing ? 'Edit Persona' : 'Create New Persona'}</DialogTitle>
                <DialogDescription>
                  {isEditing 
                    ? 'Update the details of this persona.' 
                    : 'Add a new persona to use when generating memos.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={currentPersona.name}
                      onChange={(e) => setCurrentPersona({...currentPersona, name: e.target.value})}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="position" className="text-right">
                      Position
                    </Label>
                    <Input
                      id="position"
                      value={currentPersona.position}
                      onChange={(e) => setCurrentPersona({...currentPersona, position: e.target.value})}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="interests" className="text-right">
                      Interests
                    </Label>
                    <Textarea
                      id="interests"
                      value={currentPersona.interests}
                      onChange={(e) => setCurrentPersona({...currentPersona, interests: e.target.value})}
                      className="col-span-3"
                      placeholder="What topics are they interested in?"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="background" className="text-right">
                      Background
                    </Label>
                    <Textarea
                      id="background"
                      value={currentPersona.background}
                      onChange={(e) => setCurrentPersona({...currentPersona, background: e.target.value})}
                      className="col-span-3"
                      placeholder="Relevant background information"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{isEditing ? 'Update' : 'Create'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search personas..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <Card className="col-span-full">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Loading personas...</p>
              </CardContent>
            </Card>
          ) : filteredPersonas.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="pt-6 text-center">
                {searchQuery ? (
                  <p className="text-muted-foreground">No personas found matching your search.</p>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">No personas created yet.</p>
                    <Button onClick={() => setIsDialogOpen(true)}>Create Your First Persona</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredPersonas.map((persona) => (
              <Card key={persona.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{persona.name}</CardTitle>
                      <CardDescription>{persona.position}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditPersona(persona)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeletePersona(persona.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {persona.interests && (
                    <div>
                      <h4 className="font-medium">Interests</h4>
                      <p className="text-sm text-muted-foreground">{persona.interests}</p>
                    </div>
                  )}
                  {persona.background && (
                    <div>
                      <h4 className="font-medium">Background</h4>
                      <p className="text-sm text-muted-foreground">{persona.background}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
} 