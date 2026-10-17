"use client";

import { useState } from "react";
import styles from "./ProjectsNav.module.css";

// Example projects; selecting one only highlights it for now.
const PROJECTS = [
  { id: "p1", name: "Lobby Tools" },
  { id: "p2", name: "Survival Core" },
];

const CubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m21 16-9 5-9-5V8l9-5 9 5z" />
    <path d="m3 8 9 5 9-5M12 13v8" />
  </svg>
);

export default function ProjectsNav() {
  const [active, setActive] = useState(PROJECTS[0].id);

  return (
    <nav className={styles.nav} aria-label="Projects">
      <span className={styles.label}>Projects</span>
      {PROJECTS.map((p) => (
        <button key={p.id} className={styles.item} type="button" data-active={active === p.id || undefined} aria-pressed={active === p.id} onClick={() => setActive(p.id)}>
          <span className={styles.icon}>
            <CubeIcon />
          </span>
          <span className={styles.name}>{p.name}</span>
        </button>
      ))}
    </nav>
  );
}
