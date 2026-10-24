# New Think Tank

The website for New Think Tank, Gustav Rasmussen's courses, talks, workshops,
and consulting in AI and software engineering. Hosted on GitHub Pages, with
plain HTML, CSS, and JavaScript. No build step or runtime dependencies.

## Local Preview

From the repository root:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173/. Use an HTTP preview rather than opening the HTML
directly, so the self-hosted font and SVG icons load under normal browser
security rules.

## Content

- [index.html](index.html): homepage and service overview.
- [html/catalog.html](html/catalog.html): course descriptions, outlines,
  audiences, consulting topics, and original testimonials.
- [html/profile.html](html/profile.html): talks, publications, projects,
  competition result, and event photographs.
- [css/main.css](css/main.css): shared styles, responsive layouts, and themes.
- [js/main.js](js/main.js): theme preference and URL-based catalog filtering.

The catalog remains readable with JavaScript disabled. Its course outlines
and feedback use native HTML disclosures. Prices and dates are not hardcoded.

## Checks

```sh
node --check js/main.js
```

Check all three pages at mobile, tablet, and desktop widths. Verify course
filters and shared filter URLs, keyboard navigation, expandable outlines,
and theme persistence between pages. Check the catalog with JavaScript
disabled as well.

## Assets

The Manrope font is self-hosted under the [SIL Open Font License](fonts/OFL.txt).
The icons are from Lucide 0.468.0 under its [ISC license](img/icons/LICENSE).
Existing photographs and brand images are retained. The optimized homepage
photograph is generated from the original KCD image:

```sh
sips -s format jpeg -s formatOptions 78 --resampleWidth 1800 img/kcd.jpeg --out img/kcd-hero.jpg
```
