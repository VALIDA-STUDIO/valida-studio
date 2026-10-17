"use client";

import { memo, useRef } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { ACTIONS } from "./actions";
import { useVars, useProjectVars } from "./useVars";
import VarChips from "./VarChips";
import MessageField from "./MessageField";
import NodeSelect from "./NodeSelect";
import styles from "./editor.module.css";

const ic = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
export const ACTION_ICONS = {
  megaphone: (p) => <svg {...ic} {...p}><circle cx="12" cy="12" r="2" /><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19.1 4.9a10 10 0 0 1 0 14.2M4.9 19.1a10 10 0 0 1 0-14.2" /></svg>,
  message: (p) => <svg {...ic} {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  variable: (p) => <svg {...ic} {...p}><rect x="3" y="4" width="18" height="16" rx="3" /><path d="m8 9 2 3-2 3M12 9l2 3-2 3" /></svg>,
  dice: (p) => <svg {...ic} {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1" /><circle cx="16" cy="8" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="8" cy="16" r="1" /><circle cx="16" cy="16" r="1" /></svg>,
  wrench: (p) => <svg {...ic} {...p}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
};

// An action: its fields, variable chips that insert into the field last used, one "then" output.
function ActionNode({ id, data, selected }) {
  const { updateNodeData } = useReactFlow();
  const def = ACTIONS[data.action] ?? ACTIONS.broadcast;
  const values = data.values ?? {};
  const vars = useVars(id);
  const projectVars = useProjectVars();
  const last = useRef(null);
  const Icon = ACTION_ICONS[def.icon];
  const fields = def.fields.filter((f) => !f.when || Object.entries(f.when).every(([k, allowed]) => allowed.includes(values[k] ?? def.fields.find((x) => x.key === k)?.select?.[0])));

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
          {fields.map((f, i) =>
            f.variable ? (
              <div key={f.key} className={styles.condField} data-wide="" style={i ? { marginTop: 10 } : undefined}>
                <span className={styles.nodeLabel}>{f.label}</span>
                {projectVars.length ? (
                  <NodeSelect value={values[f.key] ?? ""} options={[{ id: "", label: "Choose a variable" }, ...projectVars.map((v) => ({ id: v.name, label: `${v.name}  ·  ${v.type}${v.perPlayer ? ", per player" : ""}` }))]} onChange={(v) => set(f.key, v)} label={f.label} />
                ) : (
                  <span className={styles.nodeText}>No variables yet. Add them in Project Settings.</span>
                )}
              </div>
            ) : f.toggle ? (
              <label key={f.key} className={`${styles.nodeToggle} nodrag`}>
                <input type="checkbox" checked={!!values[f.key]} onChange={(e) => set(f.key, e.target.checked)} />
                <span className={styles.nodeToggleBox} aria-hidden="true" />
                {f.label}
              </label>
            ) : f.select ? (
              <div key={f.key} className={styles.condField} data-wide="" style={i ? { marginTop: 10 } : undefined}>
                <span className={styles.nodeLabel}>{f.label}</span>
                <NodeSelect value={values[f.key] ?? f.select[0]} options={f.select.map((o) => ({ id: o, label: o }))} onChange={(v) => set(f.key, v)} label={f.label} compact />
              </div>
            ) : (
            <label key={f.key} className={styles.condField} data-wide="" style={i ? { marginTop: 10 } : undefined}>
              <span className={styles.nodeLabel}>{f.label}</span>
              {f.area ? (
                <MessageField value={values[f.key]} onChange={(v) => set(f.key, v)} placeholder={f.placeholder} dataKey={f.key} onFocus={(e) => (last.current = e.target)} label={f.label} />
              ) : (
                <input
                  className={`${styles.nodeInput} ${f.code ? styles.nodeCode : ""} nodrag`}
                  data-key={f.key}
                  value={values[f.key] ?? ""}
                  onChange={(e) => set(f.key, f.number ? e.target.value.replace(/[^0-9.-]/g, "") : f.code ? e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") : e.target.value)}
                  onFocus={(e) => (last.current = e.target)}
                  placeholder={f.placeholder}
                  inputMode={f.number ? "decimal" : undefined}
                  autoComplete="off"
                  spellCheck={false}
                />
              )}
            </label>
            )
          )}
          {vars.length > 0 && fields.some((f) => f.vars) && <VarChips vars={vars} onInsert={insert} />}
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
