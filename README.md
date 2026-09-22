# Prinz homepage prototype

Static, responsive homepage for prinzai.com, based on the approved visual concept.

## Files

- `index.html`: semantic page content and destinations.
- `styles.css`: desktop and mobile layout.
- `assets/hero-mountains.png`: standalone transparent mountain artwork for the hero.
- `assets/artwork-source.png`: concept artwork used only inside clipped inline SVG windows for the two history thumbnails. Page text and links are live HTML.
- `404.html`: redirects old bare-domain Substack URLs under `/p/` and `/t/`, plus `/about`, `/archive`, and `/subscribe`, to the same path on `www.prinzai.com`, preserving query and fragment.
- `CNAME` and `.nojekyll`: GitHub Pages custom-domain deployment files.
- `favicon.svg`, `robots.txt`, and `sitemap.xml`: lightweight browser and search metadata.

## Domain and deployment plan

The homepage is intended for the apex `https://prinzai.com/`, served by GitHub Pages. The existing Substack blog stays on `https://www.prinzai.com/`. All Blog links point to `www`; the history cards point to their `www` post URLs. The `404.html` redirect preserves old bare-domain Substack post links after the cutover.

Before publishing, create or choose the GitHub Pages repository and put these files at the publishing root. In its **Settings → Pages** panel, set `prinzai.com` as the custom domain. Verify domain ownership with the GitHub TXT record if GitHub requests it. At the DNS provider, direct the apex to GitHub Pages using GitHub's current documented A/AAAA records while retaining the existing `www` record for Substack. Wait for the Pages DNS check to pass, then enable **Enforce HTTPS**. Confirm that `https://prinzai.com/` loads this page, `https://www.prinzai.com/` still loads the blog, and an old `https://prinzai.com/p/...` URL redirects to `www`.

No build step is needed. Place these files at the static host root.
