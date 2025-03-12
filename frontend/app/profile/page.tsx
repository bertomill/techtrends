'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/main-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Simple loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-40">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Researcher',
    avatar: '',
    lastActive: 'Today, 2:30 PM',
    accountCreated: 'Jan 15, 2023',
    memosCreated: 12,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // In a real app, you would get the user ID from authentication
        // For now, we'll use a fixed user ID
        const userId = 'current-user';
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            name: userData.name || 'John Doe',
            email: userData.email || 'john.doe@example.com',
            role: userData.role || 'Researcher',
            avatar: userData.avatar || '',
            lastActive: userData.lastActive || 'Today, 2:30 PM',
            accountCreated: userData.accountCreated || 'Jan 15, 2023',
            memosCreated: userData.memosCreated || 12,
          });
          setFormData({
            name: userData.name || 'John Doe',
            email: userData.email || 'john.doe@example.com',
            role: userData.role || 'Researcher',
            avatar: userData.avatar || '',
            lastActive: userData.lastActive || 'Today, 2:30 PM',
            accountCreated: userData.accountCreated || 'Jan 15, 2023',
            memosCreated: userData.memosCreated || 12,
          });
          
          // Update last active timestamp
          const currentTime = new Date().toLocaleString();
          await updateDoc(userDocRef, {
            lastActive: currentTime,
            lastActiveTimestamp: serverTimestamp()
          });
          
        } else {
          // Create a new user document if it doesn't exist
          const currentTime = new Date().toLocaleString();
          const newUserData = {
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            lastActive: currentTime,
            accountCreated: currentTime,
            memosCreated: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastActiveTimestamp: serverTimestamp()
          };
          
          await setDoc(userDocRef, newUserData);
          toast.success('New profile created!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    // Empty dependency array to run only once on component mount
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real app, you would get the user ID from authentication
      const userId = 'current-user';
      const userDocRef = doc(db, 'users', userId);
      
      // Update user data in Firestore
      await updateDoc(userDocRef, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        avatar: formData.avatar,
        updatedAt: serverTimestamp(),
      });
      
      // Update local state
      setUser({
        ...user,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        avatar: formData.avatar,
      });
      
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and how others see you on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <LoadingSpinner />
              ) : isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                      id="avatar"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setFormData({ ...user });
                        setIsEditing(false);
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-medium">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.role}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Email</span>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
              <CardDescription>
                View your account activity and usage statistics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Memos Created</span>
                  <span className="text-2xl font-bold">{user.memosCreated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Last Active</span>
                  <span className="text-sm text-muted-foreground">{user.lastActive}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Account Created</span>
                  <span className="text-sm text-muted-foreground">{user.accountCreated}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View Detailed Analytics</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 