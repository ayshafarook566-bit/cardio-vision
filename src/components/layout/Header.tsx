/**
 * CardioVision 3D - Clinical Header Bar
 * Follows the 3-Zone contract with mobile menu affordance.
 */

import React from 'react';
import { Menu, Plus, Sparkles, Database } from 'lucide-react';
import { NavPage } from './Sidebar';

interface HeaderProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  onOpenMobileSidebar: () => void;
  totalRecordsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenMobileSidebar,
  totalRecordsCount,
}) => {
  const pageTitles: Record<NavPage, { title: string; kicker: string }> = {
    dashboard: { title: 'Coronary Risk Overview', kicker: 'Clinical Dashboard' },
    assessment: { title: 'Multimodal Patient Assessment', kicker: 'Diagnostic Intake' },
    visualization: { title: '3D Coronary Artery Explorer', kicker: 'Anatomical Model' },
    'model-performance': { title: 'Machine Learning Performance', kicker: 'Validation Metrics' },
    history: { title: 'Assessment Cohort History', kicker: 'Patient Records' },
    about: { title: 'About & Clinical Safety', kicker: 'Documentation' },
  };

  const current = pageTitles[currentPage];

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0B1320]/90 backdrop-blur-md border-b border-slate-800/90 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Zone 1: Brand title & Mobile Trigger */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation menu"
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold">
            {current.kicker}
          </span>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate max-w-xs md:max-w-md">
            {current.title}
          </h1>
        </div>
      </div>

      {/* Zone 2: Informational Metadata & Architecture Readiness */}
      <div className="hidden md:flex items-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 rounded-md border border-slate-800">
          <Database className="w-3.5 h-3.5 text-teal-400" />
          <span>Cohort: <strong className="text-slate-200 font-mono tabular-nums">{totalRecordsCount}</strong> cases</span>
        </div>
        <span className="text-slate-700">|</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">API Status:</span>
          <span className="text-xs font-mono text-amber-300">Client Engine (Demo)</span>
        </div>
      </div>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-2 shrink-0">
        {currentPage !== 'assessment' ? (
          <button
            onClick={() => onNavigate('assessment')}
            className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-teal-500/20 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Assessment</span>
          </button>
        ) : (
          <button
            onClick={() => onNavigate('visualization')}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 border border-teal-500/30 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Launch 3D Stage</span>
          </button>
        )}
      </div>
    </header>
  );
};
