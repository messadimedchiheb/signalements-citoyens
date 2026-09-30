import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SignalementService, Signalement } from './signalement.service';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private service = inject(SignalementService);
  private fb = inject(FormBuilder);

  signalements = signal<Signalement[]>([]);
  erreurs = signal<string[]>([]);
  categories = ['NID_DE_POULE', 'LAMPADAIRE', 'GRAFFITI', 'DECHETS'];

  formulaire = this.fb.nonNullable.group({
    categorie: ['NID_DE_POULE', Validators.required],
    description: ['', [Validators.required, Validators.minLength(5)]],
    latitude: [45.5017, Validators.required],
    longitude: [-73.5673, Validators.required],
  });

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.service.lister().subscribe((donnees) => this.signalements.set(donnees));
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