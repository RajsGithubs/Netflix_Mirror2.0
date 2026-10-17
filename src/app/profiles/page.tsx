'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Check, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';
import { playBrandSound } from '@/lib/brandSound';

export default function ProfilesPage() {
  const router = useRouter();
  const { profiles, activeProfileId, switchProfile, addProfile, deleteProfile } = useProfiles();

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [isKids, setIsKids] = useState(false);
  const [selectedColor, setSelectedColor] = useState('from-brand-500 to-rose-600');
  const [selectedIcon, setSelectedIcon] = useState('🍿');

  const avatarColors = [
    { label: 'Crimson', val: 'from-brand-500 to-rose-600' },
    { label: 'Amber', val: 'from-amber-500 to-orange-600' },
    { label: 'Emerald', val: 'from-emerald-400 to-teal-600' },
    { label: 'Indigo', val: 'from-indigo-500 to-purple-600' },
    { label: 'Sky', val: 'from-sky-400 to-blue-600' },
    { label: 'Fuchsia', val: 'from-fuchsia-500 to-pink-600' },
  ];

  const avatarIcons = ['🎬', '🍿', '🧸', '🌟', '🚀', '🧙‍♂️', '👾', '🔥', '👑', '🎧'];

  const handleSelectProfile = (id: string) => {
    playBrandSound();
    switchProfile(id);
    router.push('/');
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addProfile({
      name: newName.trim(),
      avatarColor: selectedColor,
      icon: selectedIcon,
      isKids,
      language: 'English',
    });

    setNewName('');
    setIsCreating(false);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center pt-28 pb-16 px-4 animate-fade-in">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Who&apos;s Watching?
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base">
            Select your profile to load personalized watchlists and recommendations.
          </p>
        </div>

        {/* Profiles Grid */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-6">
          {profiles.map((p) => {
            const isActive = p.id === activeProfileId;
            return (
              <div
                key={p.id}
                onClick={() => handleSelectProfile(p.id)}
                className="group flex flex-col items-center gap-3 cursor-pointer"
              >
                <div
                  className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-md bg-gradient-to-tr ${p.avatarColor} p-1 flex items-center justify-center text-4xl sm:text-5xl shadow-xl transition-all duration-300 transform group-hover:scale-105 group-hover:ring-4 group-hover:ring-white ${
                    isActive ? 'ring-4 ring-white' : ''
                  }`}
                >
                  <span>{p.icon}</span>

                  {/* Active Indicator Checkmark */}
                  {isActive && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  {/* Kids Badge */}
                  {p.isKids && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-emerald-300">
                      KIDS
                    </div>
                  )}
                </div>

                <div className="space-y-0.5">
                  <span className="font-bold text-sm sm:text-base text-zinc-300 group-hover:text-white transition-colors block">
                    {p.name}
                  </span>
                  {isActive && (
                    <span className="text-[11px] text-brand-400 font-semibold block">
                      Current Profile
                    </span>
                  )}
                </div>

                {/* Delete button (if more than 1 profile) */}
                {profiles.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProfile(p.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition text-xs"
                    title="Delete Profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add Profile Tile */}
          {!isCreating && profiles.length < 6 && (
            <div
              onClick={() => setIsCreating(true)}
              className="group flex flex-col items-center gap-3 cursor-pointer"
            >
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-md border-2 border-dashed border-white/20 hover:border-white flex items-center justify-center text-zinc-500 group-hover:text-white transition-all duration-300 transform group-hover:scale-105">
                <Plus className="w-10 h-10" />
              </div>
              <span className="font-semibold text-sm sm:text-base text-zinc-400 group-hover:text-white transition-colors">
                Add Profile
              </span>
            </div>
          )}
        </div>

        {/* Create Profile Drawer / Form */}
        {isCreating && (
          <form
            onSubmit={handleCreateProfile}
            className="max-w-md mx-auto p-6 rounded-3xl bg-cinema-900 border border-white/10 shadow-2xl text-left space-y-4 animate-slide-up mt-8"
          >
            <h3 className="text-lg font-bold text-white">Create New Profile</h3>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Profile Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Jordan, Cinema Buff..."
                className="w-full bg-cinema-950 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                autoFocus
                required
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1.5">Select Avatar Icon</label>
              <div className="flex flex-wrap gap-2">
                {avatarIcons.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setSelectedIcon(ic)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-cinema-950 border transition ${
                      selectedIcon === ic
                        ? 'border-brand-500 bg-brand-500/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Gradient Picker */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1.5">Theme Color</label>
              <div className="flex flex-wrap gap-2">
                {avatarColors.map((col) => (
                  <button
                    key={col.label}
                    type="button"
                    onClick={() => setSelectedColor(col.val)}
                    className={`w-8 h-8 rounded-full bg-gradient-to-tr ${col.val} transition transform ${
                      selectedColor === col.val ? 'ring-2 ring-white scale-110' : 'opacity-80'
                    }`}
                    title={col.label}
                  />
                ))}
              </div>
            </div>

            {/* Kids Experience checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="kids-mode"
                checked={isKids}
                onChange={(e) => setIsKids(e.target.checked)}
                className="rounded text-brand-500 focus:ring-brand-500 bg-cinema-950 border-white/20"
              />
              <label htmlFor="kids-mode" className="text-xs text-zinc-300">
                Kids Experience (Curates age-appropriate titles)
              </label>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/30 transition"
              >
                Save Profile
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
