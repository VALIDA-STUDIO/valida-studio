"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "./canvas/categories";
import styles from "./CanvasNav.module.css";

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const CanvasIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="6" height="6" x="3" y="3" rx="1.5" />
    <rect width="6" height="6" x="15" y="15" rx="1.5" />
    <rect width="6" height="6" x="15" y="3" rx="1.5" />
    <path d="M9 6h6M6 9v6a3 3 0 0 0 3 3h6" />
  </svg>
);

// "Project Canvas" section of the sidebar: the root row folds it, the category rows navigate.
export default function CanvasNav({ projectId }) {
  const pathname = usePathname();
  const storageKey = `valida.canvas.${projectId}`;
  const [open, setOpen] = useState(true);

  // remembered per project on this device; default open
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) setOpen(saved === "1");
    } catch {}
  }, [storageKey]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    try {
      localStorage.setItem(storageKey, next ? "1" : "0");
    } catch {}
  };

  return (
    <div className={styles.section}>
      <div
        className={`${styles.row} ${styles.rootRow}`}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={open ? "Collapse Project Canvas" : "Expand Project Canvas"}
        onClick={toggle}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggle())}
      >
        <span className={styles.caret} data-open={open || undefined}>
          <ChevronIcon />
        </span>
        <span className={styles.rootIcon}>
          <CanvasIcon />
        </span>
        <span className={styles.name}>Project Canvas</span>
      </div>

      {open && (
        <div className={styles.children}>
          {CATEGORIES.map(({ slug, label, Icon }) => {
            const href = `/canvas/${slug}`;
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={slug} href={href} className={styles.row} data-selected={active || undefined} aria-current={active ? "page" : undefined}>
                <span className={styles.kind}>
                  <Icon />
                </span>
                <span className={styles.name}>{label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
