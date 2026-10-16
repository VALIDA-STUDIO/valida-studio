"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ProjectSwitcher from "./ProjectSwitcher";
import { findCategory } from "./canvas/categories";
import styles from "./Topbar.module.css";

const LABELS = {
  "/settings": "Settings",
  "/project/settings": "Project Settings",
};

// Account-level pages (settings) have no project context, so no switcher there.
const isProjectPage = (p) => p === "/" || p === "/project/settings" || p.startsWith("/canvas/");

// Trailing breadcrumb segments for a path
function segments(pathname) {
  if (pathname.startsWith("/canvas/")) {
    const cat = findCategory(pathname.slice("/canvas/".length));
    return cat ? ["Project Canvas", cat.label] : ["Project Canvas"];
  }
  return LABELS[pathname] ? [LABELS[pathname]] : [];
}

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
    </header>
  );
}
