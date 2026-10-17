"use client";

import { memo } from "react";
import { NodeResizer, useReactFlow } from "@xyflow/react";
import styles from "./editor.module.css";

// A group: a named, resizable area. Blocks dropped inside move with it.
function GroupNode({ id, data, selected }) {
  const { updateNodeData } = useReactFlow();
  return (
    <div className={styles.group} data-selected={selected || undefined}>
      <NodeResizer minWidth={220} minHeight={140} lineClassName={styles.groupLine} handleClassName={styles.groupHandle} isVisible={selected} />
      <input
        className={`${styles.groupName} nodrag`}
        value={data.name ?? ""}
        onChange={(e) => updateNodeData(id, { name: e.target.value.slice(0, 40) })}
        placeholder="Group"
        aria-label="Group name"
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}

export default memo(GroupNode);
