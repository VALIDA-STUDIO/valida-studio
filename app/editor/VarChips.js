"use client";

import { useEffect, useRef, useState } from "react";
import { TYPES } from "./types";
import styles from "./editor.module.css";

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const BackIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

// Variables as chips. A chip inserts {name}; chips with properties open a menu to build a path
// like {player.inventory.slot(1).type}.
export default function VarChips({ vars, onInsert }) {
  const [open, setOpen] = useState(null); // { path: ["player"], type: "Player" }
  const [arg, setArg] = useState(""); // number for slot(n)
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(null);
    const onKey = (e) => e.key === "Escape" && setOpen(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const insert = (path) => {
    onInsert(path.join("."));
    setOpen(null);
    setArg("");
  };
  const go = (key, prop) => {
    const seg = prop.arg ? `${key}(${arg === "" ? prop.arg.placeholder : arg})` : key;
    const path = [...open.path, seg];
    if (prop.type && TYPES[prop.type]) setOpen({ path, type: prop.type, parent: open });
    else insert(path);
  };

  return (
    <div className={styles.vars} ref={ref}>
      {vars.map((v) => {
        const hasProps = !!TYPES[v.type];
        return (
          <button
            key={v.id}
            className={`${styles.var} ${styles.varBtn} nodrag`}
            type="button"
            data-open={open?.path[0] === v.id || undefined}
            onClick={() => (hasProps ? setOpen(open?.path[0] === v.id ? null : { path: [v.id], type: v.type }) : insert([v.id]))}
            title={hasProps ? `${v.type}: click for properties` : "Insert"}
          >
            {`{${v.id}}`}
            {hasProps && <ChevronIcon />}
          </button>
        );
      })}

      {open && (
        <div className={`${styles.varMenu} nodrag nowheel`} role="menu">
          <div className={styles.varMenuHead}>
            {open.parent && (
              <button className={styles.varBack} type="button" onClick={() => setOpen(open.parent)} aria-label="Back">
                <BackIcon />
              </button>
            )}
            <span className={styles.varPath}>{`{${open.path.join(".")}}`}</span>
            <span className={styles.varType}>{open.type}</span>
          </div>
          <button className={`${styles.varItem} ${styles.varUse}`} type="button" role="menuitem" onClick={() => insert(open.path)}>
            <span className={styles.varKey}>{`{${open.path.join(".")}}`}</span>
            <span className={styles.varType}>use this</span>
          </button>
          <div className={styles.varSep} />
          {Object.entries(TYPES[open.type]).map(([key, prop]) => (
            <div key={key} className={styles.varRow}>
              {prop.arg && (
                <input
                  className={styles.varArg}
                  value={arg}
                  onChange={(e) => setArg(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
                  placeholder={prop.arg.placeholder}
                  inputMode="numeric"
                  aria-label={prop.arg.label}
                />
              )}
              <button className={styles.varItem} type="button" role="menuitem" onClick={() => go(key, prop)}>
                <span className={styles.varKey}>{prop.arg ? `${key}(${arg === "" ? prop.arg.placeholder : arg})` : key}</span>
                {prop.type && <span className={styles.varType}>{prop.type}</span>}
                {prop.type && <ChevronIcon />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
