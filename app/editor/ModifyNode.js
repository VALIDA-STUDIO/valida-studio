"use client";

import { memo, useRef } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useVars, useUpstreamEvent } from "./useVars";
import VarChips from "./VarChips";
import styles from "./editor.module.css";

const WrenchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

// Modify event: every setting of the event upstream as a row with a switch; on = applied.
function ModifyNode({ id, data, selected }) {
  const { updateNodeData } = useReactFlow();
  const event = useUpstreamEvent(id);
  const vars = useVars(id);
  const values = data.values ?? {};
  const setters = event?.setters ?? [];
  const last = useRef(null);

  const on = (key) => values[key] !== undefined && values[key] !== false;
  const set = (key, v) => updateNodeData(id, { values: { ...values, [key]: v } });
  // switching a setting on turns off the ones it conflicts with (hide vs. custom message)
  const toggle = (s) => {
    const next = { ...values };
    if (on(s.key)) delete next[s.key];
    else {
      for (const k of s.excludes ?? []) delete next[k];
      next[s.key] = s.toggle ? true : "";
    }
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

        {setters.map((s) => (
          <div key={s.key} className={styles.modRow} data-on={on(s.key) || undefined}>
            <label className={`${styles.switchRow} nodrag`}>
              <input type="checkbox" checked={on(s.key)} onChange={() => toggle(s)} aria-label={s.label} />
              <span className={styles.switch} aria-hidden="true" />
              <span className={styles.switchLabel}>{s.label}</span>
            </label>
            {s.text && on(s.key) && (
              <input
                className={`${styles.nodeInput} nodrag`}
                data-key={s.key}
                value={values[s.key] ?? ""}
                onChange={(e) => set(s.key, e.target.value)}
                onFocus={(e) => (last.current = e.target)}
                placeholder={s.placeholder}
                autoComplete="off"
                spellCheck={false}
                aria-label={`${s.label} text`}
              />
            )}
          </div>
        ))}

        {vars.length > 0 && setters.some((s) => s.vars && on(s.key)) && <VarChips vars={vars} onInsert={insert} />}
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
