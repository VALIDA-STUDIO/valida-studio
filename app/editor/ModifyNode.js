"use client";

import { memo, useRef, useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useVars, useUpstreamEvent } from "./useVars";
import VarChips from "./VarChips";
import NodeSelect from "./NodeSelect";
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

// Modify event: changes things on the event upstream. Rows are the event's setters you added.
function ModifyNode({ id, data, selected }) {
  const { updateNodeData } = useReactFlow();
  const event = useUpstreamEvent(id);
  const vars = useVars(id);
  const values = data.values ?? {};
  const added = Object.keys(values).filter((k) => event?.setters.some((s) => s.key === k));
  const available = (event?.setters ?? []).filter((s) => !added.includes(s.key));
  const last = useRef(null);
  const [adding, setAdding] = useState(false);

  const set = (key, v) => updateNodeData(id, { values: { ...values, [key]: v } });
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
        {event && <span className={styles.nodeMono}>{event.paper}</span>}
      </div>
      <div className={styles.nodeBody}>
        {!event && <span className={styles.nodeText}>Connect it after an event to see what can be changed.</span>}

        {added.map((key) => {
          const s = event.setters.find((x) => x.key === key);
          return (
            <div key={key} className={styles.modRow}>
              {s.toggle ? (
                <label className={`${styles.nodeToggle} nodrag`}>
                  <input type="checkbox" checked={!!values[key]} onChange={(e) => set(key, e.target.checked)} />
                  <span className={styles.nodeToggleBox} aria-hidden="true" />
                  {s.label}
                </label>
              ) : (
                <label className={styles.condField} data-wide="">
                  <span className={styles.nodeLabel}>{s.label}</span>
                  <input
                    className={`${styles.nodeInput} nodrag`}
                    data-key={key}
                    value={values[key] ?? ""}
                    onChange={(e) => set(key, e.target.value)}
                    onFocus={(e) => (last.current = e.target)}
                    placeholder={s.placeholder}
                    autoComplete="off"
                    spellCheck={false}
                    aria-label={s.label}
                  />
                </label>
              )}
              <button className={`${styles.modRemove} nodrag`} type="button" aria-label={`Remove ${s.label}`} onClick={() => remove(key)}>
                <XIcon />
              </button>
            </div>
          );
        })}

        {event && available.length > 0 && (
          <div className={styles.modAdd}>
            {adding ? (
              <NodeSelect
                value=""
                options={[{ id: "", label: "Choose what to change" }, ...available.map((s) => ({ id: s.key, label: s.label }))]}
                onChange={(key) => {
                  if (!key) return;
                  const s = event.setters.find((x) => x.key === key);
                  set(key, s.toggle ? true : "");
                  setAdding(false);
                }}
                label="What to change"
              />
            ) : (
              <button className={`${styles.add} nodrag`} type="button" onClick={() => setAdding(true)}>
                <PlusIcon />
                Add
              </button>
            )}
          </div>
        )}

        {vars.length > 0 && added.some((k) => event.setters.find((s) => s.key === k)?.vars) && <VarChips vars={vars} onInsert={insert} />}
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
