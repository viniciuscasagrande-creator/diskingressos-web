import React from 'react';

interface DiskIngressosLogoProps {
  className?: string;
  height?: number | string;
  iconOnly?: boolean;
}

export const DiskIngressosLogo: React.FC<DiskIngressosLogoProps> = ({
  className = '',
  height = 36,
  iconOnly = false,
}) => {
  const numericHeight = typeof height === 'number' ? height : parseInt(String(height), 10) || 36;

  if (iconOnly) {
    return (
      <svg
        viewBox="0 0 54 46"
        height={numericHeight}
        width={numericHeight * (54 / 46)}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`select-none shrink-0 ${className}`}
      >
        <text
          x="2"
          y="37"
          fill="#FFFFFF"
          fontFamily="'Montserrat', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="40"
          letterSpacing="-1px"
        >
          D
        </text>
        <text
          x="30"
          y="37"
          fill="#FFFFFF"
          fontFamily="'Montserrat', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="40"
        >
          ı
        </text>
        <circle cx="35.5" cy="11.5" r="5.2" fill="#FF5500" />
      </svg>
    );
  }

  return (
    <div className={`inline-flex items-center select-none shrink-0 ${className}`}>
      {/* High-Definition 100% Crisp Vector SVG Logo (infinitely sharp at all screen resolutions) */}
      <svg
        viewBox="0 0 295 50"
        height={numericHeight}
        style={{ width: 'auto', maxHeight: `${numericHeight}px` }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible select-none"
      >
        {/* Left 'Di' Symbol */}
        <g transform="translate(0, 0)">
          <text
            x="2"
            y="38"
            fill="#FFFFFF"
            fontFamily="'Montserrat', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="41"
            letterSpacing="-0.5px"
          >
            D
          </text>
          {/* Dotless 'i' stem */}
          <text
            x="32"
            y="38"
            fill="#FFFFFF"
            fontFamily="'Montserrat', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="41"
          >
            ı
          </text>
          {/* Orange dot on Di */}
          <circle cx="37.5" cy="11" r="5.2" fill="#FF5500" />
        </g>

        {/* Wordmark 'DiskIngressos' */}
        <g transform="translate(74, 0)">
          {/* 'D' */}
          <text
            x="0"
            y="37.5"
            fill="#FFFFFF"
            fontFamily="'Montserrat', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="37"
            letterSpacing="-0.5px"
          >
            D
          </text>
          {/* Dotless 'i' in Disk */}
          <text
            x="24"
            y="37.5"
            fill="#FFFFFF"
            fontFamily="'Montserrat', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="37"
          >
            ı
          </text>
          {/* Orange dot for 'i' in Disk */}
          <circle cx="28.8" cy="13" r="4.3" fill="#FF5500" />

          {/* 'sk' */}
          <text
            x="35"
            y="37.5"
            fill="#FFFFFF"
            fontFamily="'Montserrat', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="37"
            letterSpacing="-0.5px"
          >
            sk
          </text>

          {/* 'Ingressos' */}
          <text
            x="76"
            y="37.5"
            fill="#FFFFFF"
            fontFamily="'Montserrat', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="37"
            letterSpacing="-0.5px"
          >
            Ingressos
          </text>
        </g>
      </svg>
    </div>
  );
};
