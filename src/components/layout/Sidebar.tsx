/**
 * CardioVision 3D - Clinical Navigation Sidebar
 */

import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  HeartPulse,
  LineChart,
  History,
  ShieldCheck,
  AlertCircle,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';

export type NavPage = 'dashboard' | 'assessment' | 'visualization' | 'model-performance' | 'history' | 'about';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavPage,
      label: 'Clinical Overview',
      subtitle: 'CAD & 3-Vessel Stratification',
      icon: LayoutDashboard,
    },
    {
      id: 'assessment' as NavPage,
      label: 'Patient Assessment',
      subtitle: 'Multimodal Clinical Intake',
      icon: UserCheck,
    },
    {
      id: 'visualization' as NavPage,
      label: '3D Heart & Vessels',
      subtitle: 'Interactive Arterial Stage',
      icon: HeartPulse,
    },
    {
      id: 'model-performance' as NavPage,
      label: 'Model Performance',
      subtitle: 'Metrics, ROC & SHAP',
      icon: LineChart,
    },
    {
      id: 'history' as NavPage,
      label: 'Assessment History',
      subtitle: 'Records & Cohort Explorer',
      icon: History,
    },
    {
      id: 'about' as NavPage,
      label: 'About & Safety',
      subtitle: 'Architecture & Disclaimers',
      icon: ShieldCheck,
    },
  ];

  const handleItemClick = (page: NavPage) => {
    onNavigate(page);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#08101E] border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-slate-950 shadow-md shadow-teal-500/10 shrink-0">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">CardioVision</span>
                <span className="text-xs font-mono font-semibold text-teal-400 bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-500/30">
                  3D
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Coronary Risk Visualization</p>
            </div>
          </div>

          {/* Synthetic Demo Tag */}
          <div className="mt-4 px-3 py-1.5 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-slate-300 font-medium">Research Mode</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">PART 1 (UI/UX)</span>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center justify-between group ${
                  isActive
                    ? 'bg-teal-500/15 text-white border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />
                  <div className="truncate">
                    <div className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{item.subtitle}</div>
                  </div>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Mandatory Medical Safety Disclaimer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/40 text-[11px] text-rose-200/90 leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-rose-300 mb-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Medical Disclaimer</span>
            </div>
            Educational research prototype only. Not a substitute for professional medical assessment or diagnostic testing.
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
            <span>CardioVision v0.9</span>
            <span>Firestore Ready</span>
          </div>
        </div>
      </aside>
    </>
  );
};
