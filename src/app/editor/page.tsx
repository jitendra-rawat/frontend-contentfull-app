'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { DragDropContext } from 'react-beautiful-dnd';
import { store, persistor } from '../redux/store';
import { initContentfulSDK, updateFieldValue, getFieldValue } from '../lib/contentful-sdk';
import DragDropContainer from '../components/DragDropContainer';
import UndoRedoControls from '../components/UndoRedoControls';
import ComponentPalette from '../components/ComponentPalette';
import DevelopmentMode from '../components/DevelopmentMode';
import PreviewModal from '../components/PreviewModal';
import { RootState } from '../redux/store';
import { setLayout } from '../redux/slices/layoutSlice';
import { ComponentConfig } from '../lib/types';
import styles from '../styles/DragDrop.module.css';

const ENTRY_ID = process.env.NEXT_PUBLIC_CONTENTFUL_ENTRY_ID || 'YOUR_ENTRY_ID_HERE'; // TODO: Dynamically determine entryId if needed

const EditorContent: React.FC = () => {
  const dispatch = useDispatch();
  const layout = useSelector((state: RootState) => state.layout.current);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedLayoutRef = useRef<string>('');

  // Manual save function
  const saveLayoutToContentful = useCallback(async () => {
    if (!sdkReady) {
      console.warn('SDK not ready, cannot save');
      return;
    }

    try {
      // Validate layout data
      if (!Array.isArray(layout)) {
        throw new Error('Layout data must be an array');
      }
      
      // Format the data for Contentful Object field
      const contentfulData = {
        components: layout,
        lastModified: new Date().toISOString(),
        version: '1.0',
        metadata: {
          totalComponents: layout.length,
          componentTypes: [...new Set(layout.map(c => c.type))]
        }
      };
      
      console.log('💾 Saving to Contentful:', contentfulData);
      
      // Use the helper function from SDK
      await updateFieldValue(contentfulData, ENTRY_ID);
      
      console.log('✅ Layout saved to Contentful successfully');
      return contentfulData;
    } catch (error) {
      console.error('❌ Failed to save layout:', error);
      throw error;
    }
  }, [layout, sdkReady]);

  // Manual save with UI feedback
  const handleManualSave = useCallback(async () => {
    try {
      setIsSaving(true);
      await saveLayoutToContentful();
      lastSavedLayoutRef.current = JSON.stringify(layout);
    } catch (error) {
      console.error('Manual save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [saveLayoutToContentful, layout]);

  // Load initial data from Contentful
  const loadInitialData = useCallback(() => {
    if (!sdkReady) return;

    try {
      const initialValue = getFieldValue();
      console.log('📥 Initial Contentful value:', initialValue);
      
      if (initialValue) {
        let componentsToLoad: ComponentConfig[] = [];
        
        // Handle new object format with components array
        if (initialValue.components && Array.isArray(initialValue.components)) {
          componentsToLoad = initialValue.components;
          console.log('📥 Loading layout (object format):', componentsToLoad);
        }
        // Handle legacy direct array format
        else if (Array.isArray(initialValue)) {
          componentsToLoad = initialValue;
          console.log('📥 Loading layout (array format):', componentsToLoad);
        }
        // Handle string format (shouldn't happen with Object field)
        else if (typeof initialValue === 'string') {
          try {
            const parsed = JSON.parse(initialValue);
            if (parsed.components && Array.isArray(parsed.components)) {
              componentsToLoad = parsed.components;
            } else if (Array.isArray(parsed)) {
              componentsToLoad = parsed;
            }
            console.log('📥 Loading layout (parsed format):', componentsToLoad);
          } catch (parseError) {
            console.error('❌ Failed to parse initial layout value:', parseError);
            return;
          }
        }

        if (componentsToLoad.length > 0) {
          dispatch(setLayout(componentsToLoad));
          lastSavedLayoutRef.current = JSON.stringify(componentsToLoad);
          console.log('✅ Initial layout loaded successfully');
        }
      } else {
        console.log('📝 No initial layout data, starting with empty layout');
        // Initialize with empty layout if no data exists
        const emptyData = {
          components: [],
          lastModified: new Date().toISOString(),
          version: '1.0'
        };
        updateFieldValue(emptyData, ENTRY_ID).catch(console.error);
      }
    } catch (error) {
      console.error('❌ Failed to load initial data:', error);
    }
  }, [dispatch, sdkReady]);

  // Initialize SDK and set up listeners
  useEffect(() => {
    console.log('🚀 Initializing Contentful SDK...');
    
    initContentfulSDK();
    
    // Wait for SDK to be ready
    const checkSDK = () => {
      if ((window as any).sdk) {
        console.log('✅ SDK is ready');
        setSdkReady(true);
        
        // Set up external change listener
        const unsubscribe = (window as any).sdk.field.onValueChanged((value: any) => {
          console.log('🔄 External field change detected:', value);
          
          if (value && value.components && Array.isArray(value.components)) {
            // Only update if it's different from current layout
            const currentLayoutString = JSON.stringify(layout);
            const newLayoutString = JSON.stringify(value.components);
            
            if (currentLayoutString !== newLayoutString) {
              dispatch(setLayout(value.components));
              lastSavedLayoutRef.current = newLayoutString;
              console.log('📥 Layout updated from external change');
            }
          }
        });

        // Listen for custom field change events
        const handleCustomFieldChange = (event: CustomEvent) => {
          console.log('🔄 Custom field change event:', event.detail);
          if (event.detail && event.detail.components) {
            dispatch(setLayout(event.detail.components));
          }
        };

        window.addEventListener('contentfulFieldChanged', handleCustomFieldChange as EventListener);

        // Cleanup function
        return () => {
          if (unsubscribe) unsubscribe();
          window.removeEventListener('contentfulFieldChanged', handleCustomFieldChange as EventListener);
        };
      } else {
        // Retry after a short delay
        setTimeout(checkSDK, 100);
      }
    };

    checkSDK();

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [dispatch, layout]);

  // Load initial data when SDK is ready
  useEffect(() => {
    if (sdkReady) {
      loadInitialData();
    }
  }, [sdkReady, loadInitialData]);

  const handlePreview = () => {
    const isDevelopment = window.location.origin.includes('localhost');
    
    if (isDevelopment) {
      setIsPreviewModalOpen(true);
      return;
    }

    if (sdkReady && (window as any).sdk) {
      try {
        const entrySys = (window as any).sdk.entry.getSys();
        const pageId = entrySys.id;
        const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://your-frontend-domain.com';
        const previewUrl = `${frontendUrl}/landing/${pageId}`;
        
        console.log('🔍 Opening preview:', previewUrl);
        window.open(previewUrl, '_blank');
      } catch (error) {
        console.error('❌ Error opening preview:', error);
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
      setHasUserInteracted(true);

      // Handle drops from palette to layout
      if (source.droppableId === 'palette' && destination.droppableId === 'layout') {
        const componentType = result.draggableId.replace('palette-', '');
        
        const availableComponents: ComponentConfig[] = [
          { id: 'hero', type: 'HeroBlock', name: 'Hero Block' },
          { id: 'twoColumn', type: 'TwoColumnRow', name: 'Two Column Row' },
          { id: 'imageGrid', type: 'ImageGrid', name: '2x2 Image Grid' },
        ];

        const baseComponent = availableComponents.find(c => c.id === componentType);
        const newComponent: ComponentConfig = {
          id: `${componentType}-${Date.now()}`,
          type: componentType as ComponentConfig['type'],
          name: baseComponent?.name || componentType
        };

        const newLayout = Array.from(layout);
        newLayout.splice(destination.index, 0, newComponent);
        dispatch(setLayout(newLayout));
        return;
      }

      // Handle reordering within layout
      if (source.droppableId === 'layout' && destination.droppableId === 'layout') {
        const reordered = Array.from(layout);
        const [moved] = reordered.splice(source.index, 1);
        reordered.splice(destination.index, 0, moved);
        dispatch(setLayout(reordered));
        return;
      }
    },
    [layout, dispatch]
  );

  // Helper function to get default props for components
  const getDefaultPropsForComponent = (componentType: string) => {
    switch (componentType) {
      case 'hero':
        return {
          title: 'Hero Title',
          subtitle: 'Hero Subtitle',
          backgroundImage: ''
        };
      case 'twoColumn':
        return {
          leftContent: 'Left Column Content',
          rightContent: 'Right Column Content'
        };
      case 'imageGrid':
        return {
          images: [
            { src: '', alt: 'Image 1' },
            { src: '', alt: 'Image 2' },
            { src: '', alt: 'Image 3' },
            { src: '', alt: 'Image 4' }
          ]
        };
      default:
        return {};
    }
  };

  const handleUserInteraction = useCallback(() => {
    setHasUserInteracted(true);
  }, []);

  const toggleAutoSave = useCallback(() => {
    setAutoSaveEnabled(prev => !prev);
    console.log('🔄 Auto-save toggled:', !autoSaveEnabled);
  }, [autoSaveEnabled]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.container}>
        <DevelopmentMode />
        <div className={styles.mainContent}>
          <h1 className={styles.pageTitle}>🎨 Layout Editor</h1>
          
          <div className={styles.headerControls}>
            <div className={styles.statusIndicator}>
              <span className={sdkReady ? styles.statusReady : styles.statusLoading}>
                {sdkReady ? '🟢 Connected' : '🟡 Connecting...'}
              </span>
            </div>
            
            <div className={styles.actionButtons}>
              <button onClick={handlePreview} className={styles.previewButton}>
                👁️ Preview
              </button>
              <button 
                onClick={handleManualSave} 
                className={styles.saveButton}
                disabled={isSaving || !sdkReady}
              >
                {isSaving ? '💾 Saving...' : '💾 Save Layout'}
              </button>
            </div>
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