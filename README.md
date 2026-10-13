# Projet V8

Application d’entraînement bloc sur 16 semaines (V4 → V7, puis V8) : séances guidées avec minuteurs,
carnet de projets et pyramide, bibliothèque d’exercices illustrés, nutrition, suivi des charges et des tests.

- React 18 + TypeScript + Vite, aucune dépendance UI.
- Hors ligne (service worker), installable sur l’écran d’accueil (manifest PWA).
- Données locales, synchro optionnelle via ton propre projet Supabase (une ligne JSON par compte, sécurité par ligne).
- Fusion enregistrement par enregistrement : une séance notée sur le téléphone et une autre sur le Mac ne s’écrasent jamais.
- Les données de la v1 sont reprises automatiquement au premier lancement.

## Structure

```
index.html, assets/, sw.js…   site prêt à servir (GitHub Pages, racine du dépôt)
source/
  src/data/        programme, exercices, nutrition (tout le contenu est ici)
  src/lib/         stockage et fusion, synchro Supabase, dates, sons et minuteurs
  src/components/  UI partagée, illustrations SVG, cartes de séance
  src/screens/     Aujourd’hui, Plan, Projets, Bibliothèque, Nutrition, Suivi, Séance guidée, Réglages
```

## Développer

```
cd source
npm install
npm run dev      # serveur local
npm run build    # génère dist/, à copier à la racine du dépôt
```

## Synchro Supabase

Le guide pas à pas et le script SQL sont dans l’app : Réglages (roue dentée) → Synchro.
