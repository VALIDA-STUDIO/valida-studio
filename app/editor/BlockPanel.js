"use client";

import { BLOCKS } from "./blockDefs";
import { BLOCK_ICONS } from "./blockIcons";
import s from "../(app)/settings/settings.module.css";
import styles from "./editor.module.css";

// Right-hand panel for a selected building block: its fields and a remove button.
export default function BlockPanel({ node, onChange, onRemove }) {
  const def = BLOCKS[node.data.type];
  if (!def) return null;
  const values = node.data.values ?? {};
  const set = (key, v) => onChange({ ...node.data, values: { ...values, [key]: v } });
  const Icon = BLOCK_ICONS[node.data.type];

  return (
    <aside className={styles.inspector} aria-label="Block settings">
      <div className={styles.insHead}>
        <span className={styles.nodeIcon} data-kind={def.kind}>
          {Icon && <Icon size={15} />}
        </span>
        <span className={styles.insTitle}>{def.title}</span>
        <span className={styles.nodeKind} data-kind={def.kind}>
          {def.kind}
        </span>
      </div>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Settings</h3>
        {def.fields.map((f) => (
          <div key={f.key} className={styles.field}>
            <span className={styles.label}>{f.label}</span>
            <input
              className={`${styles.input} ${f.type === "number" ? styles.mono : ""}`}
              value={values[f.key] ?? ""}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              inputMode={f.type === "number" ? "decimal" : undefined}
              autoComplete="off"
              spellCheck={false}
              aria-label={f.label}
            />
            {f.hint && <span className={styles.argHint}>{f.hint}</span>}
          </div>
        ))}
      </section>

      <section className={`${styles.section} ${styles.danger}`}>
        <div className={styles.dangerRow}>
          <span className={styles.sectionText}>Remove this block and its connections.</span>
          <button className={s.btnDanger} type="button" onClick={onRemove}>
            Remove
          </button>
        </div>
      </section>
    </aside>
  );
}
