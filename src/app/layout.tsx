import { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Contentful Layout Editor',
  description: 'Drag-and-drop layout editor for Contentful',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
