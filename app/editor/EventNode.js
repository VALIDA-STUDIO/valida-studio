"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { EVENTS, DEFAULT_EVENT } from "./events";
import styles from "./editor.module.css";

const BoltIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  </svg>
);
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

// Event picker: the Paper event class, chosen from a dropdown inside the node.
function EventPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`${styles.picker} nodrag nopan`} ref={ref}>
      <button className={styles.pickerTrigger} data-open={open || undefined} type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} aria-label="Event">
        <span className={styles.pickerValue}>{EVENTS[value].paper}</span>
        <span className={styles.pickerChevron}>
          <ChevronIcon />
        </span>
      </button>
      {open && (
        <div className={styles.pickerMenu} role="menu">
          {Object.values(EVENTS).map((e) => (
            <button key={e.id} className={styles.pickerItem} type="button" role="menuitemradio" aria-checked={e.id === value} data-on={e.id === value || undefined} onClick={() => (onChange(e.id), setOpen(false))}>
              {e.paper}
              {e.id === value && (
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

// An event: pick which one in the node; one "then" output. Its variables show up in the blocks it feeds.
function EventNode({ id, data, selected }) {
  const { updateNodeData } = useReactFlow();
  const event = EVENTS[data.event] ?? EVENTS[DEFAULT_EVENT];

  return (
    <div className={styles.node} data-selected={selected || undefined}>
      <div className={styles.nodeHead}>
        <span className={`${styles.nodeBadge} ${styles.nodeBadgeAction}`}>
          <BoltIcon />
        </span>
        <span className={styles.nodeKind}>Event</span>
      </div>
      <div className={styles.nodeBody}>
        <EventPicker value={event.id} onChange={(v) => updateNodeData(id, { event: v })} />
      </div>
      <div className={styles.nodeOutputs}>
        <div className={styles.nodeOutput} data-flow="">
          <span>then</span>
          <Handle type="source" position={Position.Right} id="then" className={styles.handle} />
        </div>
      </div>
    </div>
  );
}

export default memo(EventNode);
