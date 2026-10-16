"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import ProjectIcon from "./ProjectIcon";
import CreateProjectForm from "./CreateProjectForm";
import { deleteProject, setActiveProject } from "./projects/actions";
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

const TrashIcon = () => (
  <svg {...stroke} width="14" height="14">
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);

export default function ProjectSwitcher({ projects, activeId }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("list"); // "list" | "create"
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const ref = useRef(null);

  const close = () => {
    setOpen(false);
    setMode("list");
    setConfirmId(null);
    setError("");
  };

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => !ref.current?.contains(e.target) && close();
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (id) => {
    close();
    if (id !== activeId) startTransition(() => setActiveProject(id));
  };

  const startCreate = () => {
    setError("");
    setConfirmId(null);
    setMode("create");
    setOpen(true);
  };

  const remove = (id) => {
    startTransition(async () => {
      const res = await deleteProject(id);
      if (res?.error) setError(res.error);
      setConfirmId(null);
    });
  };

  const active = projects.find((p) => p.id === activeId) ?? projects[0];

  return (
    <div className={styles.wrap} ref={ref}>
      {active ? (
        <button
          className={styles.trigger}
          data-open={open || undefined}
          data-pending={pending || undefined}
          type="button"
          onClick={() => (open ? close() : setOpen(true))}
          aria-haspopup="dialog"
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
      ) : (
        <button
          className={`${styles.trigger} ${styles.triggerEmpty}`}
          data-open={open || undefined}
          type="button"
          onClick={() => (open ? close() : startCreate())}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className={styles.icon}>
            <PlusIcon />
          </span>
          <span className={styles.name}>New project</span>
        </button>
      )}

      {open && mode === "list" && (
        <div className={styles.menu}>
          <ul className={styles.list} role="listbox" aria-label="Projects">
            {projects.map((p) =>
              confirmId === p.id ? (
                <li key={p.id} className={styles.confirmRow}>
                  <span className={styles.confirmText}>
                    Delete <strong>{p.name}</strong>?
                  </span>
                  <button className={styles.btnGhost} type="button" onClick={() => setConfirmId(null)}>
                    Cancel
                  </button>
                  <button className={styles.btnDanger} type="button" onClick={() => remove(p.id)} disabled={pending}>
                    Delete
                  </button>
                </li>
              ) : (
                <li key={p.id} className={styles.row}>
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
                  <button
                    className={styles.trash}
                    type="button"
                    aria-label={`Delete ${p.name}`}
                    title="Delete project"
                    onClick={() => setConfirmId(p.id)}
                  >
                    <TrashIcon />
                  </button>
                </li>
              )
            )}
          </ul>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.divider} aria-hidden="true" />
          <button className={`${styles.item} ${styles.create}`} type="button" onClick={startCreate}>
            <span className={styles.itemMark}>
              <PlusIcon />
            </span>
            <span className={styles.itemText}>
              <span className={styles.itemName}>New project</span>
            </span>
          </button>
        </div>
      )}

      {open && mode === "create" && (
        <CreateProjectForm
          className={styles.menu}
          onBack={active ? () => setMode("list") : undefined}
          onCancel={close}
          onCreated={close}
        />
      )}
    </div>
  );
}
