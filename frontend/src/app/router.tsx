import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Spinner } from '../components/shared/UI';

const LandingPage          = lazy(() => import('../pages/LandingPage'));
const IngestProgressPage   = lazy(() => import('../pages/IngestProgressPage'));
const OverviewPage         = lazy(() => import('../pages/OverviewPage'));
const GraphExplorerPage    = lazy(() => import('../pages/GraphExplorerPage'));
const FlowVisualizerPage   = lazy(() => import('../pages/FlowVisualizerPage'));
const RiskIntelligencePage = lazy(() => import('../pages/RiskIntelligencePage'));
const AskRepoPage          = lazy(() => import('../pages/AskRepoPage'));
const ExplainDetailPage    = lazy(() => import('../pages/ExplainDetailPage'));
// ── New feature pages ─────────────────────────────────────────────────────────
const ImpactPage           = lazy(() => import('../pages/ImpactPage'));
const OnboardingPage       = lazy(() => import('../pages/OnboardingPage'));
const CriticalFilesPage    = lazy(() => import('../pages/CriticalFilesPage'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#080b14] flex items-center justify-center">
      <Spinner className="w-8 h-8" />
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"                           element={<LandingPage />} />
          <Route path="/ingest/:sessionId"          element={<IngestProgressPage />} />
          <Route path="/overview/:sessionId"        element={<OverviewPage />} />
          <Route path="/graph/:sessionId"           element={<GraphExplorerPage />} />
          <Route path="/flow/:sessionId"            element={<FlowVisualizerPage />} />
          <Route path="/risk/:sessionId"            element={<RiskIntelligencePage />} />
          <Route path="/query/:sessionId"           element={<AskRepoPage />} />
          <Route path="/explain/:sessionId"         element={<ExplainDetailPage />} />
          {/* New feature routes */}
          <Route path="/impact/:sessionId"          element={<ImpactPage />} />
          <Route path="/onboarding/:sessionId"      element={<OnboardingPage />} />
          <Route path="/critical-files/:sessionId"  element={<CriticalFilesPage />} />
          <Route path="*"                           element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

