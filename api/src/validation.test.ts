import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validerSignalement } from './validation';

const valide = {
  categorie: 'GRAFFITI',
  description: 'Graffiti sur un mur',
  latitude: 45.5,
  longitude: -73.5,
};

test('accepte un signalement valide', () => {
  assert.deepEqual(validerSignalement(valide), []);
});

test('rejette une categorie inconnue', () => {
  const erreurs = validerSignalement({ ...valide, categorie: 'OVNI' });
  assert.ok(erreurs.includes('categorie invalide'));
});

test('rejette une latitude hors limites', () => {
  const erreurs = validerSignalement({ ...valide, latitude: 200 });
  assert.ok(erreurs.includes('latitude invalide'));
});

test('retourne toutes les erreurs en une seule fois', () => {
  assert.equal(validerSignalement({}).length, 4);
});