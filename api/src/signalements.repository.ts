import { pool } from './db';

export interface Signalement {
  id: number;
  categorie: string;
  description: string;
  latitude: number;
  longitude: number;
  statut: string;
  cree_le: Date;
}

export interface NouveauSignalement {
  categorie: string;
  description: string;
  latitude: number;
  longitude: number;
}

export async function listerSignalements(): Promise<Signalement[]> {
  const resultat = await pool.query('SELECT * FROM signalements ORDER BY cree_le DESC');
  return resultat.rows;
}

export async function creerSignalement(data: NouveauSignalement): Promise<Signalement> {
  const resultat = await pool.query(
    `INSERT INTO signalements (categorie, description, latitude, longitude)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.categorie, data.description, data.latitude, data.longitude]
  );
  return resultat.rows[0];
}