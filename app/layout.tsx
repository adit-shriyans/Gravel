import Navbar from '@components/Navbar';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google';
import Provider from '@components/Provider'
import { Session } from 'next-auth';
import '@styles/css/index.css';

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({ children, }: { children: React.ReactNode }) {
  const session: Session | null = null;
  return (
    <html lang="en">
      <body className='Root' style={{ margin: 0 }}>
        <Provider session={session}>
          <Navbar />
          <main className='App'>
            {children}
          </main>
        </Provider>
      </body>
    </html>
  )
}
