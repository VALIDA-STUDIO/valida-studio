import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getProjects, getNodes } from "../../../Shell";
import styles from "../../dashboard.module.css";

const FileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </svg>
);

// One file. For now this only shows which file is open.
async function FileCanvas({ params }) {
  const { id } = await params;
  const { activeId } = await getProjects();
  const nodes = await getNodes(activeId);
  const file = nodes.find((n) => n.id === id && n.kind === "file");
  if (!file) redirect("/");

  // breadcrumb-ish path: folder / folder / file
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const path = [];
  for (let cur = file; cur; cur = cur.parent_id ? byId.get(cur.parent_id) : null) path.unshift(cur.name);

  return (
    <div className={styles.page}>
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>
          <FileIcon />
        </span>
        <h2 className={styles.emptyTitle}>{file.name}</h2>
        {path.length > 1 && <p className={styles.emptyText}>{path.join(" / ")}</p>}
      </div>
    </div>
  );
}

export default function FilePage({ params }) {
  return (
    <Suspense fallback={null}>
      <FileCanvas params={params} />
    </Suspense>
  );
}
