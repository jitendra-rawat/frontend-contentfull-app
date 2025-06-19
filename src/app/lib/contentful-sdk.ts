import { init } from '@contentful/app-sdk';

let lastDispatchedValue: any = undefined;

export function initContentfulSDK() {
  if (typeof window !== 'undefined') {
    const isInContentful = isContentfulEnvironment();
    
    if (isInContentful) {
      try {
        init((sdk) => {
          (window as any).sdk = sdk;
          console.log('Contentful SDK initialized successfully');
          
          // Initialize auto-resizer for proper iframe sizing
          if ('window' in sdk && sdk.window?.startAutoResizer) {
            sdk.window.startAutoResizer();
          }
          
          // Set up proper field value handling
          setupFieldHandling(sdk);
        });
      } catch (error) {
        console.error('Contentful SDK initialization failed:', error);
        createMockSDK();
      }
    } else {
      console.log('Running outside Contentful - using mock SDK');
      createMockSDK();
    }
  }
}

function setupFieldHandling(sdk: any) {
  // Ensure field exists and is properly configured
  if (!sdk.field) {
    console.error('SDK field is not available');
    return;
  }
  
  // Get current field value and ensure it's properly formatted
  const currentValue = sdk.field.getValue();
  console.log('Current field value:', currentValue);
  
  // If field is empty or invalid, initialize with empty array/object
  if (!currentValue || (Array.isArray(currentValue) && currentValue.length === 0)) {
    sdk.field.setValue([]).catch((error: any) => {
      console.error('Failed to initialize field value:', error);
    });
  }
  
  // Listen for external changes to the field
  sdk.field.onValueChanged((value: any) => {
    // Only dispatch if value has changed
    if (JSON.stringify(value) !== JSON.stringify(lastDispatchedValue)) {
      lastDispatchedValue = value;
      console.log('Field value changed externally:', value);
      window.dispatchEvent(new CustomEvent('contentfulFieldChanged', { detail: value }));
    }
  });
}

function isContentfulEnvironment(): boolean {
  try {
    // Check for Contentful-specific URL parameters
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

    // Check for Contentful-specific properties
    if ((window as any).contentful || (window as any).__CONTENTFUL__) {
      return true;
    }

    // Fallback: check if in an iframe
    if (window.self !== window.top) {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}

function createMockSDK() {
  let mockValue: any = [];
  let valueChangeCallbacks: Array<(value: any) => void> = [];
  
  // Create a comprehensive mock SDK for development
  (window as any).sdk = {
    field: {
      getValue: () => {
        console.log('Mock: Getting field value:', mockValue);
        return mockValue;
      },
      setValue: (value: any) => {
        console.log('Mock: Setting field value to:', value);
        
        // Validate JSON data before setting
        try {
          const serialized = JSON.stringify(value);
          const parsed = JSON.parse(serialized);
          mockValue = parsed;
          
          // Trigger value change callbacks
          valueChangeCallbacks.forEach(callback => {
            try {
              callback(mockValue);
            } catch (error) {
              console.error('Error in value change callback:', error);
            }
          });
          
          // Dispatch custom event for app updates
          window.dispatchEvent(new CustomEvent('contentfulFieldChanged', { detail: mockValue }));
          
          return Promise.resolve();
        } catch (error) {
          console.error('Mock: Invalid JSON data:', error);
          return Promise.reject(new Error('Invalid JSON data'));
        }
      },
      onValueChanged: (callback: (value: any) => void) => {
        console.log('Mock: Value change listener registered');
        valueChangeCallbacks.push(callback);
        
        // Return unsubscribe function
        return () => {
          console.log('Mock: Value change listener removed');
          const index = valueChangeCallbacks.indexOf(callback);
          if (index > -1) {
            valueChangeCallbacks.splice(index, 1);
          }
        };
      },
      setInvalid: (isInvalid: boolean, message?: string) => {
        console.log('Mock: Field validity set to:', !isInvalid, message);
        return Promise.resolve();
      },
    },
    window: {
      startAutoResizer: () => {
        console.log('Mock: Auto resizer started');
        // Simulate auto-resizing in development
        const resizeHandler = () => {
          const height = document.body.scrollHeight;
          console.log('Mock: Resizing to height:', height);
        };
        window.addEventListener('resize', resizeHandler);
        // Initial resize
        setTimeout(resizeHandler, 100);
      },
      stopAutoResizer: () => {
        console.log('Mock: Auto resizer stopped');
      },
      updateHeight: (height: number) => {
        console.log('Mock: Manual height update:', height);
      },
    },
    entry: {
      getSys: () => {
        console.log('Mock: Getting entry sys');
        return { 
          id: 'mock-entry-id', 
          version: 1, 
          space: { sys: { id: 'mock-space-id' } },
          environment: { sys: { id: 'master' } }
        };
      },
      onSysChanged: (callback: (sys: any) => void) => {
        console.log('Mock: Sys change listener registered');
        return () => console.log('Mock: Sys change listener removed');
      },
    },
    space: {
      getEntry: (id: string) => {
        console.log('Mock: Getting entry:', id);
        return Promise.resolve({ 
          sys: { id, type: 'Entry' }, 
          fields: { title: { 'en-US': 'Mock Entry' } } 
        });
      },
      getEntries: (query?: any) => {
        console.log('Mock: Getting entries with query:', query);
        return Promise.resolve({
          items: [],
          total: 0,
          skip: 0,
          limit: 100
        });
      },
    },
    notifier: {
      success: (message: string) => {
        console.log('Mock Success:', message);
        showNotification('Success', message, 'success');
      },
      error: (message: string) => {
        console.error('Mock Error:', message);
        showNotification('Error', message, 'error');
      },
      warning: (message: string) => {
        console.warn('Mock Warning:', message);
        showNotification('Warning', message, 'warning');
      },
    },
    parameters: {
      installation: {},
      instance: {},
      invocation: {}
    }
  };
  
  console.log('Mock SDK created and ready');
}

function showNotification(title: string, message: string, type: 'success' | 'error' | 'warning') {
  // Create a simple notification for when not in Contentful
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  switch (type) {
    case 'success':
      notification.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
      break;
    case 'error':
      notification.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
      break;
    case 'warning':
      notification.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      break;
  }
  
  notification.innerHTML = `
    <div style="font-size: 14px; margin-bottom: 4px;">${title}</div>
    <div style="font-size: 12px; opacity: 0.9;">${message}</div>
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 4 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 4000);
}

// Helper function to safely update field value with JSON data
export function updateFieldValue(data: any) {
  const sdk = (window as any).sdk;
  if (!sdk || !sdk.field) {
    console.error('SDK or field not available');
    return Promise.reject(new Error('SDK not initialized'));
  }
  
  try {
    // Validate that data can be serialized to JSON
    JSON.stringify(data);
    
    return sdk.field.setValue(data).then(() => {
      console.log('Field value updated successfully:', data);
      sdk.notifier.success('Layout configuration saved');
    }).catch((error: any) => {
      console.error('Failed to update field value:', error);
      sdk.notifier.error('Failed to save layout configuration');
      throw error;
    });
  } catch (error) {
    console.error('Invalid JSON data:', error);
    sdk.notifier.error('Invalid layout configuration data');
    return Promise.reject(error);
  }
}

// Helper function to get current field value
export function getFieldValue() {
  const sdk = (window as any).sdk;
  if (!sdk || !sdk.field) {
    console.error('SDK or field not available');
    return null;
  }
  
  return sdk.field.getValue();
}