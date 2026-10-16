"use client";

import { memo } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { NODE_DEFS } from "./nodeDefs";
import styles from "./editor.module.css";

// One node card: kind label, title, optional fields, labelled output handles.
function FlowNode({ id, data, selected }) {
  const def = NODE_DEFS[data.type] ?? { kind: "action", title: data.type, outputs: ["then"] };
  const { updateNodeData } = useReactFlow();
  const outputs = def.outputs ?? [];

  return (
    <div className={styles.node} data-kind={def.kind} data-selected={selected || undefined}>
      {def.kind !== "event" && <Handle type="target" position={Position.Left} className={styles.handle} />}

      <div className={styles.nodeHead}>
        <span className={styles.nodeKind}>{def.kind}</span>
        <span className={styles.nodeTitle}>{def.title}</span>
      </div>

      {def.fields?.length > 0 && (
        <div className={styles.nodeBody}>
          {def.fields.map((f) => (
            <label key={f.key} className={styles.nodeField}>
              <span>{f.label}</span>
              <input
                className="nodrag"
                value={data.values?.[f.key] ?? ""}
                placeholder={f.placeholder}
                onChange={(e) => updateNodeData(id, { values: { ...(data.values ?? {}), [f.key]: e.target.value } })}
              />
            </label>
          ))}
        </div>
      )}

      <div className={styles.nodeOutputs}>
        {outputs.map((o) => (
          <div key={o} className={styles.nodeOutput}>
            <span>{o}</span>
            <Handle type="source" position={Position.Right} id={o} className={styles.handle} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(FlowNode);
