"use client";

import { useRef, useState } from "react";
import c from "./ChipsInput.module.css";

const XIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

// A list of short values shown as chips. Enter or comma adds, Backspace on an empty field removes the last one.
export default function ChipsInput({ value = [], onChange, placeholder, max = 10, label, size }) {
  const [draft, setDraft] = useState("");
  const input = useRef(null);

  const add = (text) => {
    const v = text.trim();
    if (v && !value.includes(v) && value.length < max) onChange([...value, v]);
    setDraft("");
  };
  const commit = () => add(draft);

  const remove = (i) => onChange(value.filter((_, j) => j !== i));

  return (
    <div className={`${c.chips} ${size === "sm" ? c.sm : ""}`} onClick={() => input.current?.focus()}>
      {value.map((v, i) => (
        <span key={v} className={c.chip}>
          {v}
          <button className={c.chipX} type="button" aria-label={`Remove ${v}`} onClick={() => remove(i)}>
            <XIcon />
          </button>
        </span>
      ))}
      <input
        ref={input}
        className={c.chipInput}
        value={draft}
        placeholder={value.length ? "" : placeholder}
        aria-label={label}
        maxLength={40}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value.slice(0, -1)) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.preventDefault(), commit());
          else if (e.key === "Backspace" && !draft && value.length) remove(value.length - 1);
        }}
        onBlur={commit}
      />
    </div>
  );
}
