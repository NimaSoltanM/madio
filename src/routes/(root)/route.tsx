import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Navigation } from '@/components/Navigation';

export const Route = createFileRoute('/(root)')({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <Navigation />
      <Outlet />
    </>
  );
}
