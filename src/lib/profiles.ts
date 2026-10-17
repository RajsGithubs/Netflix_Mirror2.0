export interface UserProfile {
  id: string;
  name: string;
  avatarColor: string; // Tailwind gradient/color class
  icon: string; // Emoji or short symbol
  isKids: boolean;
  language: string;
}

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'profile-main',
    name: 'Alex (Main)',
    avatarColor: 'from-brand-500 to-rose-600',
    icon: '🎬',
    isKids: false,
    language: 'English',
  },
  {
    id: 'profile-cinema',
    name: 'Cinema Buff',
    avatarColor: 'from-amber-500 to-orange-600',
    icon: '🍿',
    isKids: false,
    language: 'English',
  },
  {
    id: 'profile-kids',
    name: 'Kids & Family',
    avatarColor: 'from-emerald-400 to-teal-600',
    icon: '🧸',
    isKids: true,
    language: 'English',
  },
  {
    id: 'profile-guest',
    name: 'Guest Viewer',
    avatarColor: 'from-indigo-500 to-purple-600',
    icon: '🌟',
    isKids: false,
    language: 'English',
  },
];
