'use client';

import { useEffect, useState } from 'react';
import styles from '../styles/DragDrop.module.css';

const DevelopmentMode: React.FC = () => {
  const [isDevelopment, setIsDevelopment] = useState(false);
  const [isOutsideContentful, setIsOutsideContentful] = useState(false);

  useEffect(() => {
    const isDev = window.location.origin.includes('localhost') || 
                  window.location.origin.includes('127.0.0.1');
    setIsDevelopment(isDev);
    
    // Use the robust detection for Contentful
    const isOutside = !isContentfulEnvironment();
    setIsOutsideContentful(isOutside);
  }, []);

  const isContentfulEnvironment = (): boolean => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (
        urlParams.has('space') ||
        urlParams.has('environment') ||
        urlParams.has('entry') ||
        urlParams.has('field') ||
        urlParams.has('contentfulApp')
      ) {
        return true;
      }
      if ((window as any).contentful || (window as any).__CONTENTFUL__) {
        return true;
      }
      if (window.self !== window.top) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  if (!isDevelopment && !isOutsideContentful) return null;

  return (
    <div className={styles.devMode}>
      {isDevelopment ? '🛠️ Development Mode' : '🌐 Standalone Mode'}
      <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.8 }}>
        {isOutsideContentful ? 'Running outside Contentful' : 'Local development'}
      </div>
    </div>
  );
};

export default DevelopmentMode; 