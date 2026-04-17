/**
 * Certificate colour theme — org-level defaults or per-cert overrides.
 * Each field is optional; templates fall back to their own hardcoded defaults
 * when a value is not supplied.
 */
export interface ThemeColors {
  /** Main accent / decoration color (borders, shapes, header bars) */
  primary: string;
  /** Secondary decoration color — if omitted, templates use a shade of primary */
  secondary?: string;
  /** Body / signature-line text color */
  text?: string;
  /** Certificate background color */
  background?: string;
}

/** Built-in preset palettes shown in the theme picker */
export const THEME_PRESETS: { name: string; colors: ThemeColors }[] = [
  {
    name: "Template Default",
    colors: { primary: "__default__", text: "__default__", background: "__default__" },
  },
  {
    name: "Royal Purple",
    colors: { primary: "#6B21A8", secondary: "#7E22CE", text: "#1e1b4b", background: "#faf5ff" },
  },
  {
    name: "Ocean Blue",
    colors: { primary: "#1D4ED8", secondary: "#1E40AF", text: "#1e3a5f", background: "#eff6ff" },
  },
  {
    name: "Forest Green",
    colors: { primary: "#15803D", secondary: "#166534", text: "#14532d", background: "#f0fdf4" },
  },
  {
    name: "Crimson",
    colors: { primary: "#B91C1C", secondary: "#991B1B", text: "#450a0a", background: "#fff1f2" },
  },
  {
    name: "Midnight",
    colors: { primary: "#1F2937", secondary: "#111827", text: "#111827", background: "#f9fafb" },
  },
  {
    name: "Golden",
    colors: { primary: "#B45309", secondary: "#92400E", text: "#451a03", background: "#fffbeb" },
  },
  {
    name: "Rose Gold",
    colors: { primary: "#BE185D", secondary: "#9D174D", text: "#500724", background: "#fff1f2" },
  },
  {
    name: "Teal",
    colors: { primary: "#0F766E", secondary: "#115E59", text: "#042f2e", background: "#f0fdfa" },
  },
];
