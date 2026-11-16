# Aivelo — site vitrine

Site statique (HTML/CSS/JS, aucun build) : ouvrir `index.html` ou servir le dossier tel quel.

```
index.html            contenu et structure des sections
assets/css/main.css   design system (tokens en tête de fichier), layout, responsive
assets/js/main.js     interactions et motion design
assets/css/sections.css  styles des sections Réalisations, Démo, Témoignages et effets associés
assets/js/bg.js          fond animé jour / nuit (WebGL)
assets/js/sections.js    interactions de ces sections (curseur avant/après, démo, compteurs, lentille…)
```

## Librairies (versions figées)

- **GSAP 3.13** (ScrollTrigger, SplitText), hébergé dans `assets/js/vendor/` : plus aucun script chargé depuis un CDN, hors three.js à la demande
- Défilement natif du navigateur (Lenis a été retiré : il faisait saccader le scroll dès qu'une animation prenait du retard)

Si les CDN ne répondent pas, ou si le visiteur a activé « réduire les animations », le site reste entièrement lisible et utilisable : la classe `motion` est retirée et tout s'affiche sans animation.

## Modifier le contenu

- **Réalisations** : cartes `.work` dans `#realisations`. Captures dans `assets/img/real-*.webp` (pleine page ordinateur + mobile) ; le curseur « Maquette / Site livré » compare `real-carnot-wire.webp` et `real-carnot-top.webp`.
- **Témoignages** : `#temoignages`, citations validées par les clients.
- **Démo** : contenus par métier dans l'objet `DEMO` de `assets/js/sections.js`.
- **Tarifs sites / formation** : directement dans les cartes `.plan` des panneaux `#panel-sites` et `#panel-formation` (`index.html`).
- **Tarifs CRM** : prix mensuels dans `#panel-crm`, remises 6 mois / annuel dans `pricingData` (`assets/js/main.js`).
- **Add-ons** : cartes `.addon` dans `#addons`. L'attribut `data-cat` (`site`, `formation`, `crm`, séparés par des espaces) détermine les filtres où la carte apparaît.
- **Couleurs, typographies, espacements** : variables `:root` en tête de `main.css`.

## Animer un nouvel élément

- `data-reveal` : fondu + slide-up à l'entrée dans l'écran
- `data-split` (sur un titre) : révélation ligne par ligne derrière un masque
- `.magnetic` (sur un bouton) : effet magnétique au survol
- `data-tilt` (sur une carte) : inclinaison 3D + halo qui suit la souris

## Logo en verre 3D

`assets/js/hero-3d.js` (three.js, chargé seulement quand il sert) :

- **Contact et pied de page** : une grande version discrète du logo en verre passe derrière « Parlons de votre projet », et le logo du bloc « Aivelo » devient le logo en verre. Les deux se chargent à l'approche du bas de la page ; sans WebGL, le logo plat reste en place.
- **Variante du hero**, désactivée par défaut : le visuel du hero devient le logo en verre. Elle s'active en ajoutant `#logo-3d` à l'adresse (pour comparer) ou avec `data-hero="3d"` sur `<html>` (pour l'adopter).

Les contours du logo sont tracés depuis `assets/img/aivelo-logo.png` (constante `LOGO` en tête du fichier).

## Méthode : goutte d'eau sur verre

`assets/js/water.js` raconte un trajet A → B au défilement, en respectant la gravité : une goutte se forme en haut de la section (A), glisse le long des étapes en s'étirant quand elle accélère et en vibrant quand elle freine, marque une pause dans le cercle de chaque étape et y laisse une perle, puis se dépose en lentille dans le cercle final (B) : « Projet livré ». L'eau ne remonte jamais : la scène se réinitialise seulement quand la section est sortie de l'écran par le bas.

Rendu WebGL2 en deux passes (metaballs dans une texture flottante, puis ombrage « verre liquide »). Sans WebGL2 ou avec « réduire les animations », la ligne classique reste en place.

## Sections ajoutées après l'audit

- **Réalisations** (fond sombre) : vrais sites clients, captures qui défilent au survol, curseur maquette / site livré.
- **Démo « esquisse d'ambiance »** (fond violet) : métier, ambiance et couleur transforment l'aperçu ; le bouton envoie l'esquisse par e-mail comme point de départ de l'atelier.
- **Fondu de fond** : la page passe au sombre puis au violet en traversant ces deux sections.
- **Effets** : prix en compteur mécanique (texte normal au repos), ondulation des photos « Pour qui », lentille de verre sur le site du hero, vidéo de leçon (`assets/img/lecon.*`) dans la carte Formation.
- **Nettoyage** : add-ons repliés à 6, liens légaux en fenêtre, three.js non chargé sur mobile et en économie de données.

## Fond jour / nuit

`assets/js/bg.js` dessine le ciel derrière la page (WebGL, environ 10 Ko) : ciel de jour avec nuages et soleil sur les sections claires, nuit étoilée (Voie lactée, étoiles filantes, étoile Aivelo) sur les sections marquées `data-bg="ink"`, crépuscule violet sur `data-bg="indigo"`. Sans WebGL ou avec « réduire les animations », le fond d'origine reste.

## Conversion, simulateur et réservation

- **Fichiers minifiés** : la page charge les `.min.js` / `.min.css`. Après toute modification d'un fichier source, régénérer son `.min` avec esbuild, par exemple `npx esbuild assets/js/sections.js --minify --target=es2019 --outfile=assets/js/sections.min.js`.
- **Simulateur** (`#estimation`) : tarifs, options et délais dans l'objet `PRICING` de `assets/js/sections.js`. Les inclusions Signature / Académie suivent les cartes d'offres.
- **Réservation** : tous les boutons `[data-book]` ouvrent l'atelier Calendly dans une fenêtre du site (constante `BOOKING`). Depuis le simulateur, le nom, l'e-mail, le téléphone et l'estimation pré-remplissent la réservation (questions 1 et 2 de l'événement Calendly).
- **Mobile** : barre d'action fixe (WhatsApp, Estimer, Réserver) ; expertises en carrousel.
- **Votre interlocuteur** (`#interlocuteur`) : présentation d'Arthur Semelier et lien LinkedIn.
- **Mentions légales / RGPD** : objet `LEGAL` de `assets/js/sections.js`. À compléter : SIRET dès l'immatriculation.
- **SEO** : Open Graph (`assets/img/og-aivelo.jpg`), URL canonique `https://aivelo.fr/`, JSON-LD, `sitemap.xml`, `robots.txt`.
- **Polices** : hébergées dans `assets/fonts/` (`@font-face` en tête de `assets/css/sections.css`), aucune requête vers Google Fonts.
- **Fond** : le soleil descend et se dore au fil de la page ; dans les sections de nuit, la constellation du logo se dessine (`assets/js/bg.js`).
- **Hero** : après « En ligne », la fenêtre fait défiler les vrais sites clients (`REALS` dans `assets/js/main.js`, captures `assets/img/real-*.webp`).
- **Statistiques** : Umami Cloud, sans cookie (balise dans le `<head>`, limitée à `aivelo.fr` par `data-domains`). Les clics clés portent `data-umami-event` (ajouté par `assets/js/sections.js`) : `demarrer-projet`, `esquisser-metier`, `estimer`, `reserver-atelier`, `reserver-avec-estimation`, `whatsapp`, `linkedin`, `email`, plus `esquisse-composee`, `estimation-composee` et `rdv-confirme` (réservation Calendly confirmée).

## Pages SEO et configuration Vercel

- **`creation-site-web-bordeaux.html`** : page locale, servie à `/creation-site-web-bordeaux` grâce à `cleanUrls` (`vercel.json`). Même design et mêmes scripts que l'accueil, sans les effets lourds (three.js, goutte d'eau).
- **Liens internes** : toujours en chemins absolus propres (`/`, `/#offres`, `/creation-site-web-bordeaux`).
- **Données structurées** : une seule entité `ProfessionalService` (`@id https://aivelo.fr/#studio`), identique sur toutes les pages.
- **`vercel.json`** : URLs sans `.html`, cache long sur les polices et images.
- **`sitemap.xml`** : une ligne par page, avec `lastmod`.

