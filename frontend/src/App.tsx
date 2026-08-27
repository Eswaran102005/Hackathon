import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PitchModal } from './components/PitchModal';
import { DashboardPage } from './pages/DashboardPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { PaymentDetailPage } from './pages/PaymentDetailPage';
import { CommandCenterPage } from './pages/CommandCenterPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { WebhooksPage } from './pages/WebhooksPage';
import { api } from './services/api';

export const App: React.FC = () => {
  const [pitchData, setPitchData] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSimulatePitch = async () => {
    setIsSimulating(true);
    try {
      const data = await api.simulateFailurePitch();
      setPitchData(data);
    } catch (err) {
      console.error('Failed to trigger pitch flow simulation:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await api.resetDemoData();
      window.location.reload();
    } catch (err) {
      console.error('Failed to reset demo data:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Router
      basename={(import.meta as any).env?.BASE_URL || '/'}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
        {/* Top Navbar */}
        <Navbar
          onSimulatePitch={handleSimulatePitch}
          onResetDemo={handleResetDemo}
          isSimulating={isSimulating}
          isResetting={isResetting}
        />

        {/* Main Body Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/payments/:id" element={<PaymentDetailPage />} />
              <Route path="/command-center" element={<CommandCenterPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/simulator" element={<SimulatorPage />} />
              <Route path="/webhooks" element={<WebhooksPage />} />
            </Routes>
          </main>
        </div>

        {/* Pitch Flow Simulation Modal */}
        {pitchData && (
          <PitchModal
            data={pitchData}
            onClose={() => setPitchData(null)}
            onRefresh={() => {
              // Trigger reload or state refresh
            }}
          />
        )}
      </div>
    </Router>
  );
};

export default App;
