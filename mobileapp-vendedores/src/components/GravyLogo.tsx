import React from 'react';

interface GravyLogoProps {
  className?: string;
  size?: number;
}

export const GravyLogo: React.FC<GravyLogoProps> = ({ className = "w-8 h-8", size }) => {
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <defs>
        {/* Main 'G' Gradient: Purple/Periwinkle to Cyan/Turquoise */}
        <linearGradient id="gravyGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6B52ED" />
          <stop offset="35%" stopColor="#5577ED" />
          <stop offset="70%" stopColor="#1DCBEF" />
          <stop offset="100%" stopColor="#00D5FF" />
        </linearGradient>

        {/* Outer Ribbon Loop Gradient */}
        <linearGradient id="gravyOuterGrad" x1="0%" y1="0%" x2="100%" y2="80%">
          <stop offset="0%" stopColor="#7055F5" />
          <stop offset="45%" stopColor="#567AEE" />
          <stop offset="85%" stopColor="#1EC4EB" />
          <stop offset="100%" stopColor="#00DCFF" />
        </linearGradient>

        {/* Inner Hook Ribbon Gradient */}
        <linearGradient id="gravyInnerGrad" x1="100%" y1="30%" x2="20%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#12C3EE" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>

        <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Stylized 'G' Vector Artwork */}
      <g filter="url(#subtleShadow)">
        {/* Outer Curved Body of 'G' */}
        <path
          d="M 380 135
             C 330 65, 230 65, 160 120
             C 75 190, 70 315, 145 385
             C 215 450, 335 445, 395 380
             C 415 358, 430 330, 435 295
             L 435 345
             C 435 385, 400 420, 360 420
             L 340 420
             C 255 420, 180 370, 145 295
             C 115 220, 150 130, 225 90
             C 285 58, 360 70, 405 115
             C 418 128, 412 150, 395 150
             L 380 135 Z"
          fill="url(#gravyOuterGrad)"
        />

        {/* Core Vibrant Ribbon 'G' Emblem */}
        <path
          d="M 375 130
             C 280 40, 120 90, 85 220
             C 50 350, 180 450, 305 430
             C 385 418, 440 350, 435 270
             L 435 330
             C 435 380, 395 415, 345 415
             C 230 415, 130 330, 130 215
             C 130 115, 225 55, 330 70
             C 365 75, 390 95, 390 120
             C 390 135, 375 145, 360 140
             C 280 115, 185 160, 175 240
             C 165 320, 235 375, 310 365
             C 355 360, 385 320, 385 275
             L 240 275
             C 220 275, 210 255, 220 240
             C 230 225, 245 225, 260 225
             L 410 225
             C 430 225, 440 240, 440 260
             L 440 330
             C 440 390, 390 440, 330 440
             C 190 440, 60 330, 60 190
             C 60 75, 180 -10, 315 10
             C 375 20, 420 50, 445 95
             C 455 115, 435 135, 415 130
             C 400 125, 390 115, 375 130 Z"
          fill="url(#gravyGlowGrad)"
        />

        {/* Inner Blue Ribbon Accent Hook */}
        <path
          d="M 230 225
             L 400 225
             C 420 225, 435 240, 435 260
             L 435 340
             C 435 385, 395 420, 350 420
             C 260 420, 175 350, 175 250
             C 175 170, 245 110, 330 110
             C 360 110, 385 125, 385 140
             C 385 155, 365 165, 345 160
             C 280 150, 220 195, 215 260
             C 210 320, 260 370, 320 370
             C 360 370, 385 340, 385 300
             L 250 300
             C 235 300, 225 285, 230 270
             C 235 255, 245 255, 260 255
             L 385 255
             L 385 225
             Z"
          fill="url(#gravyInnerGrad)"
          opacity="0.9"
        />
      </g>
    </svg>
  );
};
