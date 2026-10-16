"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import ProjectIcon from "./ProjectIcon";
import { createProject, setActiveProject } from "./projects/actions";
import styles from "./ProjectSwitcher.module.css";

const stroke = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const ChevronIcon = () => (
  <svg {...stroke} width="14" height="14">
    <path d="m7 15 5 5 5-5" />
    <path d="m7 9 5-5 5 5" />
  </svg>
);

const PlusIcon = () => (
  <svg {...stroke} width="16" height="16">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const CheckIcon = () => (
  <svg {...stroke} width="14" height="14" strokeWidth="2.5">
    <path d="m5 12 5 5L20 7" />
  </svg>
);

export default function ProjectSwitcher({ projects, activeId }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef(null);

  // Close on outside click / Escape
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

  const pick = (id) => {
    setOpen(false);
    if (id !== activeId) startTransition(() => setActiveProject(id));
  };

  const create = () => {
    setOpen(false);
    startTransition(() => createProject(`Project ${projects.length + 1}`));
  };

  const active = projects.find((p) => p.id === activeId) ?? projects[0];

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        className={styles.trigger}
        data-open={open || undefined}
        data-pending={pending || undefined}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch project"
      >
        <span className={styles.icon}>
          <ProjectIcon icon={active.icon} />
        </span>
        <span className={styles.name}>{active.name}</span>
        <span className={styles.chevron}>
          <ChevronIcon />
        </span>
      </button>

      {open && (
        <div className={styles.menu}>
          <ul className={styles.list} role="listbox" aria-label="Projects">
            {projects.map((p) => (
              <li key={p.id}>
                <button
                  className={styles.item}
                  type="button"
                  role="option"
                  aria-selected={p.id === activeId}
                  onClick={() => pick(p.id)}
                >
                  <span className={styles.itemMark}>
                    <ProjectIcon icon={p.icon} />
                  </span>
                  <span className={styles.itemText}>
                    <span className={styles.itemName}>{p.name}</span>
                    <span className={styles.itemId}>{p.id}</span>
                  </span>
                  {p.id === activeId && (
                    <span className={styles.check}>
                      <CheckIcon />
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          <div className={styles.divider} aria-hidden="true" />
          <button className={`${styles.item} ${styles.create}`} type="button" onClick={create}>
            <span className={styles.itemMark}>
              <PlusIcon />
            </span>
            <span className={styles.itemText}>
              <span className={styles.itemName}>New project</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
