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

Course inquiry links retain a known course ID in `?course=...#contact`.
The contact section builds an editable message from the catalog title and
supports copying it before opening LinkedIn. If clipboard access fails, the
message is selected for manual copying. Unknown course IDs use the general
inquiry. Shared URLs contain the course choice, not custom message text.
Messages are not submitted by this site.

Theme selection runs before the stylesheet loads. Without a saved choice,
the site follows the device's light or dark preference and responds to
preference changes. The theme button saves an explicit choice that takes
priority over the device preference. Page controls initialize after parsing.

## Checks

```sh
node --check js/main.js
```

Check all three pages at mobile, tablet, and desktop widths. Verify course
filters and shared filter URLs, keyboard navigation, expandable outlines,
and theme persistence between pages. Check the catalog with JavaScript
disabled as well. Verify both device theme preferences on a first visit,
saved light and dark overrides, and unavailable browser storage.
Check course inquiry deep links, Back/Forward navigation, clearing the
selection, and clipboard success and failure behavior.

## Sharing Previews

All three pages have canonical URLs, page-specific titles and descriptions,
and matching Open Graph and large-image sharing metadata. They use the same
[1200 x 630 branded preview](img/social-preview.jpg), composed from the
existing logo, local Manrope font, and site palette.

Social platforms fetch the public image URL, so the image and metadata must
be deployed before remote previews can update. Existing cached previews
may need refreshing on the platform.

## Assets

The Manrope font is self-hosted under the [SIL Open Font License](fonts/OFL.txt).
The icons are from Lucide 0.468.0 under its [ISC license](img/icons/LICENSE).
Existing photographs and brand images are retained. The optimized homepage
photograph has responsive WebP sources and a JPEG fallback. The profile
portrait also uses responsive WebP sources. The compact PNG logo and
multi-size favicon are generated from the original logo.

Regenerating the photo and logo assets requires ImageMagick (`magick`) and libwebp (`cwebp`),
but neither is needed to preview or deploy the site:

```sh
magick img/logo.JPG -resize 168x168 -strip img/logo-small.png
magick img/logo.JPG -resize 48x48 -gravity center -background white -extent 48x48 -strip -define icon:auto-resize=48,32,16 img/favicon.ico

for image_width in 800 1200 1800; do
    cwebp -quiet -q 80 -m 6 -metadata none -resize "$image_width" 0 img/kcd.jpeg -o "img/kcd-${image_width}.webp"
done

for image_width in 360 720; do
    cwebp -quiet -q 82 -m 6 -metadata none -resize "$image_width" 0 img/profile.jpg -o "img/profile-${image_width}.webp"
done

sips -s format jpeg -s formatOptions 78 --resampleWidth 1800 img/kcd.jpeg --out img/kcd-hero.jpg
```
