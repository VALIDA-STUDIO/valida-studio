"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./editor.module.css";

const ChevronIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 5 5L20 7" />
  </svg>
);

// Our dropdown for fields inside nodes. options: [{ id, label }]. `mono` for class names.
export default function NodeSelect({ value, options, onChange, label, mono = false, compact = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = options.find((o) => o.id === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`${styles.picker} nodrag nopan`} data-compact={compact || undefined} ref={ref}>
      <button className={styles.pickerTrigger} data-open={open || undefined} type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} aria-label={label}>
        <span className={styles.pickerValue} data-mono={mono || undefined}>
          {current.label}
        </span>
        <span className={styles.pickerChevron}>
          <ChevronIcon />
        </span>
      </button>
      {open && (
        <div className={styles.pickerMenu} role="menu">
          {options.map((o) => (
            <button key={o.id} className={styles.pickerItem} data-mono={mono || undefined} type="button" role="menuitemradio" aria-checked={o.id === current.id} data-on={o.id === current.id || undefined} onClick={() => (onChange(o.id), setOpen(false))}>
              {o.label}
              {o.id === current.id && (
                <span className={styles.pickerCheck}>
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
