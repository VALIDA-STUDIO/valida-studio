"use client";

import { memo, useRef } from "react";
import { Handle, Position, useReactFlow, useNodeConnections, useNodesData } from "@xyflow/react";
import { EVENTS } from "./events";
import VarChips from "./VarChips";
import styles from "./editor.module.css";

const MegaphoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m3 11 18-5v12L3 14v-3z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </svg>
);

// Broadcast: sends a message to everyone online. Variables of the connected event can be inserted.
function BroadcastNode({ id, data, selected }) {
  const { updateNodeData } = useReactFlow();
  const field = useRef(null);

  // variables offered by whatever event feeds this block
  const incoming = useNodeConnections({ handleType: "target" });
  const sources = useNodesData(incoming.map((c) => c.source));
  const vars = sources.flatMap((n) => (n?.type === "event" ? (EVENTS[n.data?.event]?.outputs ?? []) : []));

  // put {path} where the cursor is
  const insert = (path) => {
    const el = field.current;
    const text = data.message ?? "";
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const token = `{${path}}`;
    updateNodeData(id, { message: text.slice(0, start) + token + text.slice(end) });
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

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
        <label className={styles.nodeLabel} htmlFor={`${id}-message`}>
          Message
        </label>
        <textarea
          id={`${id}-message`}
          ref={field}
          className={`${styles.nodeTextarea} nodrag nowheel`}
          value={data.message ?? ""}
          onChange={(e) => updateNodeData(id, { message: e.target.value })}
          placeholder="Welcome, {player}!"
          maxLength={300}
          rows={2}
          spellCheck={false}
        />
        {vars.length > 0 && <VarChips vars={vars} onInsert={insert} />}
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
