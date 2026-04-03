import { useState } from "react";

function VotePanel({ proposal, onVote, disabled }) {
  const [status, setStatus] = useState("");

  async function vote(voteYes) {
    if (disabled) {
      setStatus("You already voted on this proposal.");
      return;
    }

    setStatus("Submitting vote...");
    try {
      await onVote(proposal.id, voteYes);
      setStatus(voteYes ? "Vote recorded for Yes." : "Vote recorded for No.");
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  }

  return (
    <div className="vote-panel" onClick={(event) => event.stopPropagation()}>
      <p className="vote-note">Weighted by your current profile score.</p>
      <button
        onClick={() => vote(true)}
        className="vote-button vote-yes"
        type="button"
        disabled={disabled}
      >
        Yes
      </button>
      <button
        onClick={() => vote(false)}
        className="vote-button vote-no"
        type="button"
        disabled={disabled}
      >
        No
      </button>
      {status && <p className="status-line">{status}</p>}
    </div>
  );
}

export default VotePanel;