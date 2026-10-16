"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./UserMenu.module.css";

const icon = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const ChevronIcon = () => (
  <svg {...icon}>
    <path d="m6 15 6-6 6 6" />
  </svg>
);

const SettingsIcon = () => (
  <svg {...icon}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const SparkIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l2.4 7.1L22 12l-7.6 2.9L12 22l-2.4-7.1L2 12l7.6-2.9z" />
  </svg>
);

// Meta/Instagram-style verified seal: scalloped circle with a check
const VerifiedIcon = () => (
  <svg className={styles.verified} viewBox="0 0 24 24" aria-label="Verified">
    <path fill="currentColor" d="M23.50 12.00L23.12 12.73L22.21 13.34L21.27 13.84L20.79 14.36L20.95 15.04L21.52 15.94L22.00 16.93L21.96 17.75L21.27 18.19L20.17 18.27L19.11 18.23L18.43 18.43L18.23 19.11L18.27 20.17L18.19 21.27L17.75 21.96L16.93 22.00L15.94 21.52L15.04 20.95L14.36 20.79L13.84 21.27L13.34 22.21L12.73 23.12L12.00 23.50L11.27 23.12L10.66 22.21L10.16 21.27L9.64 20.79L8.96 20.95L8.06 21.52L7.07 22.00L6.25 21.96L5.81 21.27L5.73 20.17L5.77 19.11L5.57 18.43L4.89 18.23L3.83 18.27L2.73 18.19L2.04 17.75L2.00 16.93L2.48 15.94L3.05 15.04L3.21 14.36L2.73 13.84L1.79 13.34L0.88 12.73L0.50 12.00L0.88 11.27L1.79 10.66L2.73 10.16L3.21 9.64L3.05 8.96L2.48 8.06L2.00 7.07L2.04 6.25L2.73 5.81L3.83 5.73L4.89 5.77L5.57 5.57L5.77 4.89L5.73 3.83L5.81 2.73L6.25 2.04L7.07 2.00L8.06 2.48L8.96 3.05L9.64 3.21L10.16 2.73L10.66 1.79L11.27 0.88L12.00 0.50L12.73 0.88L13.34 1.79L13.84 2.73L14.36 3.21L15.04 3.05L15.94 2.48L16.93 2.00L17.75 2.04L18.19 2.73L18.27 3.83L18.23 4.89L18.43 5.57L19.11 5.77L20.17 5.73L21.27 5.81L21.96 6.25L22.00 7.07L21.52 8.06L20.95 8.96L20.79 9.64L21.27 10.16L22.21 10.66L23.12 11.27Z" />
    <path d="m7.4 12.3 3 3 6.2-6.4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SparklesIcon = () => (
  <svg {...icon}>
    <path d="M12 3l1.9 5.6 5.6 1.9-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z" />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
  </svg>
);

const ArrowIcon = () => (
  <svg {...icon} width="14" height="14">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const LogoutIcon = () => (
  <svg {...icon}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function UserMenu({ name, avatar, plan = "default" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={styles.wrap} ref={ref}>
      {open && (
        <div className={styles.menu} role="menu">
          <button className={styles.upgrade} type="button" role="menuitem">
            <span className={styles.iconBox}>
              <SparklesIcon />
            </span>
            <span className={styles.upgradeText}>
              <span className={styles.upgradeTitle}>
                {plan === "premium" ? "Premium" : "Upgrade to Premium"}
              </span>
              <span className={styles.upgradeSub}>
                {plan === "premium" ? "Manage subscription" : "Unlock everything"}
              </span>
            </span>
            <span className={styles.arrow}>
              <ArrowIcon />
            </span>
          </button>

          <div className={styles.divider} />

          <Link className={styles.item} href="/settings" role="menuitem" onClick={() => setOpen(false)}>
            <span className={styles.iconBox}>
              <SettingsIcon />
            </span>
            Settings
            <kbd className={styles.kbd}>⌘,</kbd>
          </Link>

          <form action="/auth/logout" method="post">
            <button className={styles.item} type="submit" role="menuitem">
              <span className={styles.iconBox}>
                <LogoutIcon />
              </span>
              Logout
            </button>
          </form>
        </div>
      )}

      <button
        className={styles.trigger}
        data-open={open || undefined}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className={styles.avatarWrap}>
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.avatar} src={avatar} alt="" width={38} height={38} />
          ) : (
            <span className={styles.avatarFallback}>{name?.[0]?.toUpperCase()}</span>
          )}
          <VerifiedIcon />
        </span>
        <span className={styles.text}>
          <span className={styles.name}>{name}</span>
          <span className={styles.plan} data-plan={plan}>
            {plan === "premium" && <SparkIcon />}
            {plan === "premium" ? "Premium" : "Default"}
          </span>
        </span>
        <span className={styles.chevron}>
          <ChevronIcon />
        </span>
      </button>
    </div>
  );
}
