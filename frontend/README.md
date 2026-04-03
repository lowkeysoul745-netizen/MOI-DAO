# MOI DAO Demo

This frontend is wired to a local demo backend so you can record a working prototype without deploying MOI contracts.

## Run locally

1. Start the backend from the repository root:

```powershell
node .\backend\server.js
```

2. Start the frontend:

```powershell
cd .\frontend
npm run dev
```

3. Open the Vite URL shown in the terminal.

## Demo flow

- Create a proposal from the form on the left.
- Select a proposal and cast a weighted yes/no vote.
- Use Reset demo state if you want to return to the seeded scenario before recording.

## Notes

- Proposal, vote, profile, and activity data are persisted in `backend/state.json`.
- The deployment scripts remain in the repository, but the demo no longer depends on them.
