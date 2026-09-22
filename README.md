# Prinz homepage

Static, responsive homepage for `prinzai.com`, based on the approved visual concept.

## Files

- `index.html`: semantic page content and destinations.
- `styles.css`: desktop and mobile layout.
- `assets/hero-mountains.png`: standalone transparent mountain artwork for the hero.
- `assets/artwork-source.png`: concept artwork used only inside clipped inline SVG windows for the two history thumbnails. Page text and links are live HTML.
- `404.html`: redirects old bare-domain Substack URLs under `/p/` and `/t/`, plus `/about`, `/archive`, and `/subscribe`, to the same path on `www.prinzai.com`, preserving query and fragment.
- `CNAME` and `.nojekyll`: GitHub Pages custom-domain deployment files.
- `favicon.svg`, `robots.txt`, and `sitemap.xml`: lightweight browser and search metadata.

## Domain and deployment

GitHub Pages publishes the `main` branch from the repository root with `prinzai.com` as its custom domain. Dynadot points the apex to GitHub Pages. The existing Substack blog stays on `https://www.prinzai.com/`; its `www` CNAME remains with Substack. All Blog links point to `www`, and the history cards link to their `www` post URLs. The `404.html` redirect preserves old bare-domain Substack post links.

GitHub Pages redeploys when these files change. Check **Settings → Pages** for DNS verification and **Enforce HTTPS**. After DNS or hosting changes, confirm that `https://prinzai.com/` loads this page, `https://www.prinzai.com/` still loads the blog, and an old `https://prinzai.com/p/...` URL redirects to `www`.

No build step is needed.
