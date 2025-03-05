import { supabase } from './supabase';
import { useAuthStore } from './store';

export async function signUp(email: string, password: string, name: string, role: 'patient' | 'doctor') {
  try {
    // First, create the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    });

    if (error) {
      throw error;
    }

    // Wait a moment to ensure the trigger has time to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true, data };
  } catch (error: any) {
    console.error('Error signing up:', error);
    return { success: false, error: error.message };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    // Get user metadata directly from auth response
    if (data.user) {
      try {
        // Extract user info from metadata
        const userName = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User';
        const userRole = data.user.user_metadata?.role || 'patient';
        
        // Update auth store
        useAuthStore.getState().login({
          id: data.user.id,
          name: userName,
          email: data.user.email || '',
          role: userRole as 'patient' | 'doctor'
        });
      } catch (profileError) {
        console.error('Error processing user data:', profileError);
        
        // Still login the user even if there's an error
        useAuthStore.getState().login({
          id: data.user.id,
          name: data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          role: 'patient'
        });
      }
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error signing in:', error);
    return { success: false, error: error.message };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    // Clear auth store
    useAuthStore.getState().logout();
    
    return { success: true };
  } catch (error: any) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    if (!data.user) {
      return { success: false, error: 'No user found' };
    }
    
    // Get user info directly from metadata
    const userName = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User';
    const userRole = data.user.user_metadata?.role || 'patient';
    
    // Update auth store
    useAuthStore.getState().login({
      id: data.user.id,
      name: userName,
      email: data.user.email || '',
      role: userRole as 'patient' | 'doctor'
    });
    
    return { 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        name: userName,
        role: userRole
      }
    };
  } catch (error: any) {
    console.error('Error getting current user:', error);
    return { success: false, error: error.message };
  }
}

export async function updateProfile(userId: string, data: { name?: string; role?: 'patient' | 'doctor' }) {
  try {
    // First update the user metadata
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        name: data.name,
        role: data.role
      }
    });
    
    if (metadataError) {
      console.error('Error updating user metadata:', metadataError);
    }
    
    // Then update the profile table
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);
      
    if (error) {
      throw error;
    }
    
    // Update auth store with new data
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      useAuthStore.getState().login({
        ...currentUser,
        name: data.name || currentUser.name,
        role: data.role || currentUser.role
      });
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }
}