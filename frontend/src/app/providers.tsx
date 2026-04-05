import React from 'react';
// Future: could add React Query provider, theme provider, toast provider here
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
