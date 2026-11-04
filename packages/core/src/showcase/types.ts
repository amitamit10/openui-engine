export interface ShowcaseDef {
  id: string; kind: "hero" | "showcase"; name: string; fits: string[]; summary: string;
  defaults: Record<string, any>;
  render: (fields: Record<string, any>) => string;
  css: string;
}
export interface Palette { accent?: string; bg?: string; ink?: string; muted?: string; surface?: string; line?: string; display?: string; body?: string; mono?: string }
