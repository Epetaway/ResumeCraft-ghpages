# ResumeCraft — Static Demo (GitHub Pages)

Front-end–only demo for code review. **No server, no API keys, no sensitive data.**  
Use it to preview UI/UX and mocked parsing/analysis/optimization entirely in the browser.

## What’s included

- Mobile-first UI (Tailwind CDN)
- Upload/paste resume → mock parse
- Mock analysis & optimization for a target role
- Resume preview + print + download HTML

## Run locally

Just open `index.html` in a browser, or serve it statically.

## Deploy to GitHub Pages

This repo includes a GitHub Actions workflow for Pages.

1. Push to a repo (default branch `main`).
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main` (or re-run the workflow).

Your site will be available at: `https://<you>.github.io/<repo>/`

## Notes

- This is a **static** demo. No network calls, no back end, no AI providers.
- The original full-stack app remains separate (this demo is safe to publish).

## License

MIT
