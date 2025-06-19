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
    
    // Check if we're outside Contentful
    const isOutside = !isContentfulEnvironment();
    setIsOutsideContentful(isOutside);
  }, []);

  const isContentfulEnvironment = (): boolean => {
    try {
      // Check if we're in an iframe
      if (window.self !== window.top) {
        const parentOrigin = window.location.origin;
        const isContentfulDomain = parentOrigin.includes('contentful.com') || 
                                  parentOrigin.includes('contentful.app') ||
                                  parentOrigin.includes('contentful.dev');
        return isContentfulDomain;
      }
      
      // Check for Contentful-specific URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('space') || urlParams.has('environment')) {
        return true;
      }
      
      // Check for Contentful-specific properties
      if ((window as any).contentful || (window as any).__CONTENTFUL__) {
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