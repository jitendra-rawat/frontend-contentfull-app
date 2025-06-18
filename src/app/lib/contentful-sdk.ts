import { init } from '@contentful/app-sdk';

export function initContentfulSDK() {
  if (typeof window !== 'undefined') {
    // Check if we're in a Contentful iframe
    const isInContentful = window.location.origin !== 'http://localhost:3000' && 
                          window.location.origin !== 'https://localhost:3000';
    
    if (isInContentful) {
      try {
        init((sdk) => {
          (window as any).sdk = sdk;
          console.log('Contentful SDK initialized successfully');
        });
      } catch (error) {
        console.log('Contentful SDK initialization failed:', error);
        createMockSDK();
      }
    } else {
      console.log('Running in development mode - using mock SDK');
      createMockSDK();
    }
  }
}

function createMockSDK() {
  let mockValue: any = [];
  
  // Create a comprehensive mock SDK for development
  (window as any).sdk = {
    field: {
      getValue: () => {
        console.log('Mock: Getting field value:', mockValue);
        return mockValue;
      },
      setValue: (value: any) => {
        console.log('Mock: Setting field value to:', value);
        mockValue = value;
        return Promise.resolve();
      },
      onValueChanged: (callback: (value: any) => void) => {
        console.log('Mock: Value change listener registered');
        return () => console.log('Mock: Value change listener removed');
      },
    },
    window: {
      startAutoResizer: () => {
        console.log('Mock: Auto resizer started');
      },
      stopAutoResizer: () => {
        console.log('Mock: Auto resizer stopped');
      },
    },
    entry: {
      getSys: () => {
        console.log('Mock: Getting entry sys');
        return { id: 'mock-entry-id', version: 1 };
      },
      onSysChanged: (callback: (sys: any) => void) => {
        console.log('Mock: Sys change listener registered');
        return () => console.log('Mock: Sys change listener removed');
      },
    },
    space: {
      getEntry: (id: string) => {
        console.log('Mock: Getting entry:', id);
        return Promise.resolve({ sys: { id }, fields: {} });
      },
    },
    notifier: {
      success: (message: string) => {
        console.log('Mock Success:', message);
        // In development, also show an alert for visibility
        if (window.location.origin.includes('localhost')) {
          alert(`Success: ${message}`);
        }
      },
      error: (message: string) => {
        console.log('Mock Error:', message);
        // In development, also show an alert for visibility
        if (window.location.origin.includes('localhost')) {
          alert(`Error: ${message}`);
        }
      },
      warning: (message: string) => {
        console.log('Mock Warning:', message);
        // In development, also show an alert for visibility
        if (window.location.origin.includes('localhost')) {
          alert(`Warning: ${message}`);
        }
      },
    },
  };
}
