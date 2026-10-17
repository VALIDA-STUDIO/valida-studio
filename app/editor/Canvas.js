"use client";

import { useCallback, useEffect, useState } from "react";
import { ReactFlow, ReactFlowProvider, Background, BackgroundVariant, Controls, useNodesState, useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CommandNode from "./CommandNode";
import { ADD_EVENT, DRAG_TYPE } from "./blocks";
import styles from "./editor.module.css";

const nodeTypes = { command: CommandNode };
const deleteKeys = ["Backspace", "Delete"];
const newId = () => "n_" + Math.random().toString(36).slice(2, 8);

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [over, setOver] = useState(false);
  const { screenToFlowPosition } = useReactFlow();

  const add = useCallback(
    (type, position) => {
      const id = newId();
      setNodes((ns) => ns.map((n) => ({ ...n, selected: false })).concat({ id, type, position, data: { name: "" }, selected: true }));
    },
    [setNodes]
  );

  // click in the sidebar: drop the block near the middle of the view
  useEffect(() => {
    const onAdd = (e) => {
      const el = document.querySelector(`.${styles.flow}`);
      const r = el?.getBoundingClientRect();
      const base = screenToFlowPosition({ x: (r?.left ?? 0) + (r?.width ?? 800) / 2 - 120, y: (r?.top ?? 0) + (r?.height ?? 600) / 2 - 70 });
      add(e.detail.type, { x: base.x + (nodes.length % 5) * 24, y: base.y + (nodes.length % 5) * 24 });
    };
    window.addEventListener(ADD_EVENT, onAdd);
    return () => window.removeEventListener(ADD_EVENT, onAdd);
  }, [add, nodes.length, screenToFlowPosition]);

  // drag from the sidebar: drop exactly where the pointer is
  const onDragOver = (e) => {
    if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setOver(true);
  };
  const onDrop = (e) => {
    const type = e.dataTransfer.getData(DRAG_TYPE);
    setOver(false);
    if (!type) return;
    e.preventDefault();
    add(type, screenToFlowPosition({ x: e.clientX - 120, y: e.clientY - 20 }));
  };

  return (
    <ReactFlow
      className={styles.flow}
      data-over={over || undefined}
      nodes={nodes}
      edges={[]}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onDragOver={onDragOver}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      minZoom={0.4}
      maxZoom={1.75}
      deleteKeyCode={deleteKeys}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

// The node canvas. Blocks come from the sidebar, nothing is saved yet.
export default function Canvas() {
  return (
    <div className={styles.wrap}>
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  );
}
