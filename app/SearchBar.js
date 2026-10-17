"use client";

import { useState } from "react";
import styles from "./SearchBar.module.css";

const FILTERS = ["All", "Events", "Conditions", "Actions"];

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

// Sidebar search + kind filter; neither does anything yet.
export default function SearchBar() {
  const [filter, setFilter] = useState("All");

  return (
    <div className={styles.wrap}>
      <label className={styles.search}>
        <SearchIcon />
        <input type="search" placeholder="Search" aria-label="Search" autoComplete="off" spellCheck={false} />
        <kbd className={styles.kbd}>⌘K</kbd>
      </label>

      <div className={styles.seg} role="radiogroup" aria-label="Filter">
        {FILTERS.map((f) => (
          <button key={f} className={styles.segItem} type="button" role="radio" aria-checked={filter === f} data-on={filter === f || undefined} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
