"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { createCommand, deleteCommand } from "../../projects/commands";
import s from "../settings/settings.module.css";
import c from "./commands.module.css";

const icon = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
const TerminalIcon = () => (
  <svg {...icon} width="16" height="16">
    <path d="m4 17 6-6-6-6M12 19h8" />
  </svg>
);
const ChevronIcon = () => (
  <svg {...icon} width="14" height="14">
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const TrashIcon = () => (
  <svg {...icon} width="14" height="14">
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6M10 11v6M14 11v6" />
  </svg>
);
const PlusIcon = () => (
  <svg {...icon} width="14" height="14">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

// Commands of the active project: create, open in the editor, delete.
export default function CommandList({ project, commands }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(null); // id awaiting delete confirmation
  const [pending, startTransition] = useTransition();
  const input = useRef(null);

  useEffect(() => {
    if (creating) input.current?.focus();
  }, [creating]);

  const cancel = () => (setCreating(false), setName(""), setError(""));

  const create = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      const res = await createCommand({ projectId: project.id, name });
      if (res?.error) return setError(res.error);
      cancel();
    });
  };

  const remove = (id) =>
    startTransition(async () => {
      const res = await deleteCommand(id);
      if (res?.error) setError(res.error);
      setConfirm(null);
    });

  return (
    <div className={s.page}>
      <header className={`${s.head} ${c.head}`}>
        <div>
          <h1 className={s.title}>Commands</h1>
          <p className={s.subtitle}>Commands players can run in {project.name}.</p>
        </div>
        {!creating && (
          <button className={s.btnPrimary} type="button" onClick={() => setCreating(true)}>
            <PlusIcon />
            New command
          </button>
        )}
      </header>

      {creating && (
        <form className={c.create} onSubmit={create}>
          <label className={c.nameField}>
            <span className={c.slash}>/</span>
            <input
              ref={input}
              className={c.nameInput}
              value={name}
              onChange={(e) => (setName(e.target.value), setError(""))}
              onKeyDown={(e) => e.key === "Escape" && cancel()}
              placeholder="heal"
              maxLength={32}
              autoComplete="off"
              spellCheck={false}
              aria-label="Command name"
            />
          </label>
          <button className={s.btn} type="button" onClick={cancel} disabled={pending}>
            Cancel
          </button>
          <button className={s.btnPrimary} type="submit" disabled={!name.trim() || pending}>
            {pending ? "Creating…" : "Create"}
          </button>
          {error && <p className={`${s.error} ${c.createError}`}>{error}</p>}
        </form>
      )}

      {commands.length === 0 ? (
        <div className={c.empty}>
          <span className={c.emptyIcon}>
            <TerminalIcon />
          </span>
          <p className={c.emptyTitle}>No commands yet</p>
          <p className={c.emptyText}>Create one and it shows up here. Open it to build what it does.</p>
        </div>
      ) : (
        <ul className={c.list}>
          {commands.map((cmd) => (
            <li key={cmd.id} className={c.row} data-pending={pending || undefined}>
              {confirm === cmd.id ? (
                <div className={c.confirm}>
                  <span className={c.confirmText}>
                    Delete <strong>/{cmd.name}</strong>? This cannot be undone.
                  </span>
                  <button className={s.btn} type="button" onClick={() => setConfirm(null)} disabled={pending}>
                    Cancel
                  </button>
                  <button className={s.btnDanger} type="button" onClick={() => remove(cmd.id)} disabled={pending}>
                    Delete
                  </button>
                </div>
              ) : (
                <>
                  <Link className={c.rowLink} href={`/canvas/commands/${cmd.id}`}>
                    <span className={c.rowIcon}>
                      <TerminalIcon />
                    </span>
                    <span className={c.rowName}>/{cmd.name}</span>
                    <span className={c.rowChevron}>
                      <ChevronIcon />
                    </span>
                  </Link>
                  <button className={c.rowDelete} type="button" title="Delete" aria-label={`Delete /${cmd.name}`} onClick={() => setConfirm(cmd.id)}>
                    <TrashIcon />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
