"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { BLOCKS } from "./blockDefs";
import { BLOCK_ICONS } from "./blockIcons";
import styles from "./editor.module.css";

// A building block: input on the left, labelled outputs on the right, a one-line summary of its settings.
function BlockNode({ data, selected }) {
  const def = BLOCKS[data.type] ?? { kind: "action", title: data.type, outputs: ["then"], summary: () => "" };
  const summary = def.summary?.(data.values ?? {});
  const Icon = BLOCK_ICONS[data.type];
  return (
    <div className={styles.node} data-kind={def.kind} data-selected={selected || undefined}>
      <Handle type="target" position={Position.Left} className={styles.handle} />
      <div className={styles.nodeHead}>
        <span className={styles.nodeIcon} data-kind={def.kind}>
          {Icon && <Icon />}
        </span>
        <span className={styles.nodeName}>{def.title}</span>
        <span className={styles.nodeKind} data-kind={def.kind}>
          {def.kind}
        </span>
      </div>
      <div className={styles.nodeBody}>
        <span className={summary ? styles.nodeSummary : styles.nodeText}>{summary || "Click to set up"}</span>
      </div>
      <div className={styles.nodeOutputs}>
        {def.outputs.map((o) => (
          <div key={o} className={styles.nodeOutput}>
            <span>{o}</span>
            <Handle type="source" position={Position.Right} id={o} className={styles.handle} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(BlockNode);
