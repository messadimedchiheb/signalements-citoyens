import { Component, AfterViewInit, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import * as L from 'leaflet';
import { SignalementService, Signalement } from './signalement.service';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
  private service = inject(SignalementService);
  private fb = inject(FormBuilder);

  carteRef = viewChild.required<ElementRef<HTMLDivElement>>('carte');
  private carte!: L.Map;
  private coucheSignalements = L.layerGroup();
  private marqueurSelection?: L.CircleMarker;

  signalements = signal<Signalement[]>([]);
  erreurs = signal<string[]>([]);
  categories = ['NID_DE_POULE', 'LAMPADAIRE', 'GRAFFITI', 'DECHETS'];

  private couleurs: Record<string, string> = {
    NID_DE_POULE: '#e67e22',
    LAMPADAIRE: '#f1c40f',
    GRAFFITI: '#8e44ad',
    DECHETS: '#27ae60',
  };

  formulaire = this.fb.nonNullable.group({
    categorie: ['NID_DE_POULE', Validators.required],
    description: ['', [Validators.required, Validators.minLength(5)]],
    latitude: [45.5017, Validators.required],
    longitude: [-73.5673, Validators.required],
  });

  ngAfterViewInit(): void {
    // La carte a besoin que le <div> existe dans la page : d'où AfterViewInit
    this.carte = L.map(this.carteRef().nativeElement).setView([45.5017, -73.5673], 12);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.carte);

    this.coucheSignalements.addTo(this.carte);
    this.carte.on('click', (e: L.LeafletMouseEvent) => this.choisirPosition(e.latlng));

    this.charger();
  }

  charger(): void {
    this.service.lister().subscribe((donnees) => {
      this.signalements.set(donnees);
      this.afficherMarqueurs();
    });
  }

  private afficherMarqueurs(): void {
    this.coucheSignalements.clearLayers();

    for (const s of this.signalements()) {
      // Construction sécurisée du contenu (protection XSS)
      const contenu = document.createElement('div');
      const titre = document.createElement('strong');
      titre.textContent = `#${s.id} ${s.categorie}`;
      contenu.append(titre, document.createElement('br'), s.description);

      L.circleMarker([s.latitude, s.longitude], {
        radius: 8,
        color: this.couleurs[s.categorie] ?? '#333',
        fillOpacity: 0.8,
      })
        .bindPopup(contenu)
        .addTo(this.coucheSignalements);
    }
  }

  private choisirPosition(position: L.LatLng): void {
    const latitude = Number(position.lat.toFixed(5));
    const longitude = Number(position.lng.toFixed(5));
    this.formulaire.patchValue({ latitude, longitude });

    if (this.marqueurSelection) {
      this.marqueurSelection.setLatLng(position);
    } else {
      this.marqueurSelection = L.circleMarker(position, {
        radius: 10,
        color: '#0b5394',
        dashArray: '4',
      }).addTo(this.carte);
    }
  }

  soumettre(): void {
    if (this.formulaire.invalid) return;

    this.service.creer(this.formulaire.getRawValue()).subscribe({
      next: () => {
        this.erreurs.set([]);
        this.formulaire.controls.description.reset();
        this.charger();
      },
      error: (err) => this.erreurs.set(err.error?.erreurs ?? ['Erreur serveur']),
    });
  }
}