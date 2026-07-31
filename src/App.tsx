import { RouterProvider } from 'react-router';

import { router } from '@/routes';

import './App.css';

export function App() {
  return <RouterProvider router={router} />;
}
