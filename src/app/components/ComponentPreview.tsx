'use client';

import { ComponentConfig } from '../lib/types';
import styles from '../styles/DragDrop.module.css';

interface ComponentPreviewProps {
  component: ComponentConfig;
  layout: ComponentConfig[];
}

const ComponentPreview: React.FC<ComponentPreviewProps> = ({ component }) => {
  return (
    <div className={styles.preview}>
      <div className={styles.thumbnail}>
        {component.type === 'HeroBlock' && (
          <div className={styles.heroThumb}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>Hero Section</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Full-width banner</div>
            </div>
          </div>
        )}
        {component.type === 'TwoColumnRow' && (
          <div className={styles.twoColumnThumb}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '16px', marginBottom: '4px' }}>📝</div>
              <div style={{ fontSize: '10px' }}>Content</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '16px', marginBottom: '4px' }}>🖼️</div>
              <div style={{ fontSize: '10px' }}>Image</div>
            </div>
          </div>
        )}
        {component.type === 'ImageGrid' && (
          <div className={styles.gridThumb}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🖼️</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🖼️</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🖼️</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🖼️</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentPreview;
