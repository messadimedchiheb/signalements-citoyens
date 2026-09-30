import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Signalement {
  id: number;
  categorie: string;
  description: string;
  latitude: number;
  longitude: number;
  statut: string;
  cree_le: string;
}

export type NouveauSignalement = Pick<Signalement, 'categorie' | 'description' | 'latitude' | 'longitude'>;

@Injectable({ providedIn: 'root' })
export class SignalementService {
  private http = inject(HttpClient);
  private url = 'http://localhost:3000/signalements';

  lister(): Observable<Signalement[]> {
    return this.http.get<Signalement[]>(this.url);
  }

  creer(signalement: NouveauSignalement): Observable<Signalement> {
    return this.http.post<Signalement>(this.url, signalement);
  }
}