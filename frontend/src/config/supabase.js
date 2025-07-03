// Supabase configuration for EduQuest
import { createClient } from '@supabase/supabase-js';

// Supabase configuration - These will be environment variables in production
const supabaseUrl = 'https://mfmwfbvpbcrhebctoyib.supabase.co'; // Replace with actual Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mbXdmYnZwYmNyaGViY3RveWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDQ4OTAsImV4cCI6MjA2NzA4MDg5MH0.px3RYMQTmbqTwLVATTJVAZ0SAbYV_PlbDM3igIs-DYs'; // Replace with actual Supabase anon key

// For demo purposes, we'll create a mock client that simulates Supabase functionality
// In production, you would use actual Supabase credentials
const createMockSupabaseClient = () => {
  return {
    auth: {
      signUp: async ({ email, password, options = {} }) => {
        console.log('Mock signup:', { email, options });
        // Simulate successful signup
        return {
          data: {
            user: {
              id: 'm
            -user-id-' + Date.now(),
              email,
              user_metadata: options.data || {}
            },
            session: {
              access_token: 'mock-access-token',
              refresh_token: 'mock-refresh-token'
            }
          },
          error: null
        };
      },
      
      signInWithPassword: async ({ email, password }) => {
        console.log('Mock signin:', { email });
        // Simulate successful signin
        return {
          data: {
            user: {
              id: 'mock-user-id-' + Date.now(),
              email,
              user_metadata: { display_name: email.split('@')[0] }
            },
            session: {
              access_token: 'mock-access-token',
              refresh_token: 'mock-refresh-token'
            }
          },
          error: null
        };
      },
      
      signInWithOAuth: async ({ provider, options = {} }) => {
        console.log('Mock OAuth signin:', { provider, options });
        // Simulate OAuth redirect
        window.location.href = `#mock-oauth-${provider}`;
        return { data: null, error: null };
      },
      
      signOut: async () => {
        console.log('Mock signout');
        return { error: null };
      },
      
      getSession: async () => {
        // Check if we have a mock session
        const mockSession = localStorage.getItem('eduquest-mock-session');
        if (mockSession) {
          return {
            data: { session: JSON.parse(mockSession) },
            error: null
          };
        }
        return { data: { session: null }, error: null };
      },
      
      onAuthStateChange: (callback) => {
        // Simulate auth state changes
        console.log('Mock auth state change listener registered');
        
        // Check for existing session on load
        setTimeout(() => {
          const mockSession = localStorage.getItem('eduquest-mock-session');
          if (mockSession) {
            callback('SIGNED_IN', JSON.parse(mockSession));
          } else {
            callback('SIGNED_OUT', null);
          }
        }, 100);
        
        // Return unsubscribe function
        return {
          data: {
            subscription: {
              unsubscribe: () => console.log('Mock auth listener unsubscribed')
            }
          }
        };
      }
    },
    
    from: (table) => ({
      select: (columns = '*') => ({
        eq: (column, value) => ({
          single: async () => {
            console.log(`Mock select from ${table} where ${column} = ${value}`);
            return { data: null, error: null };
          }
        }),
        order: (column, options = {}) => ({
          limit: (count) => ({
            async: async () => {
              console.log(`Mock select from ${table} order by ${column} limit ${count}`);
              return { data: [], error: null };
            }
          })
        })
      }),
      
      insert: (data) => ({
        select: () => ({
          single: async () => {
            console.log(`Mock insert into ${table}:`, data);
            return { data: { id: 'mock-id-' + Date.now(), ...data }, error: null };
          }
        })
      }),
      
      update: (data) => ({
        eq: (column, value) => ({
          select: () => ({
            single: async () => {
              console.log(`Mock update ${table} set`, data, `where ${column} = ${value}`);
              return { data: { ...data }, error: null };
            }
          })
        })
      }),
      
      delete: () => ({
        eq: (column, value) => ({
          async: async () => {
            console.log(`Mock delete from ${table} where ${column} = ${value}`);
            return { data: null, error: null };
          }
        })
      })
    }),
    
    storage: {
      from: (bucket) => ({
        upload: async (path, file) => {
          console.log(`Mock upload to ${bucket}/${path}:`, file);
          return { data: { path }, error: null };
        },
        
        getPublicUrl: (path) => {
          return {
            data: { publicUrl: `https://mock-storage.supabase.co/${bucket}/${path}` }
          };
        }
      })
    },
    
    channel: (name) => ({
      on: (event, filter, callback) => {
        console.log(`Mock realtime subscription: ${name} - ${event}`);
        return {
          subscribe: () => console.log('Mock subscription started')
        };
      }
    })
  };
};

// Create Supabase client
export const supabase = process.env.NODE_ENV === 'production' && supabaseUrl !== 'https://your-project.supabase.co'
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabaseClient();

// Helper functions for common operations
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    localStorage.removeItem('eduquest-mock-session');
  }
  return { error };
};

export default supabase;

