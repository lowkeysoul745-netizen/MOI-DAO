function ParticipantCard({ profile, network }) {
  return (
    <section className="panel-card profile-card">
      <div className="panel-header">
        <div>
          <span className="panel-kicker">Participant</span>
          <h3>{profile.displayName}</h3>
        </div>
        <span className="network-pill">{network.mode}</span>
      </div>
      <dl className="profile-grid">
        <div>
          <dt>Address</dt>
          <dd>{profile.address}</dd>
        </div>
        <div>
          <dt>Vote weight</dt>
          <dd>{profile.voteWeight}</dd>
        </div>
        <div>
          <dt>Interactions</dt>
          <dd>{profile.interactions}</dd>
        </div>
        <div>
          <dt>Votes cast</dt>
          <dd>{profile.votesCast}</dd>
        </div>
      </dl>
    </section>
  );
}

export default ParticipantCard;