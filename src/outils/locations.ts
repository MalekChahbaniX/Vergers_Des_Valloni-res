// Configuration du plan de stockage.
// TODO: remplacer par le vrai plan de chaque chambre froide (nombre d'allées,
// positions par allée) si celui-ci diffère entre CF1 / CF2 / CF3…
// Idéalement cette info viendrait d'un futur endpoint /stock/coldRoomLayout.

export const MAX_PALOX_PER_LOCATION = 8;

const ROWS = ['A', 'B', 'C', 'D'];
const COLS = [1, 2, 3, 4, 5, 6];

const DEFAULT_GRID: string[] = ROWS.flatMap((row) => COLS.map((col) => `${row}${col}`));

/**
 * Renvoie la liste des codes d'emplacement pour une chambre froide donnée.
 * Utilise la même grille par défaut pour toutes les CF — personnalisez ici
 * si une chambre froide a un plan différent (ex: switch sur coldRoomId).
 */
export const getLocationsForRoom = (_coldRoomId: string): string[] => DEFAULT_GRID;

export type LocationStatus = {
  label: 'Disponible' | 'Presque plein' | 'Occupé';
  key: 'available' | 'almost_full' | 'full';
};

export const getLocationStatus = (occupiedCount: number): LocationStatus => {
  if (occupiedCount >= MAX_PALOX_PER_LOCATION) {
    return { label: 'Occupé', key: 'full' };
  }
  if (occupiedCount >= MAX_PALOX_PER_LOCATION - 2) {
    return { label: 'Presque plein', key: 'almost_full' };
  }
  return { label: 'Disponible', key: 'available' };
};