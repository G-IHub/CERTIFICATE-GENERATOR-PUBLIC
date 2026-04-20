import React, { useState, useCallback } from "react";
import { Palette, RefreshCw, Check } from "lucide-react";
import { THEME_PRESETS, type ThemeColors } from "../types/theme";
import CertificateRenderer from "./CertificateRenderer";

interface CertificateThemePickerProps {
  value: ThemeColors | undefined;
  onChange: (colors: ThemeColors | undefined) => void;
  /** Pass real cert data for a meaningful preview */
  previewProps?: {
    templateId: string;
    header?: string;
    courseTitle?: string;
    description?: string;
    date?: string;
    recipientName?: string;
    organizationName?: string;
    organizationLogo?: string;
    signatoryName1?: string;
    signatoryTitle1?: string;
  };
  disabled?: boolean;
}

const COLOR_LABELS = [
  { key: "primary" as const, label: "Primary / Accent", hint: "Main decoration color" },
  { key: "secondary" as const, label: "Secondary", hint: "Second accent (optional)" },
  { key: "text" as const, label: "Text & Lines", hint: "Body text, signature lines" },
  { key: "background" as const, label: "Background", hint: "Certificate background" },
];

export default function CertificateThemePicker({
  value,
  onChange,
  previewProps,
  disabled = false,
}: CertificateThemePickerProps) {
  const [showPreview, setShowPreview] = useState(true);

  // Current working colors — merge saved value with safe defaults
  const current: ThemeColors = {
    primary: value?.primary ?? "#6B21A8",
    secondary: value?.secondary ?? "",
    text: value?.text ?? "#111827",
    background: value?.background ?? "#ffffff",
  };

  const handlePresetClick = useCallback(
    (preset: (typeof THEME_PRESETS)[number]) => {
      if (preset.colors.primary === "__default__") {
        onChange(undefined); // reset to template default
      } else {
        onChange(preset.colors);
      }
    },
    [onChange],
  );

  const handleColorChange = useCallback(
    (key: keyof ThemeColors, hex: string) => {
      onChange({ ...current, [key]: hex });
    },
    [current, onChange],
  );

  const isDefaultPreset =
    !value || value.primary === "__default__" || value.primary === undefined;

  const activePresetName = isDefaultPreset
    ? "Template Default"
    : THEME_PRESETS.find(
        (p) =>
          p.colors.primary === value?.primary &&
          p.colors.secondary === value?.secondary,
      )?.name ?? "Custom";

  // Default preview props for the mini preview
  const preview = {
    templateId: previewProps?.templateId ?? "1",
    header: previewProps?.header ?? "Certificate of Completion",
    courseTitle: previewProps?.courseTitle ?? "Sample Programme",
    description: previewProps?.description ?? "This certificate is presented to:",
    date: previewProps?.date ?? new Date().toISOString().split("T")[0],
    recipientName: previewProps?.recipientName ?? "Jane Doe",
    organizationName: previewProps?.organizationName ?? "Your Organization",
    organizationLogo: previewProps?.organizationLogo,
    signatoryName1: previewProps?.signatoryName1 ?? "Director",
    signatoryTitle1: previewProps?.signatoryTitle1 ?? "Programme Director",
  };

  return (
    <div className="border rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <Palette className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="font-semibold text-sm">Colour Theme</p>
            <p className="text-xs text-muted-foreground">
              Active: <span className="font-medium">{activePresetName}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isDefaultPreset && (
            <button
              onClick={() => onChange(undefined)}
              disabled={disabled}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          )}
          <button
            onClick={() => setShowPreview((v) => !v)}
            disabled={disabled}
            className="text-xs bg-orange-50 text-orange-600 hover:bg-orange-100 px-2 py-1 rounded font-medium"
          >
            {showPreview ? "Hide preview" : "Live preview"}
          </button>
        </div>
      </div>

      {/* Preset swatches */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
          Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {THEME_PRESETS.map((preset) => {
            const isActive = preset.name === activePresetName;
            const isDefault = preset.colors.primary === "__default__";
            return (
              <button
                key={preset.name}
                onClick={() => handlePresetClick(preset)}
                disabled={disabled}
                title={preset.name}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isActive
                    ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                {isDefault ? (
                  <span className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 inline-block" />
                ) : (
                  <span
                    className="w-3 h-3 rounded-full inline-block border border-white shadow-sm"
                    style={{ background: preset.colors.primary }}
                  />
                )}
                {preset.name}
                {isActive && <Check className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom color pickers */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
          Custom colours
        </p>
        <div className="grid grid-cols-2 gap-3">
          {COLOR_LABELS.map(({ key, label, hint }) => (
            <div key={key} className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="color"
                  value={
                    key === "secondary"
                      ? current.secondary || current.primary
                      : (current[key] as string) || "#ffffff"
                  }
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  disabled={disabled}
                  className="w-9 h-9 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                  title={label}
                />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-800">{label}</p>
                <p className="text-[10px] text-gray-400">{hint}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-orange-700 bg-orange-50 rounded p-2 mt-2">
          Tip: Changes apply instantly in the live preview below.
        </p>
      </div>

      {/* Live preview */}
      {showPreview && (
        <div className="border-t pt-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Live preview
          </p>
          <div
            className="rounded-xl overflow-hidden shadow-md border"
            style={{
              // Scale down to fit the modal (cert is 800×600 px)
              width: "100%",
              paddingBottom: "75%", // 600/800 = 75%
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                transformOrigin: "top left",
                // We set width=800 on the renderer; scale it to fill the container
                // The container has padding-bottom so its height = 0.75 * width
                // transform is applied via wrapping div
                overflow: "hidden",
              }}
            >
              {/* Scale the 800px cert down to the container's actual width */}
              <div
                style={{
                  transform: "scale(var(--cert-scale))",
                  transformOrigin: "top left",
                  width: "800px",
                }}
                ref={(el) => {
                  if (!el) return;
                  const parent = el.parentElement;
                  if (!parent) return;
                  const scale = parent.clientWidth / 800;
                  el.style.setProperty("--cert-scale", String(scale));
                  el.style.transform = `scale(${scale})`;
                }}
              >
                <CertificateRenderer
                  templateId={preview.templateId}
                  header={preview.header}
                  courseTitle={preview.courseTitle}
                  description={preview.description}
                  date={preview.date}
                  recipientName={preview.recipientName}
                  organizationName={preview.organizationName}
                  organizationLogo={preview.organizationLogo}
                  signatoryName1={preview.signatoryName1}
                  signatoryTitle1={preview.signatoryTitle1}
                  isPreview={true}
                  mode="student"
                  themeColors={current}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
