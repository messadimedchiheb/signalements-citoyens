import express, { Request, Response, NextFunction } from 'express';
import { initDb } from './db';
import { listerSignalements, creerSignalement } from './signalements.repository';
import { initMessaging, publierEvenement } from './messaging';
import cors from 'cors';
import { validerSignalement } from './validation';

const app = express();
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());



app.get('/signalements', async (_req: Request, res: Response) => {
  const signalements = await listerSignalements();
  res.json(signalements);
});

app.post('/signalements', async (req: Request, res: Response) => {
  const { categorie, description, latitude, longitude } = req.body ?? {};

    const erreurs = validerSignalement(req.body ?? {});

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