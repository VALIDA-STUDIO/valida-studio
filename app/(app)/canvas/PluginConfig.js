"use client";

import { useState, useTransition } from "react";
import ChipsInput from "./ChipsInput";
import { saveConfig } from "../../projects/config";
import s from "../settings/settings.module.css";
import f from "../../ProjectSwitcher.module.css";
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

// Plugin config: name, version, description, authors, website. Saved per card.
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

  return (
    <div className={s.page}>
      <header className={s.head}>
        <h1 className={s.title}>Config</h1>
        <p className={s.subtitle}>Plugin information for {project.name}.</p>
      </header>

      <div className={s.stack}>
        <section className={s.group}>
          <div className={s.groupHead}>
            <h2>Plugin</h2>
          </div>

          <Card {...card("name")} title="Name" desc="The name of the plugin as servers will see it." hint="Leave empty to use the project name.">
            <input
              className={`${f.input} ${s.fieldInput}`}
              type="text"
              value={cfg.name}
              onChange={(e) => set("name")(e.target.value)}
              placeholder={project.name}
              maxLength={40}
              autoComplete="off"
              aria-label="Plugin name"
            />
          </Card>

          <Card {...card("version")} title="Version" desc="The version number of the plugin." hint="Letters, numbers, dots and dashes.">
            <input
              className={`${f.input} ${s.fieldInput}`}
              type="text"
              value={cfg.version}
              onChange={(e) => set("version")(e.target.value)}
              placeholder="1.0.0"
              maxLength={20}
              autoComplete="off"
              spellCheck={false}
              aria-label="Version"
            />
          </Card>

          <Card {...card("description")} title="Description" desc="A short summary of what the plugin does." hint="Up to 200 characters.">
            <textarea
              className={c.textarea}
              value={cfg.description}
              onChange={(e) => set("description")(e.target.value)}
              placeholder="Welcomes players and keeps the lobby tidy."
              maxLength={200}
              rows={2}
              aria-label="Description"
            />
          </Card>
        </section>

        <section className={s.group}>
          <div className={s.groupHead}>
            <h2>People</h2>
          </div>

          <Card {...card("authors")} title="Authors" desc="Everyone who should be credited for the plugin." hint="Press Enter after each name.">
            <ChipsInput value={cfg.authors} onChange={set("authors")} placeholder="Add an author" max={10} label="Authors" />
          </Card>

          <Card {...card("website")} title="Website" desc="Where players and server owners can find out more." hint="Optional. Must start with https://.">
            <input
              className={`${f.input} ${s.fieldInput} ${c.inputWide}`}
              type="text"
              inputMode="url"
              value={cfg.website}
              onChange={(e) => set("website")(e.target.value)}
              placeholder="https://example.com"
              maxLength={200}
              autoComplete="off"
              spellCheck={false}
              aria-label="Website"
            />
          </Card>
        </section>
      </div>
    </div>
  );
}
