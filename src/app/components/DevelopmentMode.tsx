'use client';

import { useEffect, useState } from 'react';
import styles from '../styles/DragDrop.module.css';

const DevelopmentMode: React.FC = () => {
  const [isDevelopment, setIsDevelopment] = useState(false);

  useEffect(() => {
    const isDev = window.location.origin.includes('localhost') || 
                  window.location.origin.includes('127.0.0.1');
    setIsDevelopment(isDev);
  }, []);

  if (!isDevelopment) return null;

  return (
    <div className={styles.devMode}>
      🛠️ Development Mode
    </div>
  );
};

export default DevelopmentMode; 