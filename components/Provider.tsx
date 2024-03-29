'use client';

import { ReactNode, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';

interface ProviderPropsType {
  children: ReactNode;
  session: Session | null | undefined;
}

const Provider = ({ children, session }: ProviderPropsType) => {
  return (
    <SessionProvider session={session}>
        {children}
    </SessionProvider>
  )
}

export default Provider