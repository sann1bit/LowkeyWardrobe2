import React from 'react';

interface FigureSVGProps {
  figType: string;
  ca: string;
  cb: string;
  className?: string;
  style?: React.CSSProperties;
}

export function FigureSVG({ figType, ca, cb, className, style }: FigureSVGProps) {
  let content = null;

  switch (figType) {
    case 'coat':
      content = (
        <>
          <path d="M100 230 Q90 270 88 340 L90 400 H210 L212 340 Q210 270 200 230 L175 210 L150 220 L125 210Z" fill={cb} opacity="0.9"/>
          <ellipse cx="150" cy="170" rx="35" ry="40" fill={ca}/>
          <rect x="135" y="200" width="30" height="25" rx="15" fill={ca}/>
        </>
      );
      break;
    case 'sneaker':
      content = (
        <>
          <ellipse cx="150" cy="280" rx="90" ry="40" fill={cb} opacity="0.15"/>
          <path d="M70 270 Q80 200 150 190 Q210 185 240 230 L245 265 Q240 280 220 285 L80 285 Q65 278 70 270Z" fill={cb}/>
          <rect x="200" y="215" width="45" height="70" rx="8" fill={ca}/>
        </>
      );
      break;
    case 'hoodie':
      content = (
        <>
          <path d="M95 230 Q85 265 83 330 L85 395 H215 L217 330 Q215 265 205 230 L175 215 L150 224 L125 215Z" fill={cb} opacity="0.95"/>
          <path d="M125 215 Q150 240 175 215 L165 200 L150 205 L135 200Z" fill={ca} opacity="0.3"/>
          <ellipse cx="150" cy="175" rx="33" ry="38" fill={ca}/>
        </>
      );
      break;
    case 'wallet':
      content = (
        <>
          <rect x="80" y="160" width="140" height="100" rx="6" fill={cb}/>
          <rect x="80" y="185" width="140" height="3" fill={ca} opacity="0.3"/>
          <rect x="190" y="195" width="30" height="25" rx="3" fill={ca} opacity="0.5"/>
        </>
      );
      break;
    case 'pants':
      content = (
        <>
          <rect x="110" y="200" width="55" height="190" rx="4" fill={cb} opacity="0.95"/>
          <rect x="135" y="200" width="30" height="190" rx="4" fill={cb} opacity="0.8"/>
          <rect x="165" y="200" width="55" height="190" rx="4" fill={cb} opacity="0.95"/>
        </>
      );
      break;
    case 'boot':
      content = (
        <>
          <path d="M100 320 Q95 240 140 220 L170 215 Q200 240 200 280 L205 340 Q240 360 245 375 L245 390 H95 L95 375 Q95 340 100 320Z" fill={cb}/>
        </>
      );
      break;
    case 'watch':
      content = (
        <>
          <circle cx="150" cy="200" r="70" stroke={cb} strokeWidth="14" fill="none"/>
          <circle cx="150" cy="200" r="55" fill={ca} opacity="0.2"/>
          <rect x="135" y="130" width="30" height="25" rx="4" fill={cb}/>
          <rect x="135" y="245" width="30" height="25" rx="4" fill={cb}/>
          <line x1="150" y1="145" x2="150" y2="190" stroke={cb} strokeWidth="2.5"/>
          <line x1="150" y1="190" x2="180" y2="175" stroke={cb} strokeWidth="2"/>
        </>
      );
      break;
    case 'shirt':
      content = (
        <>
          <path d="M100 225 Q90 260 88 330 L90 390 H210 L212 330 Q210 260 200 225 L175 208 L150 218 L125 208Z" fill={cb} opacity="0.9"/>
          <path d="M125 208 L138 215 L150 240 L162 215 L175 208" fill="none" stroke={ca} strokeWidth="1.5" opacity="0.5"/>
          <ellipse cx="150" cy="172" rx="32" ry="37" fill={ca}/>
        </>
      );
      break;
    case 'bag':
      content = (
        <>
          <rect x="80" y="185" width="140" height="130" rx="6" fill={cb}/>
          <path d="M115 185 Q115 155 150 150 Q185 155 185 185" stroke={ca} strokeWidth="10" fill="none" strokeLinecap="round"/>
          <line x1="80" y1="225" x2="220" y2="225" stroke={ca} strokeWidth="1.5" opacity="0.5"/>
          <rect x="130" y="238" width="40" height="26" rx="4" fill={ca} opacity="0.4"/>
        </>
      );
      break;
    case 'loafer':
      content = (
        <>
          <path d="M65 270 Q75 205 150 196 Q215 190 245 235 L248 265 Q242 282 220 285 L75 285 Q60 278 65 270Z" fill={cb}/>
          <ellipse cx="155" cy="265" rx="30" ry="10" fill={ca} opacity="0.15"/>
        </>
      );
      break;
    case 'tshirt':
      content = (
        <>
          <path d="M100 220 Q90 255 88 320 L90 385 H210 L212 320 Q210 255 200 220 L175 205 Q155 215 150 218 Q145 215 125 205Z" fill={cb} opacity="0.9"/>
          <path d="M100 220 Q85 215 72 230 L78 255 Q90 248 100 240Z" fill={cb} opacity="0.85"/>
          <path d="M200 220 Q215 215 228 230 L222 255 Q210 248 200 240Z" fill={cb} opacity="0.85"/>
          <ellipse cx="150" cy="170" rx="32" ry="37" fill={ca}/>
        </>
      );
      break;
    case 'sunglasses':
      content = (
        <>
          <ellipse cx="150" cy="190" rx="100" ry="70" fill={ca} opacity="0.08"/>
          <ellipse cx="115" cy="195" rx="40" ry="28" fill={cb} opacity="0.85"/>
          <ellipse cx="185" cy="195" rx="40" ry="28" fill={cb} opacity="0.85"/>
          <line x1="155" y1="195" x2="175" y2="195" stroke={cb} strokeWidth="3"/>
          <line x1="75" y1="195" x2="55" y2="185" stroke={cb} strokeWidth="3"/>
          <line x1="225" y1="195" x2="245" y2="185" stroke={cb} strokeWidth="3"/>
        </>
      );
      break;
    default:
      content = null;
  }

  return (
    <svg viewBox="0 0 300 400" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(0,10)">
        {content}
      </g>
    </svg>
  );
}