## Performance (novembre 2026)

- **Fond jour / nuit** (`bg.js`) : budget de pixels fixe, ~12 images/s au repos le jour, ~20 la nuit, 30 pendant le défilement ; désactivé en économie de données et sur les appareils très modestes.
- **Verre** : garder les `backdrop-filter` pour les grandes vitres seulement. Les pastilles, boutons et verres imbriqués n'ont plus de flou en direct (bloc « PERFORMANCE » en fin de `sections.css`). Ne pas en rajouter sur de petits éléments.
- **Intro** : ~1,2 s à la première visite, fondu ensuite.

## Pages SEO nationales

`tools/build_pages.py` génère les pages par métier et par intention (`creation-site-internet`, `prix-creation-site-internet`, `refonte-site-internet`, `site-internet-*`) à partir du gabarit `creation-site-web-bordeaux.html` et du contenu de `tools/pages_data.py`. Il met aussi à jour `sitemap.xml` et la rangée « Sites par métier & guides » du pied de toutes les pages.

```
python3 tools/build_pages.py
```

Ajouter une page : une entrée dans `PAGES` (et dans `RELATED` pour le pied de page), puis relancer le script. Ne pas modifier les pages générées à la main : elles sont réécrites à chaque lancement. `llms.txt` présente le studio aux moteurs de réponse IA ; le compléter quand une page est ajoutée.
