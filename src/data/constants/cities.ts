export const CITIES = ["Addis Ababa", "Dire Dawa", "Bahir Dar", "Hawassa", "Mekelle", "Adama", "Gondar", "Dessie", "Jimma", "Harar"];
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "Addis Ababa": { lat: 9.03, lng: 38.74 }, "Dire Dawa": { lat: 9.6, lng: 41.85 }, "Bahir Dar": { lat: 11.59, lng: 37.39 }, Hawassa: { lat: 7.06, lng: 38.48 }, Mekelle: { lat: 13.5, lng: 39.47 },
  Adama: { lat: 8.54, lng: 39.27 }, Gondar: { lat: 12.6, lng: 37.47 }, Dessie: { lat: 11.13, lng: 39.63 }, Jimma: { lat: 7.67, lng: 36.83 }, Harar: { lat: 9.31, lng: 42.12 },
};
export const coordsOf = (name: string) => Object.entries(CITY_COORDS).find(([k]) => k.toLowerCase() === name.trim().toLowerCase())?.[1];
