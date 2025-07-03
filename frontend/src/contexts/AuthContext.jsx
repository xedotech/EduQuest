import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Create user profile in database
  const createUserProfile = async (user, additionalData = {}) => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (existingProfile) {
        // Update last active
        const { data: updatedProfile } = await supabase
          .from('users')
          .update({ last_active: new Date().toISOString() })
          .eq('auth_id', user.id)
          .select()
          .single();
        
        setUserProfile(updatedProfile);
        return updatedProfile;
      } else {
        // Create new profile
        const newUserProfile = {
          auth_id: user.id,
          email: user.email,
          display_name: additionalData.displayName || user.user_metadata?.display_name || user.email.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url || '',
          level: 1,
          xp: 0,
          coins: 100, // Starting coins
          department: additionalData.department || '',
          preferences: {
            theme: 'light',
            language: 'en',
            notifications: true
          },
          web3_data: {
            wallet_address: null,
            polygon_id: null,
            ipfs_profile: null
          }
        };

        const { data: createdProfile, error } = await supabase
          .from('users')
          .insert(newUserProfile)
          .select()
          .single();

        if (error) {
          console.error('Error creating user profile:', error);
          // For demo mode, create a mock profile
          const mockProfile = {
            id: 'mock-profile-' + Date.now(),
            ...newUserProfile
          };
          setUserProfile(mockProfile);
          return mockProfile;
        }

        setUserProfile(createdProfile);
        return createdProfile;
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      // Create mock profile for demo
      const mockProfile = {
        id: 'mock-profile-' + Date.now(),
        auth_id: user.id,
        email: user.email,
        display_name: user.email.split('@')[0],
        level: 1,
        xp: 0,
        coins: 100,
        department: additionalData.department || '',
        preferences: { theme: 'light', language: 'en', notifications: true },
        web3_data: { wallet_address: null, polygon_id: null, ipfs_profile: null }
      };
      setUserProfile(mockProfile);
      return mockProfile;
    }
  };

  // Sign up with email and password
  const signup = async (email, password, additionalData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: additionalData.displayName,
            department: additionalData.department
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Store mock session for demo
        const mockSession = {
          user: data.user,
          access_token: data.session?.access_token || 'mock-token'
        };
        localStorage.setItem('eduquest-mock-session', JSON.stringify(mockSession));
        
        await createUserProfile(data.user, additionalData);
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Sign in with email and password
  const signin = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        // Store mock session for demo
        const mockSession = {
          user: data.user,
          access_token: data.session?.access_token || 'mock-token'
        };
        localStorage.setItem('eduquest-mock-session', JSON.stringify(mockSession));
        
        await createUserProfile(data.user);
      }

      return data;
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Google signin error:', error);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      localStorage.removeItem('eduquest-mock-session');
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (!user || !userProfile) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          last_active: new Date().toISOString()
        })
        .eq('auth_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        // Update local state for demo
        setUserProfile(prev => ({ ...prev, ...updates }));
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error updating user profile:', error);
      // Update local state for demo
      setUserProfile(prev => ({ ...prev, ...updates }));
    }
  };

  // Add XP and coins
  const addRewards = async (xp = 0, coins = 0) => {
    if (!user || !userProfile) return;
    
    const newXp = userProfile.xp + xp;
    const newCoins = userProfile.coins + coins;
    const newLevel = Math.floor(newXp / 100) + 1; // Level up every 100 XP
    
    const updates = {
      xp: newXp,
      coins: newCoins,
      level: Math.max(userProfile.level, newLevel)
    };
    
    await updateUserProfile(updates);
    
    return {
      xpGained: xp,
      coinsGained: coins,
      leveledUp: newLevel > userProfile.level
    };
  };

  // Listen for auth state changes
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await createUserProfile(session.user);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (session?.user) {
          setUser(session.user);
          await createUserProfile(session.user);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    signup,
    signin,
    signInWithGoogle,
    logout,
    updateUserProfile,
    addRewards
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

