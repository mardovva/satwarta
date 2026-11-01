const rules: [string, string][] = [
  ["gajah", "🐘"], ["orangutan", "🦧"], ["harimau", "🐅"], ["beruang", "🐻"], ["rangkong", "🦅"], ["elang", "🦅"],
  ["trenggiling", "🦔"], ["bekantan", "🐒"], ["monyet", "🐒"], ["tapir", "🐗"], ["rusa", "🦌"], ["ular", "🐍"],
  ["buaya", "🐊"], ["kura", "🐢"], ["burung", "🐦"],
];
const byType: Record<string, string> = { Mamalia: "🐾", Burung: "🐦", Reptil: "🦎", Amfibi: "🐸" };

/** Ikon sementara untuk marker. Ganti dengan foto satwa bila sudah tersedia. */
export function animalEmoji(name: string, type: string): string {
  const n = name.toLowerCase();
  for (const [key, emoji] of rules) if (n.includes(key)) return emoji;
  return byType[type] ?? "🐾";
}
