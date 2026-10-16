import styles from "./dashboard.module.css";

const NodesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="6" height="6" x="3" y="3" rx="1.5" />
    <rect width="6" height="6" x="15" y="15" rx="1.5" />
    <rect width="6" height="6" x="15" y="3" rx="1.5" />
    <path d="M9 6h6M6 9v6a3 3 0 0 0 3 3h6" />
  </svg>
);

// Dashboard: Vercel-style empty state until the plugin canvas exists.
export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>
          <NodesIcon />
        </span>
        <h2 className={styles.emptyTitle}>Nothing here yet</h2>
        <p className={styles.emptyText}>Your plugin canvas will live here. Pick a project in the top bar to get started.</p>
      </div>
    </div>
  );
}
