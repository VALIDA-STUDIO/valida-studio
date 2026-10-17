"use client";

import { memo, useRef } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { ACTIONS } from "./actions";
import { useVars } from "./useVars";
import VarChips from "./VarChips";
import styles from "./editor.module.css";

const ic = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
export const ACTION_ICONS = {
  megaphone: (p) => <svg {...ic} {...p}><path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>,
  message: (p) => <svg {...ic} {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  ban: (p) => <svg {...ic} {...p}><circle cx="12" cy="12" r="10" /><path d="m4.9 4.9 14.2 14.2" /></svg>,
};

// An action: its fields, variable chips that insert into the field last used, one "then" output.
function ActionNode({ id, data, selected }) {
  const { updateNodeData } = useReactFlow();
  const def = ACTIONS[data.action] ?? ACTIONS.broadcast;
  const values = data.values ?? {};
  const vars = useVars(id);
  const last = useRef(null);
  const Icon = ACTION_ICONS[def.icon];

  const set = (key, v) => updateNodeData(id, { values: { ...values, [key]: v } });
  const insert = (path) => {
    const el = last.current;
    const key = el?.dataset.key ?? def.fields.find((f) => f.vars)?.key;
    if (!key) return;
    const text = values[key] ?? "";
    const same = el?.dataset.key === key;
    const start = same ? el.selectionStart : text.length;
    const end = same ? el.selectionEnd : text.length;
    const token = `{${path}}`;
    set(key, text.slice(0, start) + token + text.slice(end));
    requestAnimationFrame(() => {
      if (same) {
        el.focus();
        el.setSelectionRange(start + token.length, start + token.length);
      }
    });
  };

  return (
    <div className={styles.node} data-kind="action" data-selected={selected || undefined}>
      <Handle type="target" position={Position.Left} className={styles.handle} />
      <div className={styles.nodeHead}>
        <span className={`${styles.nodeBadge} ${styles.nodeBadgeAction}`} data-kind="action">
          {Icon && <Icon />}
        </span>
        <span className={styles.nodeKind}>{def.label}</span>
      </div>
      {(def.fields.length > 0 || def.note) && (
        <div className={styles.nodeBody}>
          {def.fields.map((f, i) => (
            <label key={f.key} className={styles.condField} data-wide="" style={i ? { marginTop: 10 } : undefined}>
              <span className={styles.nodeLabel}>{f.label}</span>
              {f.area ? (
                <textarea
                  className={`${styles.nodeTextarea} nodrag nowheel`}
                  data-key={f.key}
                  value={values[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  onFocus={(e) => (last.current = e.target)}
                  placeholder={f.placeholder}
                  maxLength={300}
                  rows={2}
                  spellCheck={false}
                />
              ) : (
                <input
                  className={`${styles.nodeInput} nodrag`}
                  data-key={f.key}
                  value={values[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  onFocus={(e) => (last.current = e.target)}
                  placeholder={f.placeholder}
                  autoComplete="off"
                  spellCheck={false}
                />
              )}
            </label>
          ))}
          {vars.length > 0 && def.fields.some((f) => f.vars) && <VarChips vars={vars} onInsert={insert} />}
        </div>
      )}
      <div className={styles.nodeOutputs}>
        <div className={styles.nodeOutput} data-flow="">
          <span>then</span>
          <Handle type="source" position={Position.Right} id="then" className={styles.handle} />
        </div>
      </div>
    </div>
  );
}

export default memo(ActionNode);
