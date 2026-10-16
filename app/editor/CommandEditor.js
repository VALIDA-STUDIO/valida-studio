"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ReactFlow, ReactFlowProvider, Background, BackgroundVariant, Controls, Panel, useNodesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CommandNode from "./CommandNode";
import { saveCommandGraph } from "../projects/commands";
import styles from "./editor.module.css";

const nodeTypes = { command: CommandNode };

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

function Canvas({ command, initial }) {
  const [nodes, , onNodesChange] = useNodesState(initial);
  const [status, setStatus] = useState("saved"); // saved | dirty | saving | error
  const timer = useRef(null);
  const first = useRef(true);
  const pending = useRef(null);

  // autosave node positions, debounced; the first run is just the initial state
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setStatus("dirty");
    pending.current = { nodes: nodes.map(({ id, position }) => ({ id, position })) };
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const graph = pending.current;
      pending.current = null;
      setStatus("saving");
      const res = await saveCommandGraph({ id: command.id, graph });
      setStatus(res?.error ? "error" : "saved");
    }, 600);
    return () => clearTimeout(timer.current);
  }, [nodes, command.id]);

  // leaving the page flushes whatever is still pending
  useEffect(
    () => () => {
      if (pending.current) saveCommandGraph({ id: command.id, graph: pending.current });
    },
    [command.id]
  );

  return (
    <ReactFlow
      className={styles.flow}
      nodes={nodes}
      edges={[]}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      fitView
      fitViewOptions={{ maxZoom: 1 }}
      minZoom={0.4}
      maxZoom={1.75}
      deleteKeyCode={null}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} />
      <Controls showInteractive={false} />

      <Panel position="top-left" className={styles.toolbar}>
        <Link className={styles.back} href="/canvas/commands">
          <BackIcon />
          Commands
        </Link>
        <span className={styles.toolbarSep} aria-hidden="true" />
        <span className={styles.toolbarTitle}>/{command.name}</span>
      </Panel>

      <Panel position="top-right" className={styles.status} data-status={status}>
        <span className={styles.statusDot} />
        {status === "saved" ? "Saved" : status === "saving" ? "Saving…" : status === "error" ? "Not saved" : "Unsaved"}
      </Panel>

      <Panel position="bottom-center" className={styles.hint}>
        Only the command node for now. Actions will connect to “runs” later.
      </Panel>
    </ReactFlow>
  );
}

export default function CommandEditor({ command, graph }) {
  const initial = useMemo(() => {
    const saved = Array.isArray(graph?.nodes) ? graph.nodes.find((n) => n.id === "command") : null;
    return [{ id: "command", type: "command", position: saved?.position ?? { x: 0, y: 0 }, data: { name: command.name }, deletable: false }];
  }, [graph, command.name]);

  return (
    <div className={styles.wrap}>
      <ReactFlowProvider>
        <Canvas key={command.id} command={command} initial={initial} />
      </ReactFlowProvider>
    </div>
  );
}
