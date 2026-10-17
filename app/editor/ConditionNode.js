"use client";

import { memo, useRef } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { CONDITIONS } from "./conditions";
import { useVars } from "./useVars";
import VarChips from "./VarChips";
import styles from "./editor.module.css";

const BranchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M6 9v6M18 9a9 9 0 0 1-9 9" />
  </svg>
);

// A condition: fields on top, yes / no outputs. Variable chips insert into the field last used.
function ConditionNode({ id, data, selected }) {
  const { updateNodeData } = useReactFlow();
  const def = CONDITIONS[data.cond] ?? CONDITIONS.compare;
  const values = data.values ?? {};
  const vars = useVars(id);
  const last = useRef(null); // the input that had focus last

  const set = (key, v) => updateNodeData(id, { values: { ...values, [key]: v } });
  const insert = (path) => {
    const el = last.current;
    const key = el?.dataset.key ?? def.fields.find((f) => f.vars)?.key;
    if (!key) return;
    const text = values[key] ?? "";
    const start = el?.dataset.key === key ? el.selectionStart : text.length;
    const end = el?.dataset.key === key ? el.selectionEnd : text.length;
    const token = `{${path}}`;
    set(key, text.slice(0, start) + token + text.slice(end));
    requestAnimationFrame(() => {
      if (el?.dataset.key === key) {
        el.focus();
        el.setSelectionRange(start + token.length, start + token.length);
      }
    });
  };

  return (
    <div className={styles.node} data-kind="condition" data-selected={selected || undefined}>
      <Handle type="target" position={Position.Left} className={styles.handle} />
      <div className={styles.nodeHead}>
        <span className={`${styles.nodeBadge} ${styles.nodeBadgeAction}`} data-kind="condition">
          <BranchIcon />
        </span>
        <span className={styles.nodeKind}>{def.label}</span>
      </div>
      <div className={styles.nodeBody}>
        <div className={styles.condRow}>
          {def.fields.map((f) =>
            f.select ? (
              <select key={f.key} className={`${styles.condSelect} nodrag`} value={values[f.key] ?? f.select[0]} onChange={(e) => set(f.key, e.target.value)} aria-label="Comparison">
                {f.select.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <label key={f.key} className={styles.condField} data-wide={f.vars || undefined}>
                {f.label && <span className={styles.nodeLabel}>{f.label}</span>}
                <input
                  className={`${styles.nodeInput} nodrag`}
                  data-key={f.key}
                  value={values[f.key] ?? ""}
                  onChange={(e) => set(f.key, f.number ? e.target.value.replace(/[^0-9.-]/g, "") : e.target.value)}
                  onFocus={(e) => (last.current = e.target)}
                  placeholder={f.placeholder}
                  inputMode={f.number ? "decimal" : undefined}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label={f.label || f.key}
                />
              </label>
            )
          )}
        </div>
        {vars.length > 0 && def.fields.some((f) => f.vars) && <VarChips vars={vars} onInsert={insert} />}
      </div>
      <div className={styles.nodeOutputs}>
        <div className={styles.nodeOutput} data-flow="">
          <span>yes</span>
          <Handle type="source" position={Position.Right} id="yes" className={styles.handle} />
        </div>
        <div className={styles.nodeOutput} data-flow="">
          <span>no</span>
          <Handle type="source" position={Position.Right} id="no" className={styles.handle} />
        </div>
      </div>
    </div>
  );
}

export default memo(ConditionNode);
