import { useEffect, useState } from "react";
import { createProposal, fetchDemoState, resetDemoState, voteProposal } from "./moi";
import ProposalList from "./components/ProposalList";
import CreateProposal from "./components/CreateProposal";
import ParticipantCard from "./components/ParticipantCard";
import ActivityFeed from "./components/ActivityFeed";
import "./App.css";

function App() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadState() {
    setError("");
    try {
      const nextState = await fetchDemoState();
      setState(nextState);
    } catch (requestError) {
      setError(requestError.message || "Unable to load the demo state.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadState();
  }, []);

  async function handleCreateProposal(title) {
    setBusy(true);
    try {
      const result = await createProposal(title);
      setState(result);
      return result.proposal;
    } finally {
      setBusy(false);
    }
  }

  async function handleVote(proposalId, voteYes) {
    setBusy(true);
    try {
      const result = await voteProposal(proposalId, voteYes);
      setState(result);
      return result.proposal;
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    setBusy(true);
    try {
      const result = await resetDemoState();
      setState(result);
    } catch (requestError) {
      setError(requestError.message || "Unable to reset the demo state.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <div className="loading-orb" />
          <h2>Booting the demo ledger</h2>
          <p>Connecting to the local MOI prototype backend.</p>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <h2>Unable to load the demo</h2>
          <p>{error || "The local backend is not responding."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-backdrop" />
      <main className="app-container">
        <header className="hero-card">
          <div>
            <span className="eyebrow">{state.network.name}</span>
            <h1>MOI DAO Demo</h1>
            <p className="hero-copy">
              A self-contained governance prototype with live proposal creation, weighted voting,
              and persistent local state for a clean demo recording.
            </p>
          </div>
          <div className="hero-actions">
            <button className="ghost-button" onClick={handleReset} disabled={busy}>
              Reset demo state
            </button>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <span>Total proposals</span>
              <strong>{state.summary.totalProposals}</strong>
            </div>
            <div className="stat-card">
              <span>Your vote weight</span>
              <strong>{state.profile.voteWeight}</strong>
            </div>
            <div className="stat-card">
              <span>Interactions</span>
              <strong>{state.summary.interactions}</strong>
            </div>
            <div className="stat-card">
              <span>Support balance</span>
              <strong>{state.summary.totalYes} / {state.summary.totalNo}</strong>
            </div>
          </div>
          {error && <div className="notice notice-error">{error}</div>}
        </header>

        <section className="content-grid">
          <div className="column-stack">
            <ParticipantCard profile={state.profile} network={state.network} />
            <CreateProposal onCreated={handleCreateProposal} disabled={busy} />
          </div>

          <div className="column-stack">
            <ProposalList
              proposals={state.proposals}
              currentAddress={state.profile.address}
              voteWeight={state.profile.voteWeight}
              onVote={handleVote}
              disabled={busy}
            />
            <ActivityFeed activity={state.activity} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;