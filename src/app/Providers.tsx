'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '../lib/contexts/ThemeContext';
import { AchievementsProvider } from '../lib/contexts/AchievementsContext';
import { UserPreferencesProvider } from '../lib/contexts/UserPreferencesContext';
import { AuthProvider } from '../lib/contexts/AuthContext';

interface Props {
    children: React.ReactNode
}

export default function Providers({children}: Props) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ThemeProvider>
          <AchievementsProvider>
            <UserPreferencesProvider>
              {children}
            </UserPreferencesProvider>
          </AchievementsProvider>
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  )
}
