"use client";

import { useState } from "react";
import ProjectIcon, { ICON_NAMES } from "./ProjectIcon";
import styles from "./IconPicker.module.css";

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

// Searchable, scrollable icon grid. `value` is the selected icon name.
export default function IconPicker({ value, onChange, rows = 4 }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const names = q ? ICON_NAMES.filter((n) => n.includes(q)) : ICON_NAMES;

  return (
    <div className={styles.picker}>
      <label className={styles.search}>
        <SearchIcon />
        <input
          type="search"
          placeholder={`Search ${ICON_NAMES.length} icons`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          aria-label="Search icons"
        />
      </label>

      <div className={styles.grid} style={{ "--rows": rows }} role="radiogroup" aria-label="Icon">
        {names.map((n) => (
          <button
            key={n}
            className={styles.cell}
            data-active={n === value || undefined}
            type="button"
            role="radio"
            aria-checked={n === value}
            aria-label={n}
            title={n}
            onClick={() => onChange(n)}
          >
            <ProjectIcon icon={n} />
          </button>
        ))}
        {!names.length && <p className={styles.none}>No icon matches “{query}”.</p>}
      </div>
    </div>
  );
}
