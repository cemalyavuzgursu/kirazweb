"use client";

import { forwardRef } from "react";
import type { DeviceSize } from "../editor-client";

interface PreviewFrameProps {
  src: string;
  deviceSize: DeviceSize;
}

const DEVICE_WIDTHS: Record<DeviceSize, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export const PreviewFrame = forwardRef<HTMLIFrameElement, PreviewFrameProps>(
  ({ src, deviceSize }, ref) => {
    const width = DEVICE_WIDTHS[deviceSize];
    const isMobile = deviceSize === "mobile";
    const isTablet = deviceSize === "tablet";

    return (
      <div className="flex-1 flex items-start justify-center overflow-auto">
        <div
          className="relative bg-white shadow-xl overflow-hidden transition-all duration-300"
          style={{
            width,
            maxWidth: "100%",
            minHeight: "600px",
            height: "calc(100vh - 160px)",
            borderRadius: isMobile ? "24px" : isTablet ? "12px" : "8px",
            border: isMobile || isTablet ? "8px solid #2b2419" : "1px solid #e8e3dd",
          }}
        >
          {(isMobile || isTablet) && (
            <div
              className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full bg-ink-700"
              style={{ width: isMobile ? "60px" : "80px", height: "6px", zIndex: 10 }}
            />
          )}
          <iframe
            ref={ref}
            src={src}
            className="w-full h-full border-0"
            style={{ marginTop: isMobile || isTablet ? "16px" : 0 }}
            title="Site Önizleme"
          />
        </div>
      </div>
    );
  },
);

PreviewFrame.displayName = "PreviewFrame";
