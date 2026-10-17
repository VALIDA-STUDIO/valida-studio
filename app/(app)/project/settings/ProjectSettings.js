"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProject, deleteProject } from "../../../projects/actions";
import PluginConfig from "./PluginConfig";
import s from "../../settings/settings.module.css";
import f from "../../../ProjectSwitcher.module.css";

export default function ProjectSettings({ project }) {
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState({});
  const [pending, startTransition] = useTransition();

  const nameDirty = name.trim() !== project.name && name.trim();

  const save = (patch, key) =>
    startTransition(async () => {
      const res = await updateProject({ id: project.id, ...patch });
      setMsg({ [key]: res?.error ? res.error : "Saved" });
      setTimeout(() => setMsg({}), 1600);
    });

  const remove = () =>
    startTransition(async () => {
      const res = await deleteProject(project.id);
      if (res?.error) return setMsg({ danger: res.error });
      router.push("/");
      router.refresh();
    });

  return (
    <div className={s.page}>
      <header className={s.head}>
        <h1 className={s.title}>Project Settings</h1>
        <p className={s.subtitle}>
          {project.name} · <span className={s.mono}>{project.id}</span>
        </p>
      </header>

      <div className={s.stack}>
        <section className={s.group}>
          <div className={s.groupHead}>
            <h2>General</h2>
          </div>

          {/* ---------- name ---------- */}
          <form
            className={s.card}
            onSubmit={(e) => {
              e.preventDefault();
              if (nameDirty) save({ name }, "name");
            }}
          >
            <div className={s.cardBody}>
              <div className={s.cardText}>
                <h3 className={s.cardTitle}>Project name</h3>
                <p className={s.cardDesc}>Shown in the project switcher.</p>
                <input
                  className={`${f.input} ${s.fieldInput}`}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={40}
                  autoComplete="off"
                  aria-label="Project name"
                />
              </div>
            </div>
            <div className={s.cardFoot}>
              <span className={msg.name && msg.name !== "Saved" ? s.error : s.footText}>{msg.name ?? ""}</span>
              <button className={s.btnPrimary} type="submit" disabled={!nameDirty || pending}>
                Save
              </button>
            </div>
          </form>
        </section>

        <PluginConfig project={project} />

        {/* ---------- danger ---------- */}
        <section className={s.group}>
          <div className={s.groupHead}>
            <h2 className={s.dangerText}>Danger zone</h2>
          </div>

          <section className={s.card} data-danger="">
            <div className={s.cardBody}>
              <div className={s.cardText}>
                <h3 className={s.cardTitle}>Delete project</h3>
                <p className={s.cardDesc}>Removes the project and everything in it.</p>
              </div>
            </div>
            <div className={s.cardFoot}>
              {confirm ? (
                <div className={s.confirm}>
                  <span className={s.footText}>
                    Delete <strong>{project.name}</strong>?
                  </span>
                  <button className={s.btn} type="button" onClick={() => setConfirm(false)} disabled={pending} autoFocus>
                    Cancel
                  </button>
                  <button className={s.btnDanger} type="button" onClick={remove} disabled={pending}>
                    {pending ? "Deleting…" : "Yes, delete"}
                  </button>
                </div>
              ) : (
                <>
                  <span className={msg.danger ? s.error : s.footText}>{msg.danger ?? ""}</span>
                  <button className={s.btnDanger} type="button" onClick={() => setConfirm(true)}>
                    Delete project
                  </button>
                </>
              )}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
