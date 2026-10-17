"use client";

import { memo } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { EVENTS, DEFAULT_EVENT } from "./events";
import styles from "./editor.module.css";

const BoltIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  </svg>
);
import NodeSelect from "./NodeSelect";

// An event: pick which one in the node; one "then" output. Its variables show up in the blocks it feeds.
function EventNode({ id, data, selected }) {
  const { updateNodeData } = useReactFlow();
  const event = EVENTS[data.event] ?? EVENTS[DEFAULT_EVENT];

  return (
    <div className={styles.node} data-kind="event" data-selected={selected || undefined}>
      <div className={styles.nodeHead}>
        <span className={`${styles.nodeBadge} ${styles.nodeBadgeAction}`} data-kind="event">
          <BoltIcon />
        </span>
        <span className={styles.nodeKind}>Event</span>
      </div>
      <div className={styles.nodeBody}>
        <NodeSelect value={event.id} options={Object.values(EVENTS).map((e) => ({ id: e.id, label: e.paper }))} onChange={(v) => updateNodeData(id, { event: v })} label="Event" mono />
        {event.cancellable && (
          <label className={`${styles.nodeToggle} nodrag`}>
            <input type="checkbox" checked={!!data.cancel} onChange={(e) => updateNodeData(id, { cancel: e.target.checked })} />
            <span className={styles.nodeToggleBox} aria-hidden="true" />
            Cancel this event
          </label>
        )}
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

export default memo(EventNode);
