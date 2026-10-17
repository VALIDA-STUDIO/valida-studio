"use client";

import { useState, useTransition } from "react";
import { saveVariables } from "../projects/variables";
import NodeSelect from "./NodeSelect";
import styles from "./editor.module.css";

export const VAR_TYPES = [
  { id: "number", label: "Number" },
  { id: "text", label: "Text" },
  { id: "boolean", label: "Yes / no" },
];
const newId = () => "v_" + Math.random().toString(36).slice(2, 8);

// Tells every open piece of the editor that the project's variables changed.
export const announceVariables = (variables) => window.dispatchEvent(new CustomEvent("valida:variables", { detail: variables }));

// Small form to create or edit one variable. Saves the whole list on the project.
export default function VariableForm({ projectId, variables, initial, onDone, onCancel, compact = false }) {
  const [v, setV] = useState(initial ?? { id: newId(), name: "", type: "number", perPlayer: true, default: "0", persist: true });
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const editing = !!initial;
  const set = (patch) => setV((x) => ({ ...x, ...patch }));

  const submit = (e) => {
    e.preventDefault();
    if (!v.name) return setError("Name is required");
    const list = editing ? variables.map((x) => (x.id === v.id ? v : x)) : [...variables, v];
    startTransition(async () => {
      const res = await saveVariables({ projectId, variables: list });
      if (res?.error) {
        const idx = list.findIndex((x) => x.id === v.id);
        return setError(res.errors?.[idx] ?? res.error);
      }
      announceVariables(res.variables);
      onDone?.(res.variables.find((x) => x.id === v.id) ?? v);
    });
  };
  const remove = () =>
    startTransition(async () => {
      const res = await saveVariables({ projectId, variables: variables.filter((x) => x.id !== v.id) });
      if (res?.error) return setError(res.error);
      announceVariables(res.variables);
      onDone?.(null);
    });

  return (
    <form className={`${styles.varForm} nodrag nowheel`} data-compact={compact || undefined} onSubmit={submit}>
      <label className={styles.condField} data-wide="">
        <span className={styles.nodeLabel}>Name</span>
        <input className={`${styles.nodeInput} ${styles.nodeCode}`} value={v.name} onChange={(e) => (setError(""), set({ name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 32) }))} placeholder="kills" autoFocus autoComplete="off" spellCheck={false} aria-label="Variable name" />
      </label>
      <div className={styles.varFormRow}>
        <div className={styles.condField}>
          <span className={styles.nodeLabel}>Type</span>
          <NodeSelect value={v.type} options={VAR_TYPES} onChange={(t) => set({ type: t, default: t === "boolean" ? "false" : t === "number" ? "0" : "" })} label="Variable type" compact />
        </div>
        <label className={styles.condField}>
          <span className={styles.nodeLabel}>Default</span>
          {v.type === "boolean" ? (
            <NodeSelect value={v.default} options={[{ id: "false", label: "no" }, { id: "true", label: "yes" }]} onChange={(d) => set({ default: d })} label="Default" compact />
          ) : (
            <input className={`${styles.nodeInput} ${v.type === "number" ? styles.nodeCode : ""}`} value={v.default} onChange={(e) => set({ default: v.type === "number" ? e.target.value.replace(/[^0-9.-]/g, "") : e.target.value })} placeholder={v.type === "number" ? "0" : "none"} autoComplete="off" aria-label="Default" />
          )}
        </label>
      </div>
      <label className={`${styles.nodeToggle} nodrag`}>
        <input type="checkbox" checked={!!v.perPlayer} onChange={(e) => set({ perPlayer: e.target.checked })} />
        <span className={styles.nodeToggleBox} aria-hidden="true" />
        One value per player
      </label>
      <label className={`${styles.nodeToggle} nodrag`}>
        <input type="checkbox" checked={!!v.persist} onChange={(e) => set({ persist: e.target.checked })} />
        <span className={styles.nodeToggleBox} aria-hidden="true" />
        Keep after restart
      </label>
      {error && <span className={styles.varFormError}>{error}</span>}
      <div className={styles.varFormActions}>
        {editing && (
          <button className={styles.varFormDanger} type="button" onClick={remove} disabled={pending}>
            Delete
          </button>
        )}
        <span style={{ flex: 1 }} />
        <button className={styles.varFormGhost} type="button" onClick={onCancel} disabled={pending}>
          Cancel
        </button>
        <button className={styles.varFormPrimary} type="submit" disabled={pending || !v.name}>
          {pending ? "Saving…" : editing ? "Save" : "Create"}
        </button>
      </div>
    </form>
  );
}
