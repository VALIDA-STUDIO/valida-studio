"use client";

import { useEffect, useRef, useState } from "react";
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

export const PLANS = {
  standard: "Standard",
  pro: "Pro",
  enterprise: "Enterprise",
};

// Discord mark, outlined to match the other 16px icons
const DiscordIcon = () => (
  <svg {...icon} strokeWidth="1.8">
    <path d="M8.5 15.5c2.3 1.2 4.7 1.2 7 0M8.7 5.3c2.2-.5 4.4-.5 6.6 0l.5-1.3c1.6.3 3.2.9 4.5 1.7 1.8 3.5 2.6 7.3 2.2 11.1-1.7 1.3-3.5 2.2-5.4 2.8l-1.2-2.1M8.7 5.3l-.5-1.3c-1.6.3-3.2.9-4.5 1.7-1.8 3.5-2.6 7.3-2.2 11.1 1.7 1.3 3.5 2.2 5.4 2.8l1.2-2.1" />
    <circle cx="9" cy="11.5" r="1.2" />
    <circle cx="15" cy="11.5" r="1.2" />
  </svg>
);

const LogoutIcon = () => (
  <svg {...icon}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function UserMenu({ name, avatar, plan = "standard" }) {
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
          <a className={styles.item} href="https://discord.gg/BzX2zBz5C" target="_blank" rel="noopener noreferrer" role="menuitem" onClick={() => setOpen(false)}>
            <span className={styles.iconBox}>
              <DiscordIcon />
            </span>
            Discord
          </a>
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
        </span>
        <span className={styles.text}>
          <span className={styles.name}>{name}</span>
          <span className={styles.plan} data-plan={plan}>
            {/* beveled star, hue-shifted per plan */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.star} data-plan={plan} src="/plan-star.png" alt="" width={14} height={14} />
            {PLANS[plan] ?? "Standard"}
          </span>
        </span>
        <span className={styles.chevron}>
          <ChevronIcon />
        </span>
      </button>
    </div>
  );
}
