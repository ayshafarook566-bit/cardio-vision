/**
 * CardioVision 3D - Clinical Dashboard Page
 * Features 4 overview cards for CAD, LAD, LCX, RCA,
 * cohort statistics, risk distributions, and synthetic data disclaimers.
 */

import React from 'react';
import {
  Activity,
  Heart,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Users,
  Compass,
  FileCheck2,
  Stethoscope,
} from 'lucide-react';
import { AssessmentRecord, RiskLevel } from '../../types/cardio';
import { NavPage } from '../layout/Sidebar';

interface DashboardPageProps {
  records: AssessmentRecord[];
  activeRecord: AssessmentRecord;
  onSelectRecord: (record: AssessmentRecord) => void;
  onNavigate: (page: NavPage) => void;
  onSelectVesselIn3D: (vessel: 'LAD' | 'LCX' | 'RCA') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  records,
  activeRecord,
  onSelectRecord,
  onNavigate,
  onSelectVesselIn3D,
}) => {
  const prediction = activeRecord.prediction;
  const vessels = prediction.vessels;

  // Cohort statistics
  const totalCases = records.length;
  const criticalCount = records.filter((r) => r.prediction.overallRiskLevel === 'critical').length;
  const highCount = records.filter((r) => r.prediction.overallRiskLevel === 'high').length;
  const moderateCount = records.filter((r) => r.prediction.overallRiskLevel === 'moderate').length;
  const lowCount = records.filter((r) => r.prediction.overallRiskLevel === 'low').length;
  const avgAge = Math.round(records.reduce((acc, r) => acc + r.patientData.demographics.age, 0) / (totalCases || 1));

  const getRiskBadgeColor = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return 'text-rose-400 bg-rose-950/60 border-rose-800/60';
      case 'high':
        return 'text-amber-400 bg-amber-950/60 border-amber-800/60';
      case 'moderate':
        return 'text-yellow-300 bg-yellow-950/60 border-yellow-800/60';
      default:
        return 'text-teal-400 bg-teal-950/60 border-teal-800/60';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Synthetic Demo Banner Notice */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200">Synthetic Clinical Demo Mode</span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                PROTOTYPE v0.9
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              All predictions, cohort statistics, and arterial stenosis models represent synthetic heuristic approximations for hackathon evaluation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('about')}
            className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-4 font-medium"
          >
            Review Safety Protocol
          </button>
        </div>
      </div>

      {/* Patient Profile Ribbon */}
      <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-teal-400">Active Patient Subject</span>
                <span className="text-slate-600">·</span>
                <span className="text-xs font-mono text-slate-400">{activeRecord.patientData.demographics.patientId}</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {activeRecord.patientData.demographics.name}
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-mono uppercase font-semibold ${getRiskBadgeColor(prediction.overallRiskLevel)}`}>
                  {prediction.overallRiskLevel} Risk
                </span>
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                <span>{activeRecord.patientData.demographics.age} yrs</span>
                <span>·</span>
                <span className="capitalize">{activeRecord.patientData.demographics.sex}</span>
                <span>·</span>
                <span className="capitalize">{activeRecord.patientData.demographics.chestPainType.replace('_', ' ')}</span>
                <span>·</span>
                <span>BP: {activeRecord.patientData.clinical.restingBP} mmHg</span>
                <span>·</span>
                <span>LVEF: {activeRecord.patientData.echo.lvef}%</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Select active patient case"
              value={activeRecord.id}
              onChange={(e) => {
                const found = records.find((r) => r.id === e.target.value);
                if (found) onSelectRecord(found);
              }}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-teal-500 focus:outline-none"
            >
              {records.map((r) => (
                <option key={r.id} value={r.id}>
                  Case {r.patientData.demographics.patientId}: {r.patientData.demographics.name} ({r.prediction.overallRiskLevel.toUpperCase()})
                </option>
              ))}
            </select>

            <button
              onClick={() => onNavigate('visualization')}
              className="px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-teal-500/10"
            >
              <span>Inspect 3D Vessels</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Overview Cards: CAD, LAD, LCX, RCA */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Vessel-Specific Stenosis & Ischemia Stratification
          </h3>
          <span className="text-xs text-slate-400">Click a card to inspect vessel in 3D</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* 1. CAD Global Risk Card */}
          <div
            onClick={() => onNavigate('visualization')}
            className="group relative bg-[#0D1829] hover:bg-[#112036] border border-slate-800 hover:border-teal-500/40 rounded-xl p-5 transition-all cursor-pointer shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-teal-400 font-semibold tracking-wider uppercase">
                  Global Target
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">Overall CAD Risk</h4>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-mono font-semibold uppercase border ${getRiskBadgeColor(prediction.overallRiskLevel)}`}>
                {prediction.overallRiskLevel}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white tracking-tight tabular-nums">
                {Math.round(prediction.overallCadProbability * 100)}%
              </span>
              <span className="text-xs font-mono text-slate-400">Ischemic Probability</span>
            </div>

            {/* Probability Progress Bar */}
            <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  prediction.overallCadProbability >= 0.75
                    ? 'bg-rose-500'
                    : prediction.overallCadProbability >= 0.5
                    ? 'bg-amber-400'
                    : 'bg-teal-400'
                }`}
                style={{ width: `${Math.round(prediction.overallCadProbability * 100)}%` }}
              />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Confidence Index:</span>
                <span className="font-mono text-slate-200">{Math.round(prediction.confidenceScore * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Clinical Priority:</span>
                <span className="text-slate-200 font-medium capitalize">{prediction.overallRiskLevel}</span>
              </div>
            </div>
          </div>

          {/* 2. LAD Card (Left Anterior Descending) */}
          <div
            onClick={() => {
              onSelectVesselIn3D('LAD');
              onNavigate('visualization');
            }}
            className="group relative bg-[#0D1829] hover:bg-[#112036] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-5 transition-all cursor-pointer shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 font-semibold tracking-wider uppercase">
                  Arterial Branch
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">LAD Artery</h4>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-mono font-semibold uppercase border ${getRiskBadgeColor(vessels.LAD.riskLevel)}`}>
                {vessels.LAD.riskLevel}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white tracking-tight tabular-nums">
                {vessels.LAD.stenosisEstimatePercent}%
              </span>
              <span className="text-xs font-mono text-slate-400">Est. Stenosis</span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  vessels.LAD.stenosisEstimatePercent >= 70
                    ? 'bg-rose-500'
                    : vessels.LAD.stenosisEstimatePercent >= 40
                    ? 'bg-amber-400'
                    : 'bg-teal-400'
                }`}
                style={{ width: `${vessels.LAD.stenosisEstimatePercent}%` }}
              />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
              <div className="truncate">
                <span className="text-slate-400">Territory: </span>
                <span className="text-slate-300">Anteroseptal / Apex</span>
              </div>
              <div className="flex justify-between">
                <span>Probability:</span>
                <span className="font-mono text-slate-200">{Math.round(vessels.LAD.probability * 100)}%</span>
              </div>
            </div>
          </div>

          {/* 3. LCX Card (Left Circumflex) */}
          <div
            onClick={() => {
              onSelectVesselIn3D('LCX');
              onNavigate('visualization');
            }}
            className="group relative bg-[#0D1829] hover:bg-[#112036] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-5 transition-all cursor-pointer shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 font-semibold tracking-wider uppercase">
                  Arterial Branch
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">LCX Artery</h4>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-mono font-semibold uppercase border ${getRiskBadgeColor(vessels.LCX.riskLevel)}`}>
                {vessels.LCX.riskLevel}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white tracking-tight tabular-nums">
                {vessels.LCX.stenosisEstimatePercent}%
              </span>
              <span className="text-xs font-mono text-slate-400">Est. Stenosis</span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  vessels.LCX.stenosisEstimatePercent >= 70
                    ? 'bg-rose-500'
                    : vessels.LCX.stenosisEstimatePercent >= 40
                    ? 'bg-amber-400'
                    : 'bg-teal-400'
                }`}
                style={{ width: `${vessels.LCX.stenosisEstimatePercent}%` }}
              />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
              <div className="truncate">
                <span className="text-slate-400">Territory: </span>
                <span className="text-slate-300">Posterolateral LV</span>
              </div>
              <div className="flex justify-between">
                <span>Probability:</span>
                <span className="font-mono text-slate-200">{Math.round(vessels.LCX.probability * 100)}%</span>
              </div>
            </div>
          </div>

          {/* 4. RCA Card (Right Coronary Artery) */}
          <div
            onClick={() => {
              onSelectVesselIn3D('RCA');
              onNavigate('visualization');
            }}
            className="group relative bg-[#0D1829] hover:bg-[#112036] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-5 transition-all cursor-pointer shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 font-semibold tracking-wider uppercase">
                  Arterial Branch
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">RCA Artery</h4>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-mono font-semibold uppercase border ${getRiskBadgeColor(vessels.RCA.riskLevel)}`}>
                {vessels.RCA.riskLevel}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white tracking-tight tabular-nums">
                {vessels.RCA.stenosisEstimatePercent}%
              </span>
              <span className="text-xs font-mono text-slate-400">Est. Stenosis</span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  vessels.RCA.stenosisEstimatePercent >= 70
                    ? 'bg-rose-500'
                    : vessels.RCA.stenosisEstimatePercent >= 40
                    ? 'bg-amber-400'
                    : 'bg-teal-400'
                }`}
                style={{ width: `${vessels.RCA.stenosisEstimatePercent}%` }}
              />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
              <div className="truncate">
                <span className="text-slate-400">Territory: </span>
                <span className="text-slate-300">Inferior LV / RV</span>
              </div>
              <div className="flex justify-between">
                <span>Probability:</span>
                <span className="font-mono text-slate-200">{Math.round(vessels.RCA.probability * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cohort Summary & Clinical Risk Drivers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Factors & Drivers */}
        <div className="lg:col-span-2 bg-[#0D1829] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Primary Ischemic Drivers</h3>
              <p className="text-xs text-slate-400">Biomarkers and electrophysiological indicators for this case</p>
            </div>
            <span className="text-xs font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/30">
              SHAP Ranked
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prediction.keyRiskDrivers.map((driver, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded bg-teal-500/10 text-teal-400 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="text-xs text-slate-200 font-medium leading-relaxed">
                  {driver}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-teal-300 block mb-1">Algorithmic Synthesis Summary:</span>
            {prediction.clinicalSummary}
          </div>
        </div>

        {/* Cohort Analytics Overview */}
        <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Cohort Distribution</h3>
              <span className="text-xs font-mono text-slate-400">{totalCases} Total Cases</span>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-rose-400 font-medium">Critical Risk (&ge;75%)</span>
                  <span className="font-mono text-slate-200 tabular-nums">
                    {criticalCount} ({Math.round((criticalCount / (totalCases || 1)) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${(criticalCount / (totalCases || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-amber-400 font-medium">High Risk (52-74%)</span>
                  <span className="font-mono text-slate-200 tabular-nums">
                    {highCount} ({Math.round((highCount / (totalCases || 1)) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${(highCount / (totalCases || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-yellow-300 font-medium">Moderate Risk (28-51%)</span>
                  <span className="font-mono text-slate-200 tabular-nums">
                    {moderateCount} ({Math.round((moderateCount / (totalCases || 1)) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${(moderateCount / (totalCases || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-teal-400 font-medium">Low Risk (&lt;28%)</span>
                  <span className="font-mono text-slate-200 tabular-nums">
                    {lowCount} ({Math.round((lowCount / (totalCases || 1)) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-400"
                    style={{ width: `${(lowCount / (totalCases || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Median Cohort Age:</span>
            <span className="font-mono font-bold text-slate-200">{avgAge} Years</span>
          </div>
        </div>
      </div>
    </div>
  );
};
