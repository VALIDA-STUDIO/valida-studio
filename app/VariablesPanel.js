"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VariableForm, { VAR_TYPES } from "./editor/VariableForm";
import styles from "./SearchBar.module.css";

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

// Sidebar list of the project's variables: click one to edit, "New variable" to add.
export default function VariablesPanel({ projectId, initial, query }) {
  const router = useRouter();
  const [vars, setVars] = useState(initial ?? []);
  const [editing, setEditing] = useState(null); // "new" | variable id | null

  // stay in sync with changes made from a block or another panel
  useEffect(() => {
    const on = (e) => {
      setVars(e.detail);
      router.refresh();
    };
    window.addEventListener("valida:variables", on);
    return () => window.removeEventListener("valida:variables", on);
  }, [router]);

  if (!projectId) return <p className={styles.blocksEmpty}>Create a project first.</p>;
  const shown = vars.filter((v) => v.name.includes((query ?? "").trim().toLowerCase()));

  return (
    <div className={styles.vars}>
      {editing === "new" && <VariableForm projectId={projectId} variables={vars} onDone={() => setEditing(null)} onCancel={() => setEditing(null)} />}
      {editing !== "new" && (
        <button className={styles.varNew} type="button" onClick={() => setEditing("new")}>
          <PlusIcon />
          New variable
        </button>
      )}
      {vars.length === 0 && editing !== "new" && <p className={styles.blocksEmpty}>No variables yet.</p>}
      {vars.length > 0 && shown.length === 0 && <p className={styles.blocksEmpty}>Nothing matches.</p>}
      <ul className={styles.varList}>
        {shown.map((v) =>
          editing === v.id ? (
            <li key={v.id}>
              <VariableForm projectId={projectId} variables={vars} initial={v} onDone={() => setEditing(null)} onCancel={() => setEditing(null)} />
            </li>
          ) : (
            <li key={v.id}>
              <button className={styles.varRow} type="button" onClick={() => setEditing(v.id)} title="Edit">
                <span className={styles.varName}>{`{var.${v.name}}`}</span>
                <span className={styles.varMeta}>
                  {VAR_TYPES.find((t) => t.id === v.type)?.label ?? v.type}
                  {v.perPlayer ? " · per player" : ""}
                </span>
              </button>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
