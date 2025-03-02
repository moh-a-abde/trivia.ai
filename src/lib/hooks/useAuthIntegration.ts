'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { useAuth } from './useAuth';

// This hook integrates both NextAuth.js and Firebase Authentication
export const useAuthIntegration = () => {
  const { data: nextAuthSession } = useSession();
  const { user: firebaseUser, signIn: firebaseSignIn, signOut: firebaseSignOut } = useAuth();
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
  const signInWithGoogle = () => {
    return nextAuthSignIn('google');
  };

  // Sign in with Firebase (email/password)
  const signInWithEmail = (email: string, password: string) => {
    return firebaseSignIn(email, password);
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
    }
  };

  return {
    isAuthenticated,
    user,
    signInWithGoogle,
    signInWithEmail,
    signOut
  };
}; 