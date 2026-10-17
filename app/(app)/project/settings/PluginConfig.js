"use client";

import { useState, useTransition } from "react";
import ChipsInput from "../../../ChipsInput";
import { saveConfig } from "../../../projects/config";
import s from "../../settings/settings.module.css";
import f from "../../../ProjectSwitcher.module.css";
import c from "./config.module.css";

const EMPTY = {
  name: "",
  version: "",
  description: "",
  authors: [],
  website: "",
  prefix: "",
  platform: "paper",
  mcVersion: "26.3",
  depend: [],
  softdepend: [],
};

// One settings card: title, description, the field(s), and a footer with hint/status + Save.
function Card({ title, desc, hint, dirty, pending, msg, onSave, children }) {
  return (
    <form
      className={s.card}
      onSubmit={(e) => {
        e.preventDefault();
        if (dirty) onSave();
      }}
    >
      <div className={s.cardBody}>
        <div className={s.cardText}>
          <h3 className={s.cardTitle}>{title}</h3>
          <p className={s.cardDesc}>{desc}</p>
          {children}
        </div>
      </div>
      <div className={s.cardFoot}>
        <span className={msg && msg !== "Saved" ? s.error : s.footText}>{msg ?? hint}</span>
        <button className={s.btnPrimary} type="submit" disabled={!dirty || pending}>
          Save
        </button>
      </div>
    </form>
  );
}

// Plugin config sections for Project Settings: name, version, description, log prefix, authors, website, dependencies. Saved per card.
export default function PluginConfig({ project }) {
  const [saved, setSaved] = useState({ ...EMPTY, ...(project.config ?? {}) });
  const [cfg, setCfg] = useState(saved);
  const [msg, setMsg] = useState({});
  const [pending, startTransition] = useTransition();

  const set = (key) => (v) => setCfg((p) => ({ ...p, [key]: v }));
  const dirty = (...keys) => keys.some((k) => JSON.stringify(cfg[k]) !== JSON.stringify(saved[k]));

  // Each card saves the whole config but only reports on its own keys.
  const save = (cardKey) =>
    startTransition(async () => {
      const res = await saveConfig({ projectId: project.id, config: cfg });
      if (res?.error) return setMsg({ [cardKey]: res.error });
      setSaved(res.config);
      setCfg((p) => ({ ...p, ...res.config }));
      setMsg({ [cardKey]: "Saved" });
      setTimeout(() => setMsg({}), 1600);
    });

  // props every card needs: its dirty state, status message and save handler
  const card = (id, keys = [id]) => ({ dirty: dirty(...keys), pending, msg: msg[id], onSave: () => save(id) });

  const input = (key, extra = {}) => (
    <input
      className={`${f.input} ${c.inputWide}`}
      type="text"
      value={cfg[key]}
      onChange={(e) => set(key)(e.target.value)}
      autoComplete="off"
      {...extra}
    />
  );

  return (
    <>
        <section className={s.group}>
          <div className={s.groupHead}>
            <h2>Plugin</h2>
          </div>

          <Card
            {...card("plugin", ["name", "version", "description", "prefix", "authors", "website"])}
            title="Plugin information"
            desc="What servers and players see about the plugin."
            hint="Name and log prefix fall back to the project name."
          >
            <div className={c.grid}>
              <label className={c.field}>
                <span className={c.fieldLabel}>Name</span>
                {input("name", { placeholder: project.name, maxLength: 40 })}
              </label>
              <label className={c.field}>
                <span className={c.fieldLabel}>Version</span>
                {input("version", { placeholder: "1.0.0", maxLength: 20, spellCheck: false })}
              </label>
            </div>

            <label className={c.field}>
              <span className={c.fieldLabel}>Description</span>
              <textarea
                className={c.textarea}
                value={cfg.description}
                onChange={(e) => set("description")(e.target.value)}
                placeholder="Welcomes players and keeps the lobby tidy."
                maxLength={200}
                rows={2}
              />
            </label>

            <div className={c.grid}>
              <label className={c.field}>
                <span className={c.fieldLabel}>Log prefix</span>
                {input("prefix", { placeholder: cfg.name || project.name, maxLength: 40 })}
              </label>
              <label className={c.field}>
                <span className={c.fieldLabel}>Website</span>
                {input("website", { placeholder: "https://example.com", maxLength: 200, spellCheck: false, inputMode: "url" })}
              </label>
            </div>

            <div className={c.field}>
              <span className={c.fieldLabel}>Authors</span>
              <ChipsInput value={cfg.authors} onChange={set("authors")} placeholder="Add an author, then press Enter" max={10} label="Authors" />
            </div>
          </Card>
        </section>

        <section className={s.group}>
          <div className={s.groupHead}>
            <h2>Dependencies</h2>
          </div>

          <Card {...card("dependencies", ["depend", "softdepend"])} title="Other plugins" desc="Plugins this plugin needs or can work with." hint="Press Enter after each plugin name.">
            <span className={c.depLabel}>Required — the plugin will not load without these</span>
            <ChipsInput value={cfg.depend} onChange={set("depend")} placeholder="Vault" max={20} label="Required plugins" />
            <span className={c.depLabel}>Optional — used when they are installed</span>
            <ChipsInput value={cfg.softdepend} onChange={set("softdepend")} placeholder="PlaceholderAPI" max={20} label="Optional plugins" />
          </Card>
        </section>
    </>
  );
}
