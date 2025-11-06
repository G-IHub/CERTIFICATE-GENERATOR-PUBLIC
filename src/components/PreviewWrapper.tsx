import React from "react";

interface PreviewWrapperProps {
  scale?: number; // e.g., 0.4 for 40%
  origin?: "center" | "top-left" | string;
  wrapperSize?: number; // multiplier for width/height to avoid clipping; 2 => 200%
  className?: string;
  children: React.ReactNode;
}

const PreviewWrapper: React.FC<PreviewWrapperProps> = ({
  scale = 0.4,
  origin = "center",
  wrapperSize = 2,
  className = "",
  children,
}) => {
  const sizePct = `${wrapperSize * 100}%`;

  // Position the inner scaled content at the center using translate(-50%,-50%),
  // then apply scale. This centers the certificate regardless of its intrinsic width/height
  // and avoids top-left/top-right drift caused by differing child widths.
  const innerStyle: React.CSSProperties = {
    width: sizePct,
    height: sizePct,
    position: "absolute",
    top: "50%",
    left: "50%",
    // translate to center, then scale; include rotate(0deg) and translateZ(0) to avoid subpixel/3D rendering tilt
    transform: `translate(-50%, -50%) scale(${scale}) rotate(0deg) translateZ(0)`,
    transformOrigin: origin === "top-left" ? "top left" : "center",
    backfaceVisibility: "hidden",
    WebkitTransformStyle: "preserve-3d",
    transformStyle: "preserve-3d",
    willChange: "transform",
    display: "block",
  };

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div style={innerStyle}>{children}</div>
    </div>
  );
};

export default PreviewWrapper;
