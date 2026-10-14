/**
 * CardioVision 3D - Assessment History & Cohort Explorer
 * Features instant search, risk filters, vessel involvement filters,
 * detail inspector drawer, export tools, and an informative empty state.
 */

import React, { useState } from 'react';
import { AssessmentRecord, RiskLevel } from '../../types/cardio';
import { INITIAL_DEMO_RECORDS } from '../../data/mockData';
import { NavPage } from '../layout/Sidebar';
import {
  Search,
  Filter,
  Download,
  Trash2,
  ExternalLink,
  Heart,
  Eye,
  Calendar,
  User,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface HistoryPageProps {
  records: AssessmentRecord[];
  onSelectRecord: (record: AssessmentRecord) => void;
  onDeleteRecord: (id: string) => void;
  onResetCohort: () => void;
  onNavigate: (page: NavPage) => void;
  onSelectVesselIn3D: (vessel: 'LAD' | 'LCX' | 'RCA') => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  records,
  onSelectRecord,
  onDeleteRecord,
  onResetCohort,
  onNavigate,
  onSelectVesselIn3D,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [vesselFilter, setVesselFilter] = useState<'ALL' | 'LAD' | 'LCX' | 'RCA'>('ALL');
  const [inspectingRecord, setInspectingRecord] = useState<AssessmentRecord | null>(null);

  // Filter logic
  const filteredRecords = records.filter((r) => {
    const p = r.patientData.demographics;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk =
      riskFilter === 'ALL' || r.prediction.overallRiskLevel === riskFilter;

    const matchesVessel =
      vesselFilter === 'ALL' ||
      (vesselFilter === 'LAD' && r.prediction.vessels.LAD.stenosisEstimatePercent >= 50) ||
      (vesselFilter === 'LCX' && r.prediction.vessels.LCX.stenosisEstimatePercent >= 50) ||
      (vesselFilter === 'RCA' && r.prediction.vessels.RCA.stenosisEstimatePercent >= 50);

    return matchesSearch && matchesRisk && matchesVessel;
  });

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

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cardiovision_cohort_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Bar with Search & Filters */}
      <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold">
              Cohort Repository
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
              Patient Assessment Records
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Browse, filter, and inspect multivariate clinical intake records and vessel predictions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Cohort JSON</span>
            </button>

            <button
              onClick={() => onNavigate('assessment')}
              className="px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm shadow-teal-500/10"
            >
              + New Assessment
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="pt-2 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name or ID (e.g. Eleanor or PT-9042)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs overflow-x-auto">
            <span className="text-[11px] font-mono text-slate-500 px-2 uppercase">Risk:</span>
            {(['ALL', 'critical', 'high', 'moderate', 'low'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setRiskFilter(lvl)}
                className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                  riskFilter === lvl
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Vessel Filter */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs overflow-x-auto">
            <span className="text-[11px] font-mono text-slate-500 px-2 uppercase">Lesion:</span>
            {(['ALL', 'LAD', 'LCX', 'RCA'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVesselFilter(v)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors whitespace-nowrap ${
                  vesselFilter === v
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Records Table or Empty State */}
      {filteredRecords.length > 0 ? (
        <div className="bg-[#0D1829] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-4">Patient / ID</th>
                  <th className="py-3 px-4">Demographics</th>
                  <th className="py-3 px-4">Overall CAD Risk</th>
                  <th className="py-3 px-4">Vessel Stenosis (LAD · LCX · RCA)</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {filteredRecords.map((r) => {
                  const p = r.patientData.demographics;
                  const pred = r.prediction;
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-900/60 transition-colors group"
                    >
                      {/* Name / ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white group-hover:text-teal-300 transition-colors">
                          {p.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">{p.patientId}</div>
                      </td>

                      {/* Demographics */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div>
                          {p.age} yrs · <span className="capitalize">{p.sex}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 capitalize">
                          {p.chestPainType.replace('_', ' ')}
                        </div>
                      </td>

                      {/* Overall CAD Risk */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm tabular-nums">
                            {Math.round(pred.overallCadProbability * 100)}%
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold uppercase border ${getRiskBadgeColor(
                              pred.overallRiskLevel
                            )}`}
                          >
                            {pred.overallRiskLevel}
                          </span>
                        </div>
                      </td>

                      {/* Vessel Badges */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span
                            className={`px-1.5 py-0.5 rounded border ${
                              pred.vessels.LAD.stenosisEstimatePercent >= 70
                                ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                                : pred.vessels.LAD.stenosisEstimatePercent >= 40
                                ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                                : 'bg-slate-900 text-teal-400 border-slate-800'
                            }`}
                          >
                            LAD: {pred.vessels.LAD.stenosisEstimatePercent}%
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded border ${
                              pred.vessels.LCX.stenosisEstimatePercent >= 70
                                ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                                : pred.vessels.LCX.stenosisEstimatePercent >= 40
                                ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                                : 'bg-slate-900 text-teal-400 border-slate-800'
                            }`}
                          >
                            LCX: {pred.vessels.LCX.stenosisEstimatePercent}%
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded border ${
                              pred.vessels.RCA.stenosisEstimatePercent >= 70
                                ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                                : pred.vessels.RCA.stenosisEstimatePercent >= 40
                                ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                                : 'bg-slate-900 text-teal-400 border-slate-800'
                            }`}
                          >
                            RCA: {pred.vessels.RCA.stenosisEstimatePercent}%
                          </span>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectingRecord(r)}
                            title="Inspect Detailed Clinical Intake"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              onSelectRecord(r);
                              onNavigate('visualization');
                            }}
                            title="Load Patient in 3D Heart Viewer"
                            className="px-2.5 py-1 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-semibold rounded transition-colors flex items-center gap-1"
                          >
                            <span>3D Stage</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => onDeleteRecord(r.id)}
                            title="Delete Record"
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Assessment Records Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              No patient cases match your current filter settings, or the cohort list has been cleared.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setRiskFilter('ALL');
                setVesselFilter('ALL');
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={onResetCohort}
              className="px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Synthetic Demo Cohort</span>
            </button>
          </div>
        </div>
      )}

      {/* Case Details Drawer / Modal */}
      {inspectingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1829] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold">
                  Case Record Details
                </span>
                <h3 className="text-lg font-bold text-white">
                  {inspectingRecord.patientData.demographics.name} ({inspectingRecord.patientData.demographics.patientId})
                </h3>
              </div>
              <button
                onClick={() => setInspectingRecord(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Age / Sex</span>
                <div className="font-semibold text-white text-xs mt-0.5">
                  {inspectingRecord.patientData.demographics.age}y / {inspectingRecord.patientData.demographics.sex}
                </div>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">LVEF</span>
                <div className="font-semibold text-white text-xs mt-0.5 font-mono">
                  {inspectingRecord.patientData.echo.lvef}%
                </div>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">hs-Troponin T</span>
                <div className="font-semibold text-white text-xs mt-0.5 font-mono">
                  {inspectingRecord.patientData.labs.troponinT} ng/L
                </div>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">ST Depression</span>
                <div className="font-semibold text-white text-xs mt-0.5 font-mono">
                  {inspectingRecord.patientData.ecg.stDepression} mm
                </div>
              </div>
            </div>

            {/* Clinical Notes & Synthesis */}
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
              <span className="text-teal-400 font-semibold block">Case Synthesis:</span>
              <p>{inspectingRecord.prediction.clinicalSummary}</p>
              {inspectingRecord.notes && (
                <p className="text-slate-400 pt-1 border-t border-slate-800 italic">
                  Physician Note: "{inspectingRecord.notes}"
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setInspectingRecord(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onSelectRecord(inspectingRecord);
                  setInspectingRecord(null);
                  onNavigate('visualization');
                }}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Load in 3D Heart Stage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
