"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SearchBar.module.css";

const FILTERS = ["All", "Events", "Conditions", "Actions"];

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 5 5L20 7" />
  </svg>
);

// Sidebar search + a kind filter dropdown; neither does anything yet.
export default function SearchBar() {
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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

  return (
    <div className={styles.wrap}>
      <label className={styles.search}>
        <SearchIcon />
        <input type="search" placeholder="Search" aria-label="Search" autoComplete="off" spellCheck={false} />
        <kbd className={styles.kbd}>⌘K</kbd>
      </label>

      <div className={styles.dropdown} ref={ref}>
        <button className={styles.trigger} data-open={open || undefined} type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open}>
          <span className={styles.triggerLabel}>Show</span>
          <span className={styles.triggerValue}>{filter}</span>
          <span className={styles.chevron}>
            <ChevronIcon />
          </span>
        </button>

        {open && (
          <div className={styles.menu} role="menu">
            {FILTERS.map((f) => (
              <button key={f} className={styles.item} type="button" role="menuitemradio" aria-checked={filter === f} data-on={filter === f || undefined} onClick={() => (setFilter(f), setOpen(false))}>
                {f}
                {filter === f && (
                  <span className={styles.check}>
                    <CheckIcon />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
