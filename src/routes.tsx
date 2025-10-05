import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import Layout from './layout/layout';

const Dashboard = lazy(() => import('@/pages/dashboard'));
const Onboarding = lazy(() => import('@/pages/onboarding'));
const Send = lazy(() => import('@/pages/send'));
const Swap = lazy(() => import('@/pages/swap'));
const Deposit = lazy(() => import('@/pages/deposit'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Onboarding />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'send', element: <Send /> },
      { path: 'swap', element: <Swap /> },
      { path: 'deposit', element: <Deposit /> },
    ],
  },
]);
export default router;
