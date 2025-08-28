import React from 'react';
import Logo from './Logo';

export default function LoadingSpinner({ message = "Loading...", size = "large" }) {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12", 
    large: "w-16 h-16"
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-organic-background" 
      role="status" 
      aria-live="polite"
      aria-label={message}
    >
      <div className="text-center">
        {/* Brand Logo Loading Animation */}
        <div className={`mx-auto mb-4 text-organic-primary animate-pulse`}>
          <Logo 
            className="text-organic-primary" 
            size="large" 
            linkTo={null} 
            showText={false} 
          />
        </div>
        
        {/* Loading Message */}
        <p className="text-organic-text font-medium" id="loading-message">
          {message}
        </p>
        
        {/* Screen Reader Text */}
        <span className="sr-only">
          Please wait while content is loading
        </span>
        
        {/* Subtle Loading Dots */}
        <div className="flex justify-center mt-2 space-x-1">
          <div className="w-2 h-2 bg-organic-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-organic-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-organic-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}