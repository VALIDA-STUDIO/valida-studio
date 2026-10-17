"use client";

import { memo } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import styles from "./editor.module.css";

const MegaphoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m3 11 18-5v12L3 14v-3z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </svg>
);

// Broadcast: sends a message to everyone online. {variables} from the event can be used.
function BroadcastNode({ id, data, selected }) {
  const { updateNodeData } = useReactFlow();

  return (
    <div className={styles.node} data-kind="action" data-selected={selected || undefined}>
      <Handle type="target" position={Position.Left} className={styles.handle} />
      <div className={styles.nodeHead}>
        <span className={`${styles.nodeBadge} ${styles.nodeBadgeAction}`}>
          <MegaphoneIcon />
        </span>
        <span className={styles.nodeKind}>Broadcast</span>
      </div>
      <div className={styles.nodeBody}>
        <input
          className={`${styles.nodeInput} nodrag`}
          value={data.message ?? ""}
          onChange={(e) => updateNodeData(id, { message: e.target.value })}
          placeholder="{player} joined the server"
          maxLength={200}
          autoComplete="off"
          spellCheck={false}
          aria-label="Message"
        />
      </div>
      <div className={styles.nodeOutputs}>
        <div className={styles.nodeOutput} data-flow="">
          <span>then</span>
          <Handle type="source" position={Position.Right} id="then" className={styles.handle} />
        </div>
      </div>
    </div>
  );
}

export default memo(BroadcastNode);
