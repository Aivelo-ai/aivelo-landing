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

## Librairies (CDN, versions figées)

- **GSAP 3.13** : ScrollTrigger (animations au scroll, pin horizontal), SplitText (titres en slide-up ligne par ligne)
- **Lenis 1.1** : smooth scroll

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
