"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import ProjectIcon from "./ProjectIcon";
import { createProject } from "./projects/actions";
import styles from "./ProjectSwitcher.module.css";

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

// Project name form. Used inside the project switcher.
export default function CreateProjectForm({ className, title = "New project", onBack, onCancel, onCreated }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const nameInput = useRef(null);

  useEffect(() => nameInput.current?.focus(), []);

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      const res = await createProject({ name });
      if (res?.error) setError(res.error);
      else onCreated?.(res.id);
    });
  };

  return (
    <form className={className} onSubmit={submit}>
      {(title || onBack) && (
        <div className={styles.formHead}>
          {onBack && (
            <button className={styles.back} type="button" onClick={onBack} aria-label="Back">
              <BackIcon />
            </button>
          )}
          <span className={styles.formTitle}>{title}</span>
        </div>
      )}

      <div className={styles.nameRow}>
        <span className={styles.previewMark}>
          <ProjectIcon />
        </span>
        <input
          ref={nameInput}
          className={styles.input}
          type="text"
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          autoComplete="off"
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.formFoot}>
        {onCancel && (
          <button className={styles.btnGhost} type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className={styles.btnPrimary} type="submit" disabled={!name.trim() || pending}>
          {pending ? "Creating…" : "Create project"}
        </button>
      </div>
    </form>
  );
}
