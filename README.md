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
