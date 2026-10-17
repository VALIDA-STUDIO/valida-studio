"use client";

import { useRef } from "react";
import styles from "./editor.module.css";

const PaletteIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="13.5" cy="6.5" r="1" /><circle cx="17.5" cy="10.5" r="1" /><circle cx="8.5" cy="7.5" r="1" /><circle cx="6.5" cy="12.5" r="1" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10a2.5 2.5 0 0 0 1.8-4.3 2.5 2.5 0 0 1 1.8-4.2H18a4 4 0 0 0 4-4c0-5-4.5-7.5-10-7.5z" />
  </svg>
);

const TAG = /<#([0-9a-fA-F]{6})>/g;

// Text with Minecraft colours: <#ff5555> tags colour everything after them. The preview shows the result,
// the palette button inserts a tag at the cursor.
export function ColorPreview({ text }) {
  if (!text) return null;
  const parts = [];
  let color = null;
  let last = 0;
  for (const m of text.matchAll(TAG)) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index), color });
    color = "#" + m[1];
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), color });
  if (!parts.some((p) => p.color)) return null;
  return (
    <div className={styles.preview} aria-label="Preview">
      {parts.map((p, i) => (
        <span key={i} style={p.color ? { color: p.color } : undefined}>
          {p.text}
        </span>
      ))}
    </div>
  );
}

export default function MessageField({ value, onChange, placeholder, dataKey, onFocus, area = true, label }) {
  const field = useRef(null);
  const picker = useRef(null);

  const insertColor = (hex) => {
    const el = field.current;
    const text = value ?? "";
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const tag = `<${hex}>`;
    onChange(text.slice(0, start) + tag + text.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + tag.length, start + tag.length);
    });
  };

  const common = {
    ref: field,
    "data-key": dataKey,
    value: value ?? "",
    onChange: (e) => onChange(e.target.value),
    onFocus,
    placeholder,
    spellCheck: false,
    "aria-label": label,
  };

  return (
    <div className={styles.msgWrap}>
      <div className={styles.msgBox}>
        {area ? <textarea className={`${styles.nodeTextarea} ${styles.msgArea} nodrag nowheel`} rows={2} maxLength={300} {...common} /> : <input className={`${styles.nodeInput} ${styles.msgInput} nodrag`} autoComplete="off" {...common} />}
        <button className={`${styles.colorBtn} nodrag`} type="button" title="Insert a colour" aria-label="Insert a colour" onClick={() => picker.current?.click()}>
          <PaletteIcon />
        </button>
        <input ref={picker} className={styles.colorInput} type="color" defaultValue="#55ffff" onChange={(e) => insertColor(e.target.value)} tabIndex={-1} aria-hidden="true" />
      </div>
      <ColorPreview text={value} />
    </div>
  );
}
