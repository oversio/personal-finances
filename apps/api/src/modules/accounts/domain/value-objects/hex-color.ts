import { z } from "zod";

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

const schema = z
  .string()
  .regex(HEX_COLOR_REGEX, { error: "Invalid hex color format. Use #RRGGBB" });

export class HexColor {
  readonly value: string;

  constructor(value: string) {
    // Normalize to uppercase
    this.value = schema.parse(value).toUpperCase();
  }

  static default(): HexColor {
    return new HexColor("#6366F1"); // Indigo
  }
}
