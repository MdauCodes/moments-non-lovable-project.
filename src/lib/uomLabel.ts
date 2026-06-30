/**
 * Strip redundant quantity suffix from a UOM/collection name.
 * "Packet of 50" + qty 50 → "Packet"
 * "Carton of 2500" + qty 2500 → "Carton"
 * "Packet" + qty 50 → "Packet" (unchanged)
 * "Pack of 12" + qty 50 → "Pack of 12" (quantity mismatch, leave as-is)
 */
export function cleanUomLabel(name: string | null | undefined, quantity: number | null | undefined): string {
  const raw = (name ?? "").trim();
  if (!raw) return "";
  const qty = Number(quantity) || 0;
  if (!qty) return raw;
  // Match trailing " of <number>" where number == qty (allow commas/spaces)
  const m = raw.match(/^(.*?)[\s]+of[\s]+([\d,\s]+)$/i);
  if (!m) return raw;
  const trailingNum = Number(m[2].replace(/[,\s]/g, ""));
  if (trailingNum === qty) return m[1].trim();
  return raw;
}
