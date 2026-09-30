export const CATEGORIES = ['NID_DE_POULE', 'LAMPADAIRE', 'GRAFFITI', 'DECHETS'];

export function validerSignalement(donnees: Record<string, unknown>): string[] {
  const { categorie, description, latitude, longitude } = donnees;
  const erreurs: string[] = [];

  if (typeof categorie !== 'string' || !CATEGORIES.includes(categorie))
    erreurs.push('categorie invalide');
  if (typeof description !== 'string' || description.trim().length < 5)
    erreurs.push('description trop courte (5 caracteres minimum)');
  if (typeof latitude !== 'number' || latitude < -90 || latitude > 90)
    erreurs.push('latitude invalide');
  if (typeof longitude !== 'number' || longitude < -180 || longitude > 180)
    erreurs.push('longitude invalide');

  return erreurs;
}