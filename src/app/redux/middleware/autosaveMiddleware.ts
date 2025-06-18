import { Middleware } from '@reduxjs/toolkit';
import { setLayout } from '../slices/layoutSlice';
import { AppExtensionSDK } from '@contentful/app-sdk';

const autosaveMiddleware: Middleware = (store) => {
  let timeout: NodeJS.Timeout | null = null;
  let isSaving = false;
  let saveAttempts = 0;
  const maxRetries = 3;

  return (next) => (action) => {
    const result = next(action);
    
    if (action.type === setLayout.type && (window as any).sdk) {
      if (timeout) clearTimeout(timeout);
      
      timeout = setTimeout(async () => {
        if (isSaving) return; // Prevent multiple simultaneous saves
        
        try {
          isSaving = true;
          saveAttempts = 0;
          
          const state = store.getState();
          const layoutData = state.layout.current;
          
          // Validate layout data
          if (!Array.isArray(layoutData)) {
            throw new Error('Layout data must be an array');
          }
          
          // Format the data for Contentful Object field
          const contentfulData = {
            components: layoutData,
            lastModified: new Date().toISOString(),
            version: '1.0'
          };
          
          console.log('🔄 Saving to Contentful:', contentfulData);
          
          // Save as JSON object to Contentful Object field
          await (window as any).sdk.field.setValue(contentfulData);
          
          // Show success notification
          if ((window as any).sdk.notifier) {
            (window as any).sdk.notifier.success('Layout saved successfully!');
          }
          
          console.log('✅ Layout saved to Contentful successfully');
          
          // Reset retry counter on success
          saveAttempts = 0;
          
        } catch (error) {
          console.error('❌ Failed to save layout to Contentful:', error);
          saveAttempts++;
          
          // Retry logic
          if (saveAttempts < maxRetries) {
            console.log(`🔄 Retrying save (attempt ${saveAttempts + 1}/${maxRetries})...`);
            setTimeout(() => {
              // Trigger another save attempt
              store.dispatch(setLayout(store.getState().layout.current));
            }, 1000 * saveAttempts); // Exponential backoff
            return;
          }
          
          // Show error notification after max retries
          if ((window as any).sdk.notifier) {
            (window as any).sdk.notifier.error(
              `Failed to save layout after ${maxRetries} attempts. Please try again.`
            );
          }
        } finally {
          isSaving = false;
        }
      }, 1000); // 1 second debounce
    }
    
    return result;
  };
};

export default autosaveMiddleware;
