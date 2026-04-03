# MOI DAO Demo

A local, self-contained DAO prototype for recording a working demo without deploying to MOI.

## What This Includes

- A Node backend that serves proposal, voting, profile, and activity data.
- A React + Vite frontend for creating proposals and casting votes.
- Persistent demo state stored in `backend/state.json`.

## Requirements

- Node.js installed on your machine.
- PowerShell or another terminal.

## Run The Demo

Open two terminals.

Terminal 1, from the repository root:

```powershell
cd C:\Users\hp\OneDrive\Desktop\Projects\moi-dao
node .\backend\server.js
```

Terminal 2, from the frontend folder:

```powershell
cd C:\Users\hp\OneDrive\Desktop\Projects\moi-dao\frontend
npm run dev
```

Open the Vite URL printed in Terminal 2, usually:

```text
http://localhost:5173
```

## Host On GitHub Pages

This repo can be hosted on GitHub Pages because the frontend now falls back to a browser-local demo state when the API is unavailable.

1. Push your changes to the `main` branch.
2. In the GitHub repository, open `Settings` -> `Pages`.
3. Set `Build and deployment` to `GitHub Actions`.
4. Make sure the workflow in [.github/workflows/github-pages.yml](../.github/workflows/github-pages.yml) exists on `main`.
5. Push again or manually run the workflow from the `Actions` tab.

After the workflow succeeds, GitHub will show the published Pages URL in the workflow run and in `Settings` -> `Pages`.

## Demo Flow

1. Create a proposal.
2. Open the proposal card.
3. Vote Yes or No.
4. Use Reset demo state to return to the seeded example.

## Troubleshooting

- If the backend fails with `EADDRINUSE`, port `8787` is already in use. Stop the existing backend process and run it again.
- If the frontend cannot load data, confirm the backend is running before starting Vite.
- On GitHub Pages, the app uses the browser-local demo state automatically if the backend is not reachable.

## Project Notes

- `backend/server.js` contains the local API.
- `frontend/src/moi.js` is the client API layer.
- Deployment scripts are kept in the repository, but the demo does not depend on them.
