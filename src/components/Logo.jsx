import React from 'react';
import { Link } from 'react-router-dom';
import LogoSvg from '../assets/logo.svg?react';

export default function Logo({ 
  className = '', 
  svgClassName = '',
  textClassName = '',
  linkTo = '/', 
  showText = true,
  size = 'default'
}) {
  // Size classes for the SVG
  const sizeClasses = {
    small: 'h-6 w-auto',
    default: 'h-8 w-auto',
    large: 'h-12 w-auto',
    xlarge: 'h-16 w-auto'
  };

  // Logo component content
  const LogoContent = () => (
    <div className={`flex items-center ${className}`}>
      {/* SVG Logo */}
      <LogoSvg 
        className={`${sizeClasses[size]} text-current ${svgClassName}`}
        aria-label="Darjeeling Soul Logo"
      />
      
      {/* Brand text */}
      {showText && (
        <div className={`ml-3 ${textClassName}`}>
          <div className="font-display text-current font-bold leading-tight">
            <span className="block text-lg">Darjeeling</span>
            <span className="block text-sm opacity-80 -mt-1">Soul</span>
          </div>
        </div>
      )}
    </div>
  );

  // Wrap with link if linkTo is provided
  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className="inline-block hover:opacity-90 transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-current focus:ring-opacity-50 rounded-lg p-1"
        aria-label="Darjeeling Soul - Go to homepage"
      >
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}