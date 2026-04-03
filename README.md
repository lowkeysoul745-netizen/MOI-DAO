# MOI DAO

A demo DAO web app built with React and a small local Node backend. It can be run locally for development or hosted on GitHub Pages as a frontend-only demo.

## Local Development

Run the backend from the repository root:

```powershell
node .\backend\server.js
```

Run the frontend in a second terminal:

```powershell
cd .\frontend
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## GitHub Hosting

This repo includes a GitHub Pages workflow at [.github/workflows/github-pages.yml](.github/workflows/github-pages.yml).

To publish the frontend on GitHub Pages:

1. Push the repository to GitHub.
2. Open `Settings` -> `Pages` in the GitHub repository.
3. Select `GitHub Actions` as the source.
4. Push to `main` or run the `Deploy Frontend To GitHub Pages` workflow from the `Actions` tab.

The published site uses browser-local demo state if the backend is not available, so the hosted version still works as a prototype.

## Notes

- The backend is only for local development.
- The frontend falls back to local demo state when the API is unreachable.
- Proposal and vote data persist in `backend/state.json` during local use.