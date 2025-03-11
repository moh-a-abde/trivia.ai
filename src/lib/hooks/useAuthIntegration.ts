'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { useAuth } from './useAuth';

// This hook integrates both NextAuth.js and Firebase Authentication
export const useAuthIntegration = () => {
  const { data: nextAuthSession } = useSession();
  const { 
    user: firebaseUser, 
    signInWithGoogle: firebaseSignInWithGoogle,
    signInWithEmail: firebaseSignInWithEmail,
    createUserWithEmail: firebaseCreateUserWithEmail,
    signOut: firebaseSignOut 
  } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated with either NextAuth or Firebase
  useEffect(() => {
    if (nextAuthSession?.user || firebaseUser) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [nextAuthSession, firebaseUser]);

  // Get the user from either NextAuth or Firebase
  const user = nextAuthSession?.user || firebaseUser;

  // Sign in with NextAuth (Google)
  const signInWithGoogle = async () => {
    try {
      // Try Firebase Google sign-in first
      await firebaseSignInWithGoogle();
    } catch (error) {
      console.error('Firebase Google sign-in failed, trying NextAuth:', error);
      // Fall back to NextAuth
      return nextAuthSignIn('google');
    }
  };

  // Sign in with Firebase (email/password)
  const signInWithEmail = async (email: string, password: string) => {
    try {
      await firebaseSignInWithEmail(email, password);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  // Create user with Firebase (email/password)
  const createUserWithEmail = async (email: string, password: string) => {
    try {
      await firebaseCreateUserWithEmail(email, password);
    } catch (error) {
      console.error('Error creating user with email:', error);
      throw error;
    }
  };

  // Sign out from both NextAuth and Firebase
  const signOut = async () => {
    try {
      await Promise.all([
        nextAuthSignOut(),
        firebaseSignOut()
      ]);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    user,
    signInWithGoogle,
    signInWithEmail,
    createUserWithEmail,
    signOut
  };
}; 