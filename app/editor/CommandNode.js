"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { ARG_TYPES } from "../canvas/commandSchema";
import styles from "./editor.module.css";

const TerminalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m4 17 6-6-6-6M12 19h8" />
  </svg>
);

// The trigger node of a command canvas: the command, its arguments, and one "runs" output.
function CommandNode({ data, selected }) {
  const args = data.args ?? [];
  return (
    <div className={styles.node} data-selected={selected || undefined}>
      <div className={styles.nodeHead}>
        <span className={styles.nodeBadge}>
          <TerminalIcon />
        </span>
        <span className={styles.nodeKind}>Command</span>
      </div>
      <div className={styles.nodeBody}>
        <span className={styles.nodeTitle}>/{data.name || "…"}</span>
        {args.length ? (
          <span className={styles.nodeArgs}>
            {args.map((a, i) => (
              <span key={i} className={styles.nodeArg} data-optional={a.required === false || undefined} title={ARG_TYPES[a.type]?.label}>
                {a.required === false ? "[" : "<"}
                {a.name || "?"}
                {ARG_TYPES[a.type]?.last ? "…" : ""}
                {a.required === false ? "]" : ">"}
              </span>
            ))}
          </span>
        ) : (
          <span className={styles.nodeText}>No arguments</span>
        )}
        {data.description && <span className={styles.nodeText}>{data.description}</span>}
      </div>
      <div className={styles.nodeOutputs}>
        <div className={styles.nodeOutput}>
          <span>runs</span>
          <Handle type="source" position={Position.Right} id="runs" className={styles.handle} />
        </div>
      </div>
    </div>
  );
}

export default memo(CommandNode);
