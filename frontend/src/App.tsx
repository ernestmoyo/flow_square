import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import { useAuthStore } from './stores/authStore';

const Login = lazy(() => import('./pages/Login'));
const ControlRoom = lazy(() => import('./pages/dashboards/ControlRoom'));
const IntegrityHSE = lazy(() => import('./pages/dashboards/IntegrityHSE'));
const FinanceReg = lazy(() => import('./pages/dashboards/FinanceReg'));
const Executive = lazy(() => import('./pages/dashboards/Executive'));
const BerthScheduler = lazy(() => import('./pages/vessels/BerthScheduler'));
const VesselList = lazy(() => import('./pages/vessels/VesselList'));
const TankInventory = lazy(() => import('./pages/terminals/TankInventory'));
const LoadingOperations = lazy(() => import('./pages/terminals/LoadingOperations'));
const FleetOverview = lazy(() => import('./pages/fleet/FleetOverview'));
const TripManagement = lazy(() => import('./pages/fleet/TripManagement'));
const EPodVerification = lazy(() => import('./pages/fleet/EPodVerification'));
const UFGAnalysis = lazy(() => import('./pages/analytics/UFGAnalysis'));
const LeakDetection = lazy(() => import('./pages/analytics/LeakDetection'));
const FraudMonitoring = lazy(() => import('./pages/analytics/FraudMonitoring'));
const PredictiveMaintenance = lazy(() => import('./pages/analytics/PredictiveMaintenance'));
const ReconciliationDashboard = lazy(() => import('./pages/reconciliation/ReconciliationDashboard'));
const ReportGenerator = lazy(() => import('./pages/compliance/ReportGenerator'));
const AuditTrail = lazy(() => import('./pages/compliance/AuditTrail'));
const AssetHierarchy = lazy(() => import('./pages/settings/AssetHierarchy'));
const UserManagement = lazy(() => import('./pages/settings/UserManagement'));
const ToleranceConfig = lazy(() => import('./pages/settings/ToleranceConfig'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard/control-room" replace />} />
          <Route path="dashboard/control-room" element={<ControlRoom />} />
          <Route path="dashboard/integrity" element={<IntegrityHSE />} />
          <Route path="dashboard/finance" element={<FinanceReg />} />
          <Route path="dashboard/executive" element={<Executive />} />
          <Route path="vessels" element={<VesselList />} />
          <Route path="vessels/berth-scheduler" element={<BerthScheduler />} />
          <Route path="terminals/inventory" element={<TankInventory />} />
          <Route path="terminals/loading" element={<LoadingOperations />} />
          <Route path="fleet" element={<FleetOverview />} />
          <Route path="fleet/trips" element={<TripManagement />} />
          <Route path="fleet/epod" element={<EPodVerification />} />
          <Route path="analytics/ufg" element={<UFGAnalysis />} />
          <Route path="analytics/leak" element={<LeakDetection />} />
          <Route path="analytics/fraud" element={<FraudMonitoring />} />
          <Route path="analytics/maintenance" element={<PredictiveMaintenance />} />
          <Route path="reconciliation" element={<ReconciliationDashboard />} />
          <Route path="compliance/reports" element={<ReportGenerator />} />
          <Route path="compliance/audit" element={<AuditTrail />} />
          <Route path="settings/assets" element={<AssetHierarchy />} />
          <Route path="settings/users" element={<UserManagement />} />
          <Route path="settings/tolerance" element={<ToleranceConfig />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
