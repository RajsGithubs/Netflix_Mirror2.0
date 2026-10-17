'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProfile, DEFAULT_PROFILES } from '@/lib/profiles';
import { showToast } from '@/components/Toast';

const PROFILES_STORAGE_KEY = 'streamverse_user_profiles';
const ACTIVE_PROFILE_KEY = 'streamverse_active_profile_id';

export function useProfiles() {
  const [profiles, setProfiles] = useState<UserProfile[]>(DEFAULT_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string>(DEFAULT_PROFILES[0].id);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
      if (storedProfiles) {
        setProfiles(JSON.parse(storedProfiles));
      } else {
        localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(DEFAULT_PROFILES));
      }

      const storedActiveId = localStorage.getItem(ACTIVE_PROFILE_KEY);
      if (storedActiveId) {
        setActiveProfileId(storedActiveId);
      }
    } catch (e) {
      console.warn('Error reading profiles from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0] || DEFAULT_PROFILES[0];

  const switchProfile = useCallback((profileId: string) => {
    const target = profiles.find((p) => p.id === profileId);
    if (!target) return;

    setActiveProfileId(profileId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
      window.dispatchEvent(new CustomEvent('streamverse-profile-change', { detail: target }));
    }
    showToast(`Switched profile to ${target.name}`, 'info');
  }, [profiles]);

  const addProfile = useCallback((newProfile: Omit<UserProfile, 'id'>) => {
    const id = `profile-${Date.now()}`;
    const created: UserProfile = { ...newProfile, id };
    setProfiles((prev) => {
      const updated = [...prev, created];
      if (typeof window !== 'undefined') {
        localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
    showToast(`Created profile ${newProfile.name}`, 'success');
    return created;
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setProfiles((prev) => {
      if (prev.length <= 1) {
        showToast('At least one profile is required', 'error');
        return prev;
      }
      const updated = prev.filter((p) => p.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(updated));
        if (activeProfileId === id) {
          const next = updated[0];
          setActiveProfileId(next.id);
          localStorage.setItem(ACTIVE_PROFILE_KEY, next.id);
        }
      }
      showToast('Profile deleted', 'info');
      return updated;
    });
  }, [activeProfileId]);

  return {
    profiles,
    activeProfile,
    activeProfileId,
    switchProfile,
    addProfile,
    deleteProfile,
    isLoaded,
  };
}
