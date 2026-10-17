"use client";

import { memo } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import styles from "./editor.module.css";

const TerminalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m4 17 6-6-6-6M12 19h8" />
  </svg>
);

// A command: its name, and a "runs" output for what happens next.
function CommandNode({ id, data, selected }) {
  const { updateNodeData } = useReactFlow();
  const clean = (v) => v.replace(/^\/+/, "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 32);

  return (
    <div className={styles.node} data-selected={selected || undefined}>
      <div className={styles.nodeHead}>
        <span className={styles.nodeBadge}>
          <TerminalIcon />
        </span>
        <span className={styles.nodeKind}>Command</span>
      </div>
      <div className={styles.nodeBody}>
        <div className={styles.nodeField}>
          <span className={styles.nodeSlash}>/</span>
          <input
            className={`${styles.nodeInput} nodrag`}
            value={data.name ?? ""}
            onChange={(e) => updateNodeData(id, { name: clean(e.target.value) })}
            placeholder="name"
            maxLength={32}
            autoComplete="off"
            spellCheck={false}
            aria-label="Command name"
          />
        </div>
        <span className={styles.nodeText}>Runs when a player types it.</span>
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
