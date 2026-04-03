import { useState } from "react";
import VotePanel from "./VotePanel";

function ProposalList({ proposals, currentAddress, voteWeight, onVote, disabled = false }) {
  const [selected, setSelected] = useState(null);

  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <span className="panel-kicker">DAO Ledger</span>
          <h3>Proposals</h3>
        </div>
        <span className="muted-pill">{proposals.length} live</span>
      </div>

      {proposals.length === 0 && <p className="empty-state">No proposals yet.</p>}

      <div className="proposal-list">
        {proposals.map((proposal) => {
          const isSelected = selected?.id === proposal.id;
          const hasVoted = Boolean(proposal.voters?.[currentAddress]);

          return (
            <article
              key={proposal.id}
              className={`proposal-card ${isSelected ? "proposal-card-active" : ""}`}
              onClick={() => setSelected(isSelected ? null : proposal)}
            >
              <div className="proposal-head">
                <div>
                  <span className="proposal-id">#{proposal.id}</span>
                  <h4>{proposal.title}</h4>
                  <p className="proposal-meta">Created by {proposal.createdBy}</p>
                </div>
                <div className="proposal-score">
                  <span>Yes {proposal.yes}</span>
                  <span>No {proposal.no}</span>
                </div>
              </div>

              <div className="proposal-footer">
                <span className="status-chip">{hasVoted ? "Already voted" : "Open for vote"}</span>
                <span className="status-chip subtle">Weight {voteWeight}</span>
              </div>

              {isSelected && (
                <VotePanel proposal={proposal} onVote={onVote} disabled={disabled || hasVoted} />
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default ProposalList;