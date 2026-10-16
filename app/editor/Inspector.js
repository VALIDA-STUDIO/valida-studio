"use client";

import ChipsInput from "../ChipsInput";
import { ARG_GROUPS, ARG_TYPES, SENDERS, LIMITS, usage } from "../canvas/commandSchema";
import styles from "./editor.module.css";

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const Field = ({ label, error, children }) => (
  <div className={styles.field}>
    <span className={styles.label}>{label}</span>
    {children}
    {error && <span className={styles.err}>{error}</span>}
  </div>
);

// Right-hand panel: everything about the command that isn't a node yet.
export default function Inspector({ cmd, errors, onChange }) {
  const set = (key) => (v) => onChange({ ...cmd, [key]: v });
  const setArg = (i, patch) => onChange({ ...cmd, args: cmd.args.map((a, j) => (j === i ? { ...a, ...patch } : a)) });
  const removeArg = (i) => onChange({ ...cmd, args: cmd.args.filter((_, j) => j !== i) });
  const addArg = () => onChange({ ...cmd, args: [...cmd.args, { name: `arg${cmd.args.length + 1}`, type: "word", required: true }] });

  return (
    <aside className={styles.inspector} aria-label="Command settings">
      <div className={styles.insHead}>
        <span className={styles.usage}>{usage(cmd)}</span>
      </div>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Command</h3>

        <Field label="Name" error={errors.name}>
          <label className={styles.nameField} data-error={errors.name ? "" : undefined}>
            <span className={styles.slash}>/</span>
            <input className={styles.nameInput} value={cmd.name} onChange={(e) => set("name")(e.target.value)} maxLength={LIMITS.name} autoComplete="off" spellCheck={false} aria-label="Command name" />
          </label>
        </Field>

        <Field label="Description" error={errors.description}>
          <input className={styles.input} value={cmd.description} onChange={(e) => set("description")(e.target.value)} placeholder="Teleports you to a player." maxLength={LIMITS.description} autoComplete="off" aria-label="Description" />
        </Field>

        <Field label="Aliases" error={errors.aliases}>
          <ChipsInput size="sm" value={cmd.aliases} onChange={set("aliases")} placeholder="tp" max={LIMITS.aliases} label="Aliases" />
        </Field>

        <Field label="Permission" error={errors.permission}>
          <input className={`${styles.input} ${styles.mono}`} value={cmd.permission} onChange={(e) => set("permission")(e.target.value)} placeholder="lobby.teleport" maxLength={LIMITS.permission} autoComplete="off" spellCheck={false} aria-label="Permission" />
        </Field>

        <Field label="Who can run it">
          <div className={styles.seg} role="radiogroup" aria-label="Who can run it">
            {SENDERS.map((s) => (
              <button key={s.id} className={styles.segItem} type="button" role="radio" aria-checked={cmd.sender === s.id} data-on={cmd.sender === s.id || undefined} onClick={() => set("sender")(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </Field>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Arguments</h3>
        <p className={styles.sectionText}>What players type after the name, in order.</p>

        <div className={styles.args}>
          {cmd.args.map((a, i) => {
            const t = ARG_TYPES[a.type] ?? ARG_TYPES.word;
            const err = errors.args?.[i];
            return (
              <div key={i} className={styles.arg} data-error={err ? "" : undefined}>
                <div className={styles.argRow}>
                  <input className={`${styles.input} ${styles.mono} ${styles.argName}`} value={a.name} onChange={(e) => setArg(i, { name: e.target.value })} placeholder="player" maxLength={LIMITS.argName} autoComplete="off" spellCheck={false} aria-label={`Argument ${i + 1} name`} autoFocus={a.name === `arg${i + 1}`} />
                  <select className={`${styles.input} ${styles.select}`} value={a.type} onChange={(e) => setArg(i, { type: e.target.value })} aria-label={`Argument ${i + 1} type`}>
                    {ARG_GROUPS.map((g) => (
                      <optgroup key={g.group} label={g.group}>
                        {g.types.map((x) => (
                          <option key={x.id} value={x.id}>
                            {x.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button className={styles.argRemove} type="button" title="Remove" aria-label={`Remove argument ${i + 1}`} onClick={() => removeArg(i)}>
                    <XIcon />
                  </button>
                </div>
                <div className={styles.argRow}>
                  <div className={`${styles.seg} ${styles.segSm}`} role="radiogroup" aria-label={`Argument ${i + 1} required`}>
                    {[
                      ["Required", true],
                      ["Optional", false],
                    ].map(([label, req]) => (
                      <button key={label} className={styles.segItem} type="button" role="radio" aria-checked={(a.required !== false) === req} data-on={(a.required !== false) === req || undefined} onClick={() => setArg(i, { required: req })}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {t.bounds && (
                    <>
                      <input className={`${styles.input} ${styles.mono} ${styles.bound}`} value={a.min ?? ""} onChange={(e) => setArg(i, { min: e.target.value })} placeholder="min" inputMode="decimal" aria-label={`Argument ${i + 1} min`} />
                      <input className={`${styles.input} ${styles.mono} ${styles.bound}`} value={a.max ?? ""} onChange={(e) => setArg(i, { max: e.target.value })} placeholder="max" inputMode="decimal" aria-label={`Argument ${i + 1} max`} />
                    </>
                  )}
                </div>
                <span className={err ? styles.err : styles.argHint}>{err ?? t.hint ?? ""}</span>
              </div>
            );
          })}
        </div>

        {cmd.args.length < LIMITS.args && (
          <button className={styles.add} type="button" onClick={addArg}>
            <PlusIcon />
            Add argument
          </button>
        )}
      </section>
    </aside>
  );
}
