import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getProjects } from "../../../Shell";
import { findCategory } from "../../../canvas/categories";
import PluginConfig from "../PluginConfig";
import styles from "../../dashboard.module.css";

// One Project Canvas category. Config has its form; the others are empty for now.
async function Category({ params }) {
  const { category } = await params;
  const cat = findCategory(category);
  if (!cat) notFound();

  const { projects, activeId } = await getProjects();
  const project = projects.find((p) => p.id === activeId);
  if (!project) redirect("/");

  if (cat.slug === "config") return <PluginConfig project={project} />;

  return (
    <div className={styles.page}>
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>
          <cat.Icon />
        </span>
        <h2 className={styles.emptyTitle}>{cat.label}</h2>
        <p className={styles.emptyText}>Nothing here yet.</p>
      </div>
    </div>
  );
}

export default function CategoryPage({ params }) {
  return (
    <Suspense fallback={null}>
      <Category params={params} />
    </Suspense>
  );
}
