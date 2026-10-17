"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SearchBar.module.css";

const ic = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

// layers / zap / git-branch / play
const FILTERS = [
  { id: "All", Icon: () => <svg {...ic}><path d="m12 2 9 4.5-9 4.5-9-4.5z" /><path d="m3 12 9 4.5 9-4.5" /><path d="m3 17 9 4.5 9-4.5" /></svg> },
  { id: "Events", Icon: () => <svg {...ic}><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg> },
  { id: "Conditions", Icon: () => <svg {...ic}><circle cx="6" cy="18" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="6" r="3" /><path d="M6 9v6M18 9a9 9 0 0 1-9 9" /></svg> },
  { id: "Actions", Icon: () => <svg {...ic}><path d="m6 3 14 9-14 9z" /></svg> },
];

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

  const Current = FILTERS.find((f) => f.id === filter).Icon;

  return (
    <div className={styles.wrap} ref={ref}>
      <div className={styles.search} data-open={open || undefined}>
        <SearchIcon />
        <input type="search" placeholder="Search" aria-label="Search" autoComplete="off" spellCheck={false} />
        {/* filter chip inside the field */}
        <button className={styles.chip} data-open={open || undefined} type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} aria-label={`Filter: ${filter}`}>
          <Current />
          {filter}
          <span className={styles.chevron}>
            <ChevronIcon />
          </span>
        </button>
      </div>

      {open && (
        <div className={styles.menu} role="menu">
          {FILTERS.map(({ id: f, Icon }) => (
            <button key={f} className={styles.item} type="button" role="menuitemradio" aria-checked={filter === f} data-on={filter === f || undefined} onClick={() => (setFilter(f), setOpen(false))}>
              <span className={styles.icon}>
                <Icon />
              </span>
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
  );
}
