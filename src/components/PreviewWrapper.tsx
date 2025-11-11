import React from "react";

interface PreviewWrapperProps {
  children: React.ReactNode;
  scale?: number;
  origin?: string;
  wrapperSize?: number;
}

export default function PreviewWrapper({
  children,
  scale = 1,
  origin = "top left",
  wrapperSize = 1,
}: PreviewWrapperProps) {
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: origin,
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
      }}
    >
      {children}
    </div>
  );
}
