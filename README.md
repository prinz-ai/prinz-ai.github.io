# Prinz homepage

Static, responsive site for `prinzai.com`, with artwork inspired by the gold folding screen used in the owner's X banner.

## Files

- `index.html`: image-led homepage with links to the two sections.
- `projects/index.html`: prinzbench and accelerando links.
- `history-lab/index.html`: the two WWI cipher stories.
- `styles.css`: desktop and mobile layout shared by all pages.
- `assets/gold-screen.webp`, `assets/projects-art.webp`, `assets/history-art.webp`: illustrative artwork for the hero and section covers.
- The two story thumbnails use different crops of `history-art.webp`.
- `404.html`: redirects old bare-domain Substack URLs under `/p/` and `/t/`, plus `/about`, `/archive`, and `/subscribe`, to the same path on `www.prinzai.com`, preserving query and fragment.
- `CNAME` and `.nojekyll`: GitHub Pages custom-domain deployment files.
- `favicon.svg`, `robots.txt`, and `sitemap.xml`: lightweight browser and search metadata.

## Domain and deployment

GitHub Pages publishes the `main` branch from the repository root with `prinzai.com` as its custom domain. Dynadot points the apex to GitHub Pages. The existing Substack blog stays on `https://www.prinzai.com/`; its `www` CNAME remains with Substack. All Blog links point to `www`, and the history cards link to their `www` post URLs. The `404.html` redirect preserves old bare-domain Substack post links.

GitHub Pages redeploys when these files change. Check **Settings → Pages** for DNS verification and **Enforce HTTPS**. After DNS or hosting changes, confirm that `https://prinzai.com/` loads this page, `https://www.prinzai.com/` still loads the blog, and an old `https://prinzai.com/p/...` URL redirects to `www`.

No build step is needed.
