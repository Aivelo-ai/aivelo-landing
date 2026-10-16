# Aivelo — site vitrine

Site statique (HTML/CSS/JS, aucun build) : ouvrir `index.html` ou servir le dossier tel quel.

```
index.html            contenu et structure des sections
assets/css/main.css   design system (tokens en tête de fichier), layout, responsive
assets/js/main.js     interactions et motion design
```

## Librairies (CDN, versions figées)

- **GSAP 3.13** : ScrollTrigger (animations au scroll, pin horizontal), SplitText (titres en slide-up ligne par ligne)
- **Lenis 1.1** : smooth scroll

Si les CDN ne répondent pas, ou si le visiteur a activé « réduire les animations », le site reste entièrement lisible et utilisable : la classe `motion` est retirée et tout s'affiche sans animation.

## Modifier le contenu

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

## Méthode : goutte d'eau sur verre (test)

`assets/js/water.js` raconte un trajet A → B au défilement, en respectant la gravité : en haut, de la condensation perle sur le verre et se rassemble en une goutte (A) ; la goutte glisse, s'étire quand elle accélère, vibre quand elle freine, laisse une traînée humide qui se fragmente et avale les gouttelettes sur son passage ; elle marque une pause dans le cercle de chaque étape et y laisse une perle ; elle se dépose en lentille dans le cercle final (B), puis « Projet livré » apparaît. L'eau ne remonte jamais : la scène se réinitialise seulement quand la section est sortie de l'écran par le bas.

Rendu WebGL2 en deux passes (metaballs dans une texture flottante, puis ombrage « verre liquide » : biseau lumineux, frange colorée, corps dépoli, reflet net, ombre portée). Actif seulement avec la variante verre 3D (`#logo-3d` ou `data-hero="3d"`) ; ailleurs, la ligne classique reste en place.
