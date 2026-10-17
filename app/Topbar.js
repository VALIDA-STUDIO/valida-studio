"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ProjectSwitcher from "./ProjectSwitcher";
import styles from "./Topbar.module.css";

// Pages that sit inside a project show the switcher; none have their own label yet.
const isProjectPage = (p) => p === "/";
const segments = () => [];

// Vercel-style slash between breadcrumb items
const UndoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
  </svg>
);
const RedoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 15-6.7L21 13" />
  </svg>
);

const HammerIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m15 12-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9" />
    <path d="M17.64 15 22 10.64" />
    <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
  </svg>
);

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
  const crumbs = segments(pathname);

  return (
    <header className={styles.bar}>
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link className={styles.root} href="/">
          Valida Studio
        </Link>
        {isProjectPage(pathname) && (
          <>
            <Sep />
            <ProjectSwitcher projects={projects} activeId={activeId} />
          </>
        )}
        {crumbs.map((label, i) => (
          <span key={label} className={styles.tail}>
            <Sep />
            <span className={styles.current} aria-current={i === crumbs.length - 1 ? "page" : undefined}>
              {label}
            </span>
          </span>
        ))}
      </nav>

      {/* right side: history + export (not wired yet) */}
      <div className={styles.actions} role="group" aria-label="Actions">
        <button className={styles.iconBtn} type="button" title="Undo (⌘Z)" aria-label="Undo">
          <UndoIcon />
        </button>
        <button className={styles.iconBtn} type="button" title="Redo (⇧⌘Z)" aria-label="Redo">
          <RedoIcon />
        </button>
        <span className={styles.divider} aria-hidden="true" />
        <button className={styles.export} type="button" title="Build the plugin and download it">
          <HammerIcon />
          Export .jar
        </button>
      </div>
    </header>
  );
}
