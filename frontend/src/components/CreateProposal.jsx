import { useState } from "react";

function CreateProposal({ onCreated, disabled = false }) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim()) return;
    setStatus("Submitting...");
    try {
      const proposal = await onCreated(title);
      setStatus(`Proposal #${proposal.id} created.`);
      setTitle("");
    } catch (err) {
      setStatus("❌ Error: " + err.message);
    }
  }

  return (
    <form className="panel-card" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <span className="panel-kicker">Governance</span>
          <h3>Create Proposal</h3>
        </div>
      </div>
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Enter proposal title..."
        className="text-input"
        disabled={disabled}
      />
      <div className="panel-actions">
        <button className="primary-button" type="submit" disabled={disabled}>Submit</button>
      </div>
      {status && <p className="status-line">{status}</p>}
    </form>
  );
}

export default CreateProposal;