"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { setActiveProject } from "./projects/actions";
import styles from "./ProjectsNav.module.css";

const CubeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m21 16-9 5-9-5V8l9-5 9 5z" />
    <path d="m3 8 9 5 9-5M12 13v8" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 5 5L20 7" />
  </svg>
);

// Sidebar chip for the active project; the dropdown switches between the user's projects.
export default function ProjectsNav({ projects, activeId }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef(null);
  const active = activeId;
  const current = projects.find((p) => p.id === activeId);
  const setActive = (id) => id !== activeId && startTransition(() => setActiveProject(id));

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!current) {
    return (
      <div className={styles.wrap}>
        <div className={styles.empty}>No project yet. Use “New project” in the top bar.</div>
      </div>
    );
  }

  return (
    <div className={styles.wrap} ref={ref} data-pending={pending || undefined}>
      <button className={styles.trigger} data-open={open || undefined} type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open}>
        <span className={styles.mark}>
          <CubeIcon />
        </span>
        <span className={styles.text}>
          <span className={styles.name}>{current.name}</span>
          <span className={styles.sub}>Project</span>
        </span>
        <span className={styles.chevron}>
          <ChevronIcon />
        </span>
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          {projects.map((p) => (
            <button
              key={p.id}
              className={styles.item}
              type="button"
              role="menuitemradio"
              aria-checked={p.id === active}
              data-active={p.id === active || undefined}
              onClick={() => (setActive(p.id), setOpen(false))}
            >
              <span className={styles.itemMark}>
                <CubeIcon size={15} />
              </span>
              <span className={styles.itemName}>{p.name}</span>
              {p.id === active && (
                <span className={styles.check}>
                  <CheckIcon />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
