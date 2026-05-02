'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfileAction } from '@/lib/actions/userActions';

interface UserContextType {
  user: any;
  setUser: (user: any) => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children, initialUser }: { children: React.ReactNode, initialUser: any }) {
  const [user, setUser] = useState(initialUser);
  const [isLoading, setIsLoading] = useState(false);

  // Sync internal state when server data changes (e.g. after router.refresh())
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const res = await getUserProfileAction();
      if (res.success) {
        setUser(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
