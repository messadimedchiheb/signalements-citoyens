import express, { Request, Response, NextFunction } from 'express';
import { initDb } from './db';
import { listerSignalements, creerSignalement } from './signalements.repository';
import { initMessaging, publierEvenement } from './messaging';

const app = express();
app.use(express.json());

const CATEGORIES = ['NID_DE_POULE', 'LAMPADAIRE', 'GRAFFITI', 'DECHETS'];

app.get('/signalements', async (_req: Request, res: Response) => {
  const signalements = await listerSignalements();
  res.json(signalements);
});

app.post('/signalements', async (req: Request, res: Response) => {
  const { categorie, description, latitude, longitude } = req.body ?? {};

  const erreurs: string[] = [];
  if (!CATEGORIES.includes(categorie)) erreurs.push('categorie invalide');
  if (typeof description !== 'string' || description.trim().length < 5)
    erreurs.push('description trop courte (5 caracteres minimum)');
  if (typeof latitude !== 'number' || latitude < -90 || latitude > 90)
    erreurs.push('latitude invalide');
  if (typeof longitude !== 'number' || longitude < -180 || longitude > 180)
    erreurs.push('longitude invalide');

  if (erreurs.length > 0) {
    res.status(400).json({ erreurs });
    return;
  }

  const signalement = await creerSignalement({ categorie, description, latitude, longitude });
    publierEvenement('signalement.cree', { type: 'signalement.cree', signalement });
  res.status(201).json(signalement);
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

async function demarrer(): Promise<void> {
  await initDb();
  await initMessaging();
  app.listen(3000, () => console.log('API demarree sur http://localhost:3000'));
}

demarrer();