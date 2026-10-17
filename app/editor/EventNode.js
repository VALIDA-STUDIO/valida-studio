"use client";

import { memo } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { EVENT_GROUPS, EVENTS, DEFAULT_EVENT } from "./events";
import styles from "./editor.module.css";

const BoltIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  </svg>
);

// An event: pick which one in the node; outputs are "then" plus what the event hands over.
function EventNode({ id, data, selected }) {
  const { updateNodeData } = useReactFlow();
  const event = EVENTS[data.event] ?? EVENTS[DEFAULT_EVENT];

  return (
    <div className={styles.node} data-selected={selected || undefined}>
      <div className={styles.nodeHead}>
        <span className={styles.nodeBadge}>
          <BoltIcon />
        </span>
        <span className={styles.nodeKind}>Event</span>
      </div>
      <div className={styles.nodeBody}>
        <select className={`${styles.nodeSelect} nodrag`} value={event.id} onChange={(e) => updateNodeData(id, { event: e.target.value })} aria-label="Event">
          {EVENT_GROUPS.map((g) => (
            <optgroup key={g.group} label={g.group}>
              {g.events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <span className={styles.nodeMono}>{event.paper}</span>
      </div>
      <div className={styles.nodeOutputs}>
        <div className={styles.nodeOutput} data-flow="">
          <span>then</span>
          <Handle type="source" position={Position.Right} id="then" className={styles.handle} />
        </div>
        {event.outputs.map((o) => (
          <div key={o.id} className={styles.nodeOutput}>
            <span>{o.label}</span>
            <Handle type="source" position={Position.Right} id={o.id} className={`${styles.handle} ${styles.handleData}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(EventNode);
