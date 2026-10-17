"use client";

import { useState, useTransition } from "react";
import { saveVariables } from "../../../projects/variables";
import s from "../../settings/settings.module.css";
import f from "../../../ProjectSwitcher.module.css";
import c from "./config.module.css";

const TYPES = [
  { id: "number", label: "Number" },
  { id: "text", label: "Text" },
  { id: "boolean", label: "Yes / no" },
];
const newId = () => "v_" + Math.random().toString(36).slice(2, 8);

const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

// Variables of the project: name, type, per player or one value, default, keep after restart.
export default function Variables({ project }) {
  const [saved, setSaved] = useState(project.variables ?? []);
  const [vars, setVars] = useState(saved);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(vars) !== JSON.stringify(saved);

  const update = (i, patch) => setVars((list) => list.map((v, j) => (j === i ? { ...v, ...patch } : v)));
  const remove = (i) => setVars((list) => list.filter((_, j) => j !== i));
  const add = () => setVars((list) => [...list, { id: newId(), name: "", type: "number", perPlayer: true, default: "0", persist: true }]);

  const save = () =>
    startTransition(async () => {
      const res = await saveVariables({ projectId: project.id, variables: vars });
      if (res?.error) {
        setErrors(res.errors ?? {});
        setMsg(res.error);
        return;
      }
      setErrors({});
      setSaved(res.variables);
      setVars(res.variables);
      setMsg("Saved");
      setTimeout(() => setMsg(""), 1600);
    });

  return (
    <section className={s.group}>
      <div className={s.groupHead}>
        <h2>Variables</h2>
      </div>

      <form
        className={s.card}
        onSubmit={(e) => {
          e.preventDefault();
          if (dirty) save();
        }}
      >
        <div className={s.cardBody}>
          <div className={s.cardText}>
            <h3 className={s.cardTitle}>Project variables</h3>
            <p className={s.cardDesc}>Values the plugin remembers. Use them in blocks as {"{var.name}"}.</p>

            {vars.length > 0 && (
              <div className={c.varTable}>
                <div className={c.varHead}>
                  <span>Name</span>
                  <span>Type</span>
                  <span>Per player</span>
                  <span>Default</span>
                  <span>Keep after restart</span>
                  <span />
                </div>
                {vars.map((v, i) => (
                  <div key={v.id} className={c.varRow} data-error={errors[i] ? "" : undefined}>
                    <input
                      className={`${f.input} ${c.varInput} ${c.mono}`}
                      value={v.name}
                      onChange={(e) => update(i, { name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                      placeholder="kills"
                      maxLength={32}
                      autoComplete="off"
                      spellCheck={false}
                      aria-label={`Variable ${i + 1} name`}
                    />
                    <select className={`${f.input} ${c.varInput} ${c.varSelect}`} value={v.type} onChange={(e) => update(i, { type: e.target.value, default: e.target.value === "boolean" ? "false" : e.target.value === "number" ? "0" : "" })} aria-label={`Variable ${i + 1} type`}>
                      {TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <label className={c.varCheck}>
                      <input type="checkbox" checked={!!v.perPlayer} onChange={(e) => update(i, { perPlayer: e.target.checked })} aria-label={`Variable ${i + 1} per player`} />
                      <span className={c.varCheckBox} aria-hidden="true" />
                    </label>
                    {v.type === "boolean" ? (
                      <select className={`${f.input} ${c.varInput} ${c.varSelect}`} value={v.default} onChange={(e) => update(i, { default: e.target.value })} aria-label={`Variable ${i + 1} default`}>
                        <option value="false">no</option>
                        <option value="true">yes</option>
                      </select>
                    ) : (
                      <input
                        className={`${f.input} ${c.varInput} ${v.type === "number" ? c.mono : ""}`}
                        value={v.default}
                        onChange={(e) => update(i, { default: v.type === "number" ? e.target.value.replace(/[^0-9.-]/g, "") : e.target.value })}
                        placeholder={v.type === "number" ? "0" : "none"}
                        maxLength={200}
                        autoComplete="off"
                        aria-label={`Variable ${i + 1} default`}
                      />
                    )}
                    <label className={c.varCheck}>
                      <input type="checkbox" checked={!!v.persist} onChange={(e) => update(i, { persist: e.target.checked })} aria-label={`Variable ${i + 1} keep after restart`} />
                      <span className={c.varCheckBox} aria-hidden="true" />
                    </label>
                    <button className={c.varRemove} type="button" aria-label={`Remove variable ${i + 1}`} onClick={() => remove(i)}>
                      <XIcon />
                    </button>
                    {errors[i] && <span className={c.varError}>{errors[i]}</span>}
                  </div>
                ))}
              </div>
            )}

            <button className={c.varAdd} type="button" onClick={add}>
              + Add variable
            </button>
          </div>
        </div>
        <div className={s.cardFoot}>
          <span className={msg && msg !== "Saved" ? s.error : s.footText}>{msg}</span>
          <button className={s.btnPrimary} type="submit" disabled={!dirty || pending}>
            Save
          </button>
        </div>
      </form>
    </section>
  );
}
