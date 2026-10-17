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

// The text split into runs; only the <#hex> tag itself is shown in its colour, the text stays normal.
function runs(text) {
  const out = [];
  let color = null;
  let last = 0;
  for (const m of text.matchAll(TAG)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), color });
    color = "#" + m[1];
    out.push({ text: m[0], color, tag: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), color });
  return out;
}

// Message field with Minecraft colours: each <#ff5555> tag is painted in its own colour right in the field.
// The palette button inserts a tag at the cursor; the field can be resized in both directions.
export default function MessageField({ value, onChange, placeholder, dataKey, onFocus, area = true, label }) {
  const field = useRef(null);
  const picker = useRef(null);
  const backdrop = useRef(null);
  const live = useRef(null); // the tag being picked right now, replaced on every move

  const insertColor = (hex) => {
    const el = field.current;
    const text = value ?? "";
    const tag = `<${hex}>`;
    let start, end;
    if (live.current && /^<#[0-9a-fA-F]{6}>$/.test(text.slice(live.current.start, live.current.end))) ({ start, end } = live.current);
    else {
      start = el?.selectionStart ?? text.length;
      end = el?.selectionEnd ?? text.length;
    }
    onChange(text.slice(0, start) + tag + text.slice(end));
    live.current = { start, end: start + tag.length };
    requestAnimationFrame(() => el?.setSelectionRange(start + tag.length, start + tag.length));
  };
  const openPicker = () => {
    live.current = null;
    picker.current?.click();
  };

  const text = value ?? "";
  const common = {
    ref: field,
    "data-key": dataKey,
    value: text,
    onChange: (e) => onChange(e.target.value),
    onFocus,
    onScroll: (e) => backdrop.current && (backdrop.current.scrollTop = e.target.scrollTop),
    placeholder,
    spellCheck: false,
    "aria-label": label,
  };

  return (
    <div className={styles.msgBox} data-area={area || undefined}>
      {/* painted copy of the text behind the transparent field */}
      <div ref={backdrop} className={styles.msgBackdrop} aria-hidden="true">
        {runs(text).map((r, i) => (
          <span key={i} className={r.tag ? styles.msgTag : undefined} style={r.tag ? { color: r.color } : undefined}>
            {r.text}
          </span>
        ))}
        {text.endsWith("\n") ? "​" : null}
      </div>
      {area ? <textarea className={`${styles.nodeTextarea} ${styles.msgArea} nodrag nowheel`} rows={2} maxLength={300} {...common} /> : <input className={`${styles.nodeInput} ${styles.msgInput} nodrag`} autoComplete="off" {...common} />}
      <button className={`${styles.colorBtn} nodrag`} type="button" title="Insert a colour" aria-label="Insert a colour" onClick={openPicker}>
        <PaletteIcon />
      </button>
      <input ref={picker} className={styles.colorInput} type="color" defaultValue="#55ffff" onChange={(e) => insertColor(e.target.value)} onBlur={() => (live.current = null)} tabIndex={-1} aria-hidden="true" />
    </div>
  );
}
