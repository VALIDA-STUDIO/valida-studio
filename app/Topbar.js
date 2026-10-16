"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ProjectSwitcher from "./ProjectSwitcher";
import styles from "./Topbar.module.css";

const LABELS = {
  "/": "Dashboard",
  "/settings": "Settings",
};

// Account-level pages (settings) have no project context, so no switcher there.
const PROJECT_PAGES = new Set(["/"]);

// Vercel-style slash between breadcrumb items
const Sep = () => (
  <span className={styles.sep} aria-hidden="true">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <path d="M16.88 3.549 7.12 20.451" />
    </svg>
  </span>
);

// Breadcrumb bar above every signed-in page: Valida Studio › <project ▾> › <page>
export default function Topbar({ projects, activeId }) {
  const pathname = usePathname();
  const label = LABELS[pathname] ?? "";

  return (
    <header className={styles.bar}>
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link className={styles.root} href="/">
          Valida Studio
        </Link>
        {PROJECT_PAGES.has(pathname) && (
          <>
            <Sep />
            <ProjectSwitcher projects={projects} activeId={activeId} />
          </>
        )}
        {label && (
          <>
            <Sep />
            <span className={styles.current} aria-current="page">
              {label}
            </span>
          </>
        )}
      </nav>
    </header>
  );
}
