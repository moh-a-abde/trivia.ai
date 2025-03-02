'use client';

import "./globals.css";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";
import { AchievementsProvider } from "@/lib/contexts/AchievementsContext";
import { UserPreferencesProvider } from "@/lib/contexts/UserPreferencesContext";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  );
}
