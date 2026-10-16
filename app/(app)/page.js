import { Suspense } from "react";
import { getProjects } from "../Shell";
import styles from "./dashboard.module.css";

const NodesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="6" height="6" x="3" y="3" rx="1.5" />
    <rect width="6" height="6" x="15" y="15" rx="1.5" />
    <rect width="6" height="6" x="15" y="3" rx="1.5" />
    <path d="M9 6h6M6 9v6a3 3 0 0 0 3 3h6" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

async function Canvas() {
  const { projects } = await getProjects();

  // No projects yet: point at the "New project" button in the top bar.
  if (!projects.length) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <ArrowUpIcon />
          </span>
          <h2 className={styles.emptyTitle}>No project yet</h2>
          <p className={styles.emptyText}>Use “New project” in the top bar to create one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>
          <NodesIcon />
        </span>
        <h2 className={styles.emptyTitle}>No file open</h2>
        <p className={styles.emptyText}>Select a file in the sidebar, or create one from the Project Canvas row.</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <Canvas />
    </Suspense>
  );
}
