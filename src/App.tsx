/**
 * CardioVision 3D — AI-Powered Coronary Artery Risk Visualization
 * Part 1: Interactive Frontend UI/UX, 3D Anatomical Heart Canvas & Clinical Dashboard.
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, NavPage } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardPage } from './components/pages/DashboardPage';
import { AssessmentPage } from './components/pages/AssessmentPage';
import { VisualizationPage } from './components/pages/VisualizationPage';
import { ModelPerformancePage } from './components/pages/ModelPerformancePage';
import { HistoryPage } from './components/pages/HistoryPage';
import { AboutSafetyPage } from './components/pages/AboutSafetyPage';
import { AssessmentRecord } from './types/cardio';
import { INITIAL_DEMO_RECORDS } from './data/mockData';
import {
  getStoredAssessments,
  saveAssessmentRecord,
  deleteStoredAssessment,
} from './services/predictionService';

export default function App() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Cohort & Patient Records State
  const [records, setRecords] = useState<AssessmentRecord[]>(() => {
    const stored = getStoredAssessments();
    if (stored.length > 0) return stored;
    return INITIAL_DEMO_RECORDS;
  });

  // Active Selected Patient for Inspection & 3D view
  const [activeRecord, setActiveRecord] = useState<AssessmentRecord>(() => {
    return records[0] || INITIAL_DEMO_RECORDS[0];
  });

  // Active Selected Coronary Artery Branch in 3D
  const [selectedVessel, setSelectedVessel] = useState<'LAD' | 'LCX' | 'RCA' | 'ALL'>('ALL');

  // Sync activeRecord if records change and activeRecord was deleted
  useEffect(() => {
    if (!records.find((r) => r.id === activeRecord.id) && records.length > 0) {
      setActiveRecord(records[0]);
    }
  }, [records, activeRecord]);

  // Handler: Add new assessment
  const handleSaveAssessment = (newRecord: AssessmentRecord) => {
    saveAssessmentRecord(newRecord);
    setRecords((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
    setActiveRecord(newRecord);
  };

  // Handler: Delete assessment
  const handleDeleteRecord = (id: string) => {
    deleteStoredAssessment(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Handler: Reset to default cohort
  const handleResetCohort = () => {
    localStorage.removeItem('cardiovision_assessments_store');
    setRecords(INITIAL_DEMO_RECORDS);
    setActiveRecord(INITIAL_DEMO_RECORDS[0]);
  };

  // Handler: Jump to 3D with specific vessel highlighted
  const handleSelectVesselIn3D = (vessel: 'LAD' | 'LCX' | 'RCA') => {
    setSelectedVessel(vessel);
    setCurrentPage('visualization');
  };

  return (
    <div className="min-h-screen bg-[#0B1320] text-slate-100 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main App Content Container (Offset by Sidebar on Desktop) */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        {/* Sticky Clinical Header */}
        <Header
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          totalRecordsCount={records.length}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6 max-w-7xl w-full mx-auto">
          {currentPage === 'dashboard' && (
            <DashboardPage
              records={records}
              activeRecord={activeRecord}
              onSelectRecord={setActiveRecord}
              onNavigate={setCurrentPage}
              onSelectVesselIn3D={handleSelectVesselIn3D}
            />
          )}

          {currentPage === 'assessment' && (
            <AssessmentPage
              onSaveAssessment={handleSaveAssessment}
              onNavigate={setCurrentPage}
              onSelectVesselIn3D={handleSelectVesselIn3D}
            />
          )}

          {currentPage === 'visualization' && (
            <VisualizationPage
              records={records}
              activeRecord={activeRecord}
              onSelectRecord={setActiveRecord}
              selectedVessel={selectedVessel}
              onSelectVessel={setSelectedVessel}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'model-performance' && (
            <ModelPerformancePage onNavigate={setCurrentPage} />
          )}

          {currentPage === 'history' && (
            <HistoryPage
              records={records}
              onSelectRecord={setActiveRecord}
              onDeleteRecord={handleDeleteRecord}
              onResetCohort={handleResetCohort}
              onNavigate={setCurrentPage}
              onSelectVesselIn3D={handleSelectVesselIn3D}
            />
          )}

          {currentPage === 'about' && <AboutSafetyPage />}
        </main>
      </div>
    </div>
  );
}
