'use client';

import { useState } from 'react';
import { ComponentConfig } from '../lib/types';
import styles from '../styles/DragDrop.module.css';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  layout: ComponentConfig[];
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, layout }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'json'>('preview');

  if (!isOpen) return null;

  const layoutJson = JSON.stringify(layout, null, 2);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Layout Preview</h3>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        
        <div className={styles.modalTabs}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'preview' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'json' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('json')}
          >
            JSON Data
          </button>
        </div>

        <div className={styles.modalContent}>
          {activeTab === 'preview' ? (
            <div className={styles.previewContent}>
              <h4>Layout Components ({layout.length})</h4>
              {layout.length === 0 ? (
                <p>No components in layout. Add some from the palette above!</p>
              ) : (
                <div className={styles.previewList}>
                  {layout.map((component, index) => (
                    <div key={component.id} className={styles.previewItem}>
                      <span className={styles.previewIndex}>{index + 1}</span>
                      <div className={styles.previewInfo}>
                        <strong>{component.name}</strong>
                        <small>ID: {component.id}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.jsonContent}>
              <h4>Layout JSON Data</h4>
              <pre className={styles.jsonCode}>
                {layoutJson}
              </pre>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.modalButton}>
            Close
          </button>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(layoutJson);
              alert('JSON copied to clipboard!');
            }} 
            className={styles.modalButton}
          >
            Copy JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal; 