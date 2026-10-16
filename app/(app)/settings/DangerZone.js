"use client";

import { useState } from "react";
import styles from "./settings.module.css";

const CONFIRM_WORD = "DELETE";

export default function DangerZone({ failed }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const ready = typed.trim().toUpperCase() === CONFIRM_WORD;

  const cancel = () => {
    setOpen(false);
    setTyped("");
  };

  return (
    <section className={styles.card} data-danger="">
      <div className={styles.cardBody}>
        <div className={styles.cardText}>
          <h3 className={styles.cardTitle}>Delete account</h3>
          <p className={styles.cardDesc}>
            Permanently remove your account and all of its contents. This action is not reversible, so please continue
            with caution.
          </p>
        </div>
      </div>

      <div className={styles.cardFoot}>
        {open ? (
          <form
            className={styles.confirm}
            action="/auth/delete"
            method="post"
            onSubmit={(e) => {
              if (!ready) e.preventDefault();
              else setBusy(true);
            }}
          >
            <span className={styles.footText}>
              Type <code>{CONFIRM_WORD}</code> to confirm
            </span>
            <input
              className={styles.confirmInput}
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && cancel()}
              placeholder={CONFIRM_WORD}
              autoComplete="off"
              spellCheck={false}
              autoFocus
            />
            <button className={styles.btn} type="button" onClick={cancel} disabled={busy}>
              Cancel
            </button>
            <button className={styles.btnDanger} type="submit" disabled={!ready || busy}>
              {busy ? "Deleting…" : "Delete"}
            </button>
          </form>
        ) : (
          <>
            <span className={failed ? styles.error : styles.footText}>
              {failed ? "Something went wrong. Your account was not deleted." : ""}
            </span>
            <button className={styles.btnDanger} type="button" onClick={() => setOpen(true)}>
              Delete account
            </button>
          </>
        )}
      </div>
    </section>
  );
}
