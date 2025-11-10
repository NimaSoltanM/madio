import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { AuthProvider } from '@/lib/auth';
import { CartProvider } from '@/lib/cart';

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <CartProvider>
        <Outlet />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      </CartProvider>
    </AuthProvider>
  ),
});
