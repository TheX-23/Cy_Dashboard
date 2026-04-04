/**
 * Global error handler to prevent infinite error loops
 * Safe version that doesn't interfere with React rendering
 */

// Prevent infinite error loops
let errorCount = 0;
const MAX_ERRORS = 10;

const globalErrorHandler = (event: ErrorEvent) => {
  errorCount++;
  console.error(`Global Error #${errorCount}:`, event.error);
  
  // Stop infinite loops
  if (errorCount > MAX_ERRORS) {
    console.warn('Too many errors detected, stopping further error reporting');
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', globalErrorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
      
      // Show user-friendly error message
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 10px; border-radius: 5px; z-index: 9999;">
          <strong>Application Error:</strong> Too many errors occurred. Please refresh the page.
          <button onclick="window.location.reload()" style="margin-left: 10px; padding: 5px 10px; background: white; color: #ef4444; border: none; border-radius: 3px; cursor: pointer;">
            Refresh
          </button>
        </div>
      `;
      if (document.body) {
        document.body.appendChild(errorDiv);
      }
    }
  }
};

const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
  errorCount++;
  console.error(`Unhandled Rejection #${errorCount}:`, event.reason);
  
  if (errorCount > MAX_ERRORS) {
    console.warn('Too many unhandled rejections, stopping further reporting');
    if (typeof window !== 'undefined') {
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
    }
  }
};

// Install global error handlers safely
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.addEventListener('error', globalErrorHandler);
      window.addEventListener('unhandledrejection', unhandledRejectionHandler);
      console.log('Global error handlers installed safely');
    });
  } else {
    window.addEventListener('error', globalErrorHandler);
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);
    console.log('Global error handlers installed safely');
  }
}

export const resetErrorCount = () => {
  errorCount = 0;
  console.log('Error count reset');
};
