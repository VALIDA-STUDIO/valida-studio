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

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12M7 10l5 5 5-5M4 19h16" />
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
      <div className={styles.actions}>
        <div className={styles.history} role="group" aria-label="History">
          <button className={styles.iconBtn} type="button" title="Undo (⌘Z)" aria-label="Undo">
            <UndoIcon />
          </button>
          <button className={styles.iconBtn} type="button" title="Redo (⇧⌘Z)" aria-label="Redo">
            <RedoIcon />
          </button>
        </div>
        <button className={styles.export} type="button" title="Build the plugin and download it">
          <DownloadIcon />
          Export .jar
        </button>
      </div>
    </header>
  );
}
