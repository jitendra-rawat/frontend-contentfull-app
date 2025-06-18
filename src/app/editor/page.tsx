'use client';

import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { DragDropContext } from 'react-beautiful-dnd';
import { store, persistor } from '../redux/store';
import { initContentfulSDK } from '../lib/contentful-sdk';
import DragDropContainer from '../components/DragDropContainer';
import UndoRedoControls from '../components/UndoRedoControls';
import ComponentPalette from '../components/ComponentPalette';
import DevelopmentMode from '../components/DevelopmentMode';
import PreviewModal from '../components/PreviewModal';
import { RootState } from '../redux/store';
import { setLayout } from '../redux/slices/layoutSlice';
import { ComponentConfig } from '../lib/types';
import styles from '../styles/DragDrop.module.css';

const EditorContent: React.FC = () => {
  const dispatch = useDispatch();
  const layout = useSelector((state: RootState) => state.layout.current);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const saveLayout = useCallback(async () => {
    if ((window as any).sdk) {
      try {
        setIsSaving(true);
        
        // Validate layout data
        if (!Array.isArray(layout)) {
          throw new Error('Layout data must be an array');
        }
        
        // Format the data for Contentful Object field
        const contentfulData = {
          components: layout,
          lastModified: new Date().toISOString(),
          version: '1.0'
        };
        
        console.log('🔄 Manually saving to Contentful:', contentfulData);
        
        // Save as JSON object to Contentful Object field
        await (window as any).sdk.field.setValue(contentfulData);
        
        if ((window as any).sdk.notifier) {
          (window as any).sdk.notifier.success('Layout saved successfully!');
        }
        
        console.log('✅ Layout manually saved to Contentful successfully');
      } catch (error) {
        console.error('❌ Failed to save layout:', error);
        if ((window as any).sdk.notifier) {
          (window as any).sdk.notifier.error('Failed to save layout. Please try again.');
        }
      } finally {
        setIsSaving(false);
      }
    }
  }, [layout]);

  useEffect(() => {
    initContentfulSDK();
    if ((window as any).sdk) {
      (window as any).sdk.window.startAutoResizer();
      
      // Get initial value from Contentful
      const initialValue = (window as any).sdk.field.getValue();
      if (initialValue) {
        // Handle new format with components array
        if (initialValue.components && Array.isArray(initialValue.components)) {
          dispatch(setLayout(initialValue.components));
          setHasUserInteracted(true);
          console.log('📥 Loaded layout from Contentful (new format):', initialValue.components);
        }
        // Handle legacy format (direct array)
        else if (Array.isArray(initialValue)) {
          dispatch(setLayout(initialValue));
          setHasUserInteracted(true);
          console.log('📥 Loaded layout from Contentful (legacy format):', initialValue);
        }
        // Handle legacy string format
        else if (typeof initialValue === 'string') {
          try {
            const parsed = JSON.parse(initialValue);
            if (parsed.components && Array.isArray(parsed.components)) {
              dispatch(setLayout(parsed.components));
              setHasUserInteracted(true);
              console.log('📥 Loaded layout from Contentful (parsed new format):', parsed.components);
            } else if (Array.isArray(parsed)) {
              dispatch(setLayout(parsed));
              setHasUserInteracted(true);
              console.log('📥 Loaded layout from Contentful (parsed legacy format):', parsed);
            }
          } catch (error) {
            console.error('❌ Failed to parse initial layout value:', error);
          }
        }
      }
      
      // Listen for external changes
      (window as any).sdk.field.onValueChanged((value: any) => {
        if (value) {
          if (value.components && Array.isArray(value.components)) {
            dispatch(setLayout(value.components));
            setHasUserInteracted(true);
            console.log('🔄 Layout updated from external change (new format):', value.components);
          } else if (Array.isArray(value)) {
            dispatch(setLayout(value));
            setHasUserInteracted(true);
            console.log('🔄 Layout updated from external change (legacy format):', value);
          }
        }
      });
    }
  }, [dispatch]);

  const handlePreview = () => {
    const isDevelopment = window.location.origin.includes('localhost');
    
    if (isDevelopment) {
      // In development mode, show the preview modal
      setIsPreviewModalOpen(true);
      return;
    }

    // In Contentful environment, use the actual SDK
    if ((window as any).sdk) {
      try {
        const pageId = (window as any).sdk.entry.getSys().id;
        const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://your-frontend-domain.com';
        const previewUrl = `${frontendUrl}/landing/${pageId}`;
        window.open(previewUrl, '_blank');
      } catch (error) {
        console.error('Error opening preview:', error);
        if ((window as any).sdk.notifier) {
          (window as any).sdk.notifier.error('Unable to open preview. Please check your frontend URL configuration.');
        }
      }
    }
  };

  const onDragEnd = useCallback(
    (result: any) => {
      if (!result.destination) return;

      const { source, destination } = result;

      // Handle drops from palette to layout
      if (source.droppableId === 'palette' && destination.droppableId === 'layout') {
        setHasUserInteracted(true); // Mark user interaction
        const componentType = result.draggableId.replace('palette-', '');
        
        const availableComponents: ComponentConfig[] = [
          { id: 'hero', type: 'HeroBlock', name: 'Hero Block' },
          { id: 'twoColumn', type: 'TwoColumnRow', name: 'Two Column Row' },
          { id: 'imageGrid', type: 'ImageGrid', name: '2x2 Image Grid' },
        ];

        const newComponent: ComponentConfig = {
          id: `${componentType}-${Date.now()}`,
          type: componentType as ComponentConfig['type'],
          name: availableComponents.find(c => c.id === componentType)?.name || componentType,
        };

        const newLayout = Array.from(layout);
        newLayout.splice(destination.index, 0, newComponent);
        dispatch(setLayout(newLayout));
        return;
      }

      // Handle reordering within layout
      if (source.droppableId === 'layout' && destination.droppableId === 'layout') {
        setHasUserInteracted(true); // Mark user interaction
        const reordered = Array.from(layout);
        const [moved] = reordered.splice(source.index, 1);
        reordered.splice(destination.index, 0, moved);
        dispatch(setLayout(reordered));
        return;
      }
    },
    [layout, dispatch]
  );

  const handleUserInteraction = useCallback(() => {
    setHasUserInteracted(true);
  }, []);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.container}>
        <DevelopmentMode />
        <div className={styles.mainContent}>
          <h1 className={styles.pageTitle}>🎨 Layout Editor</h1>
          <div className={styles.headerControls}>
            <button onClick={handlePreview} className={styles.previewButton}>
              👁️ Preview
            </button>
            <button 
              onClick={saveLayout} 
              className={styles.saveButton}
              disabled={isSaving}
            >
              {isSaving ? '💾 Saving...' : '💾 Save Layout'}
            </button>
          </div>
          <UndoRedoControls onUserInteraction={handleUserInteraction} />
          <ComponentPalette 
            layout={layout} 
            onUserInteraction={handleUserInteraction}
          />
          <DragDropContainer 
            hasUserInteracted={hasUserInteracted}
            onUserInteraction={handleUserInteraction}
          />
          
          <PreviewModal 
            isOpen={isPreviewModalOpen}
            onClose={() => setIsPreviewModalOpen(false)}
            layout={layout}
          />
        </div>
      </div>
    </DragDropContext>
  );
};

export default function EditorPage() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <EditorContent />
      </PersistGate>
    </Provider>
  );
}
