"use client";

import { useEffect, useState } from "react";
import styles from "./settings.module.css";

const read = (key, fallback) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

const icon = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const LaptopIcon = () => (
  <svg {...icon}>
    <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9" />
    <path d="M2 20h20a1 1 0 0 0 1-1v-1H1v1a1 1 0 0 0 1 1z" />
  </svg>
);

const SunIcon = () => (
  <svg {...icon}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const MoonIcon = () => (
  <svg {...icon}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
  </svg>
);

const THEMES = [
  { id: "system", label: "System", Icon: LaptopIcon },
  { id: "light", label: "Light", Icon: SunIcon },
  { id: "dark", label: "Dark", Icon: MoonIcon },
];

// The selected state is drawn by CSS from <html data-theme>, set before first paint
function setTheme(id) {
  const root = document.documentElement;
  try {
    if (id === "system") {
      localStorage.removeItem("theme");
      root.removeAttribute("data-theme");
    } else {
      localStorage.setItem("theme", id);
      root.setAttribute("data-theme", id);
    }
  } catch {}
}

function ThemeCard() {
  return (
    <section className={styles.card}>
      <div className={styles.cardBody}>
        <div className={styles.cardText}>
          <h3 className={styles.cardTitle}>Theme</h3>
          <p className={styles.cardDesc}>Choose the interface theme. System matches your operating system.</p>
        </div>
        <span className={styles.segmented} role="radiogroup" aria-label="Theme">
          {THEMES.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={styles.segment}
              data-id={id}
              type="button"
              role="radio"
              aria-label={label}
              title={label}
              onClick={() => setTheme(id)}
            >
              <Icon />
            </button>
          ))}
        </span>
      </div>
    </section>
  );
}

// Boolean preference mirrored as an attribute on <html> (applied pre-paint by the layout script)
function useFlag(storageKey, attr) {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(read(storageKey, "0") === "1"), [storageKey]);

  const toggle = () => {
    const next = !on;
    setOn(next);
    const root = document.documentElement;
    try {
      if (next) {
        localStorage.setItem(storageKey, "1");
        root.setAttribute(attr, "");
      } else {
        localStorage.removeItem(storageKey);
        root.removeAttribute(attr);
      }
    } catch {}
  };

  return [on, toggle];
}

function ToggleCard({ title, desc, storageKey, attr, dataKey }) {
  const [on, toggle] = useFlag(storageKey, attr);
  return (
    <section className={styles.card}>
      <div className={styles.cardBody}>
        <div className={styles.cardText}>
          <h3 className={styles.cardTitle}>{title}</h3>
          <p className={styles.cardDesc}>{desc}</p>
        </div>
        <button
          className={styles.toggle}
          data-key={dataKey}
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={title}
          onClick={toggle}
        />
      </div>
    </section>
  );
}

export default function Appearance() {
  return (
    <>
      <ThemeCard />

      <ToggleCard
        title="Reduce motion"
        desc="Minimize animations and transitions."
        storageKey="reduce-motion"
        attr="data-reduce-motion"
        dataKey="motion"
      />
    </>
  );
}
