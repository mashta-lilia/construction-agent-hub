import { createBrowserRouter } from 'react-router';

import { DashboardPage } from '@/pages/DashboardPage';

/**
 * All route configuration lives here rather than being scattered across
 * `App.tsx` and the pages. Feature routes are added as their pages land.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    children: [{ index: true, element: <DashboardPage /> }],
  },
]);
