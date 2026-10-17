"use client";

import { memo, useRef } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useVars } from "./useVars";
import VarChips from "./VarChips";
import NodeSelect from "./NodeSelect";
import styles from "./editor.module.css";

// What a loop can go over, and the variable it hands to the blocks on "each".
export const LOOPS = {
  online_players: { label: "Online players", each: { id: "each", label: "each player", type: "Player" }, paper: "Bukkit.getOnlinePlayers()" },
  inventory: { label: "Items in an inventory", source: { key: "player", label: "Player", placeholder: "{player}" }, each: { id: "each", label: "each item", type: "ItemStack" }, paper: "player.getInventory().getContents()" },
  times: { label: "A number of times", source: { key: "count", label: "Times", placeholder: "5", number: true }, each: { id: "each", label: "index", type: "Number" }, paper: "for (int i = 0; i < n; i++)" },
};

const RepeatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);

// For each: runs the blocks on "each" once per item, then continues on "done".
function LoopNode({ id, data, selected }) {
  const { updateNodeData } = useReactFlow();
  const loop = LOOPS[data.over] ?? LOOPS.online_players;
  const values = data.values ?? {};
  const vars = useVars(id);
  const last = useRef(null);
  const set = (key, v) => updateNodeData(id, { values: { ...values, [key]: v } });
  const insert = (path) => {
    const el = last.current;
    if (!el) return;
    const key = el.dataset.key;
    const text = values[key] ?? "";
    const token = `{${path}}`;
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    set(key, text.slice(0, start) + token + text.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    });
  };

  return (
    <div className={styles.node} data-kind="action" data-selected={selected || undefined}>
      <Handle type="target" position={Position.Left} className={styles.handle} />
      <div className={styles.nodeHead}>
        <span className={`${styles.nodeBadge} ${styles.nodeBadgeAction}`} data-kind="action">
          <RepeatIcon />
        </span>
        <span className={styles.nodeKind}>For each</span>
      </div>
      <div className={styles.nodeBody}>
        <NodeSelect value={loop === LOOPS[data.over] ? data.over : "online_players"} options={Object.entries(LOOPS).map(([k, l]) => ({ id: k, label: l.label }))} onChange={(v) => updateNodeData(id, { over: v, values: {} })} label="Loop over" />
        {loop.source && (
          <label className={styles.condField} data-wide="" style={{ marginTop: 10 }}>
            <span className={styles.nodeLabel}>{loop.source.label}</span>
            <input
              className={`${styles.nodeInput} nodrag`}
              data-key={loop.source.key}
              value={values[loop.source.key] ?? ""}
              onChange={(e) => set(loop.source.key, loop.source.number ? e.target.value.replace(/[^0-9]/g, "") : e.target.value)}
              onFocus={(e) => (last.current = e.target)}
              placeholder={loop.source.placeholder}
              inputMode={loop.source.number ? "numeric" : undefined}
              autoComplete="off"
              spellCheck={false}
              aria-label={loop.source.label}
            />
          </label>
        )}
        {loop.source && !loop.source.number && vars.length > 0 && <VarChips vars={vars} onInsert={insert} />}
        <div className={styles.vars} style={{ marginTop: 10 }}>
          <span className={styles.var} title={`${loop.each.type}: ${loop.each.label}`}>{`{${loop.each.id}}`}</span>
          <span className={styles.nodeText}>{loop.each.label}</span>
        </div>
      </div>
      <div className={styles.nodeOutputs}>
        <div className={styles.nodeOutput} data-flow="">
          <span>each</span>
          <Handle type="source" position={Position.Right} id="each" className={styles.handle} />
        </div>
        <div className={styles.nodeOutput} data-flow="">
          <span>done</span>
          <Handle type="source" position={Position.Right} id="done" className={styles.handle} />
        </div>
      </div>
    </div>
  );
}

export default memo(LoopNode);
