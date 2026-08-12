import React from 'react';

interface DevBoxLogoProps {
  size?: number;
  className?: string;
}

export function DevBoxLogo({ size = 22, className = '' }: DevBoxLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="db-teal-grad" x1="28" y1="30" x2="100" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient id="db-amber-grad" x1="64" y1="68" x2="100" y2="106" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* Dark Squircle Background */}
      <rect width="128" height="128" rx="28" fill="#09090b" />
      <rect width="126" height="126" x="1" y="1" rx="27" stroke="#27272a" strokeWidth="2" />

      {/* Isometric Developer Cube Top Face */}
      <polygon points="64,28 97,47 64,66 31,47" fill="url(#db-teal-grad)" />

      {/* Left Face - Teal */}
      <polygon points="31,47 64,66 64,104 31,85" fill="#0f766e" />

      {/* Right Face - Golden Amber */}
      <polygon points="64,66 97,47 97,85 64,104" fill="url(#db-amber-grad)" />

      {/* Internal Geometry & Code Brackets */}
      <line x1="64" y1="28" x2="64" y2="66" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
      <line x1="31" y1="47" x2="64" y2="66" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
      <line x1="97" y1="47" x2="64" y2="66" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
      <line x1="64" y1="66" x2="64" y2="104" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.3" />

      {/* Terminal Prompt Chevrons < / > inside facets */}
      <path
        d="M 44 65 L 38 71 L 44 77"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.9"
      />
      <path
        d="M 84 65 L 90 71 L 84 77"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.9"
      />
    </svg>
  );
}
