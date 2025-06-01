import translations from "./translate.json";

// Vrací překlad podle aktuálního jazyka
export function getTranslation(key: string): string {
  const lang = localStorage.getItem("language") || "cz";
  return translations[key]?.[lang] || translations[key]?.["cz"] || key;
}

// Vrací výhradně český překlad hodnot (např. 'sharp' → 'Tupá')
export function getCzechLabel(key: string, val: string): string {
  const czKey = `${key}_${val}`;
  return translations[czKey]?.["cz"] || val;
}
