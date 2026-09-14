# Modèle 3D de l'athlète

Dépose ici ton scan corporel réel au format **glTF binaire** sous le nom :

```
public/models/athlete.glb
```

Ce fichier n'est pas versionné dans Git (voir `.gitignore`) : il est privé et
doit être copié manuellement sur chaque environnement (local + hébergement).

Tant qu'aucun fichier `athlete.glb` n'est présent, le site affiche
automatiquement un **avatar de secours procédural** (silhouette basse-poly)
qui porte déjà toutes les zones de sponsoring, pour que le site reste
utilisable et démontrable sans le scan final.

## Recalage des zones après ajout du vrai scan

Les positions des logos/pins sont définies dans `src/lib/zones.config.ts`
(propriété `anchors`), en coordonnées locales (mètres) autour de l'origine,
pour un avatar centré et mis à l'échelle automatiquement sur une hauteur de
1.8 unité.

Pour recalibrer rapidement une fois `athlete.glb` en place :

1. Lance le site avec `?calibrate=1` dans l'URL (ex. `http://localhost:3000/?calibrate=1`).
2. Clique n'importe où sur le modèle 3D : les coordonnées locales du point
   cliqué s'affichent à l'écran (et dans la console).
3. Reporte ces valeurs dans `zones.config.ts` pour la zone concernée
   (`position`) et ajuste `normal` pour orienter le logo (ex. `[0, 0, 1]`
   pour une zone qui fait face à la caméra de face).
