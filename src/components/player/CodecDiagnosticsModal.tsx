'use client';

import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { checkStreamCompatibility, CompatibilityCheckResult } from '@/lib/player/codecSupport';

interface CodecDiagnosticsModalProps {
  sourceUrl?: string;
  activeEngine?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CodecDiagnosticsModal({
  sourceUrl,
  activeEngine,
  isOpen,
  onClose,
}: CodecDiagnosticsModalProps) {
  const [report, setReport] = useState<CompatibilityCheckResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      const res = checkStreamCompatibility(sourceUrl);
      setReport(res);
    }
  }, [isOpen, sourceUrl]);

  if (!isOpen || !report) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl animate-scale-up space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#E50914]" />
            <h3 className="font-bold text-base">Streaming & Codec Diagnostics</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white font-bold text-sm px-2 py-1 rounded-lg hover:bg-zinc-800 transition"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <p className="text-zinc-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Video Codec Support
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-between">
                <span>H.264 / AVC</span>
                <span className={report.codecs.h264 ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                  {report.codecs.h264 ? 'Supported ✓' : 'Unsupported'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-between">
                <span>H.265 / HEVC</span>
                <span className={report.codecs.h265 ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                  {report.codecs.h265 ? 'Supported ✓' : 'Unsupported'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-between">
                <span>AV1</span>
                <span className={report.codecs.av1 ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                  {report.codecs.av1 ? 'Supported ✓' : 'Unsupported'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-between">
                <span>VP9</span>
                <span className={report.codecs.vp9 ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                  {report.codecs.vp9 ? 'Supported ✓' : 'Unsupported'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-zinc-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Audio Codec Support
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-between">
                <span>AAC-LC</span>
                <span className={report.codecs.aac ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                  {report.codecs.aac ? 'Supported ✓' : 'Unsupported'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-between">
                <span>Dolby (E-AC-3)</span>
                <span className={report.codecs.dolby ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                  {report.codecs.dolby ? 'Supported ✓' : 'Unsupported'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Detected Format:</span>
              <span className="text-white font-mono uppercase">{report.containerDetected}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Stream Engine:</span>
              <span className="text-white font-mono uppercase">{activeEngine || report.recommendedEngine}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Optimal Video Codec:</span>
              <span className="text-[#E50914] font-bold">{report.bestVideoCodec}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Optimal Audio Codec:</span>
              <span className="text-emerald-400 font-bold">{report.bestAudioCodec}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#E50914] hover:bg-red-700 text-white font-bold text-xs transition"
        >
          Close Diagnostics
        </button>
      </div>
    </div>
  );
}
