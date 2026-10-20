# Portfolio Romana Azizi

Reconstruction en HTML / CSS / JavaScript du site Wix https://romanajazz.wixsite.com/portfolio.

## Lancer le site

```bash
python3 server.py
```

Puis ouvrir http://localhost:8000

## Structure

```
index.html          Accueil : présentation, projets empilés au défilement, compétences
projet.html         Détail d'un projet (projet.html?p=<slug>)
qui-suis-je.html    À propos : profil, parcours, compétences, outils
css/style.css       Styles (thème sombre, accent violet)
js/main.js          Chargement des données via fetch, rendu des pages, formulaire
data/portfolio.json Contenu : projets, médias, outils
server.py           Back-end Python (API + fichiers statiques)
assets/images       Images (redimensionnées à 1920 px max)
assets/videos       Vidéos MP4 (Wix + workshop Processing, compressées)
assets/cv-romana-azizi.pdf  CV téléchargeable
```

## Ajouter ou modifier un projet

Tout se fait dans `data/portfolio.json`, sans toucher au HTML. L'ordre du fichier est
l'ordre d'affichage.

| Champ | Rôle |
|---|---|
| `slug` | identifiant dans l'URL (`projet.html?p=<slug>`) |
| `title`, `subtitle` | titre et sous-titre |
| `category` | `code`, `3d`, `animation`, `video` ou `illustration` (filtres) |
| `year`, `context`, `team`, `role` | fiche projet (facultatifs) |
| `tech` | liste de technologies (badges) |
| `summary` | phrase courte affichée sur la carte |
| `description`, `highlights` | paragraphes et points clés |
| `cover` | `image`, `video` (aperçu au survol) ou `placeholder` (sans visuel) |
| `media` | images / vidéos du carrousel, avec `caption` facultatif |
| `links` | boutons (`type: "github"` ou `"live"`) |

## Back-end

- `GET /api/portfolio` : toutes les données
- `GET /api/projects/<slug>` : un projet

Le site fonctionne aussi sans back-end (GitHub Pages, Netlify…) : le JS lit alors
`data/portfolio.json` directement.
