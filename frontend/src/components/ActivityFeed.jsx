function ActivityFeed({ activity }) {
  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <span className="panel-kicker">Audit Trail</span>
          <h3>Recent Activity</h3>
        </div>
      </div>

      {activity.length === 0 && <p className="empty-state">No activity yet.</p>}

      <ul className="activity-list">
        {activity.map((item) => (
          <li key={item.id} className="activity-item">
            <span className={`activity-dot activity-${item.type}`} />
            <div>
              <p>{item.message}</p>
              <time>{new Date(item.createdAt).toLocaleString()}</time>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ActivityFeed;