import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { SetupPage } from '../pages/SetupPage';
import { DashboardPage } from '../pages/DashboardPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { BatchesPage } from '../pages/batches/BatchesPage';
import { BatchDetailPage } from '../pages/batches/BatchDetailPage';
import { SalesPage } from '../pages/sales/SalesPage';
import { SaleDetailPage } from '../pages/sales/SaleDetailPage';
import { CustomersPage } from '../pages/customers/CustomersPage';
import { CustomerDetailPage } from '../pages/customers/CustomerDetailPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { WorkersPage } from '../pages/workers/WorkersPage';
import { WorkerDetailPage } from '../pages/workers/WorkerDetailPage';
import { ExpensesPage } from '../pages/expenses/ExpensesPage';
import { SettingsPage } from '../pages/SettingsPage';
import { TravellingCostsPage } from '../pages/travellingCosts/TravellingCostsPage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/app" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/setup', element: <SetupPage /> },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'batches', element: <BatchesPage /> },
          { path: 'batches/:id', element: <BatchDetailPage /> },
          { path: 'sales', element: <SalesPage /> },
          { path: 'sales/:id', element: <SaleDetailPage /> },
          { path: 'customers', element: <CustomersPage /> },
          { path: 'customers/:id', element: <CustomerDetailPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'workers', element: <WorkersPage /> },
          { path: 'workers/:id', element: <WorkerDetailPage /> },
          { path: 'expenses', element: <ExpensesPage /> },
          { path: 'travelling-costs', element: <TravellingCostsPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

