"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useVars, useUpstreamEvent } from "./useVars";
import VarChips from "./VarChips";
import MessageField from "./MessageField";
import styles from "./editor.module.css";

const WrenchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);
const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 5 5L20 7" />
  </svg>
);

// Modify event: changes on the event upstream. "Add" lists what the event allows; each pick is a row.
function ModifyNode({ id, data, selected }) {
  const { updateNodeData } = useReactFlow();
  const event = useUpstreamEvent(id);
  const vars = useVars(id);
  const values = data.values ?? {};
  const setters = event?.setters ?? [];
  const added = setters.filter((s) => values[s.key] !== undefined);
  const available = setters.filter((s) => values[s.key] === undefined);
  const last = useRef(null);
  const [open, setOpen] = useState(false);
  const menu = useRef(null);

  // the event above changed: drop changes that belong to another event
  useEffect(() => {
    if (!event) return;
    const stale = Object.keys(values).filter((k) => !setters.some((s) => s.key === k));
    if (!stale.length) return;
    const next = { ...values };
    for (const k of stale) delete next[k];
    updateNodeData(id, { values: next });
  }, [event, values, setters, id, updateNodeData]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !menu.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const set = (key, v) => updateNodeData(id, { values: { ...values, [key]: v } });
  const add = (s) => {
    const next = { ...values };
    for (const k of s.excludes ?? []) delete next[k];
    next[s.key] = s.toggle ? true : "";
    updateNodeData(id, { values: next });
    setOpen(false);
  };
  const remove = (key) => {
    const next = { ...values };
    delete next[key];
    updateNodeData(id, { values: next });
  };
  const insert = (path) => {
    const el = last.current;
    if (!el) return;
    const key = el.dataset.key;
    const text = values[key] ?? "";
    const token = `{${path}}`;
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    set(key, text.slice(0, start) + token + text.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    });
  };

  return (
    <div className={styles.node} data-kind="action" data-selected={selected || undefined}>
      <Handle type="target" position={Position.Left} className={styles.handle} />
      <div className={styles.nodeHead}>
        <span className={`${styles.nodeBadge} ${styles.nodeBadgeAction}`} data-kind="action">
          <WrenchIcon />
        </span>
        <span className={styles.nodeKind}>Modify event</span>
      </div>
      <div className={styles.nodeBody}>
        {!event && <span className={styles.nodeText}>Connect it after an event.</span>}

        {added.length > 0 && (
          <div className={styles.modList}>
            {added.map((s) => (
              <div key={s.key} className={styles.modItem}>
                <div className={styles.modHead}>
                  {s.toggle && (
                    <span className={styles.modCheck}>
                      <CheckIcon />
                    </span>
                  )}
                  <span className={styles.modLabel}>{s.label}</span>
                  <button className={`${styles.modRemove} nodrag`} type="button" aria-label={`Remove ${s.label}`} onClick={() => remove(s.key)}>
                    <XIcon />
                  </button>
                </div>
                {s.text && <MessageField value={values[s.key]} onChange={(v) => set(s.key, v)} placeholder={s.placeholder} dataKey={s.key} onFocus={(e) => (last.current = e.target)} label={`${s.label} text`} />}
              </div>
            ))}
          </div>
        )}

        {event && available.length > 0 && (
          <div className={styles.modAdd} ref={menu}>
            <button className={`${styles.add} nodrag`} type="button" data-open={open || undefined} onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open}>
              <PlusIcon />
              {added.length ? "Add another" : "Add a change"}
            </button>
            {open && (
              <div className={styles.pickerMenu} role="menu">
                {available.map((s) => (
                  <button key={s.key} className={styles.pickerItem} type="button" role="menuitem" onClick={() => add(s)}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {vars.length > 0 && added.some((s) => s.vars) && <VarChips vars={vars} onInsert={insert} />}
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

export default memo(ModifyNode);
