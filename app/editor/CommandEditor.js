"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ReactFlow, ReactFlowProvider, Background, BackgroundVariant, Controls, Panel, useNodesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CommandNode from "./CommandNode";
import Inspector from "./Inspector";
import { validateCommand } from "../canvas/commandSchema";
import { saveCommand, saveCommandGraph } from "../projects/commands";
import styles from "./editor.module.css";

const nodeTypes = { command: CommandNode };
const LABELS = { saved: "Saved", dirty: "Unsaved", saving: "Saving…", error: "Not saved" };

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

// Debounced autosave of one value. `save` gets the latest value 600 ms after the last change;
// whatever is still pending is flushed when the page is left.
function useAutosave(value, save, setStatus, enabled = true) {
  const first = useRef(true);
  const timer = useRef(null);
  const pending = useRef(null);
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!enabled) {
      pending.current = null;
      setStatus("error");
      return;
    }
    setStatus("dirty");
    pending.current = value;
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const v = pending.current;
      pending.current = null;
      setStatus("saving");
      const ok = await saveRef.current(v);
      setStatus(ok ? "saved" : "error");
    }, 600);
    return () => clearTimeout(timer.current);
  }, [value, enabled, setStatus]);

  useEffect(
    () => () => {
      if (pending.current) saveRef.current(pending.current);
    },
    []
  );
}

function Editor({ command, graph }) {
  const [cmd, setCmd] = useState(() => ({
    name: command.name ?? "",
    description: command.description ?? "",
    permission: command.permission ?? "",
    aliases: Array.isArray(command.aliases) ? command.aliases : [],
    sender: command.sender ?? "any",
    args: Array.isArray(command.args) ? command.args : [],
  }));
  const [serverErrors, setServerErrors] = useState({});
  const [status, setStatus] = useState("saved");
  const check = useMemo(() => validateCommand(cmd), [cmd]);
  const errors = { ...check.errors, ...serverErrors };

  // the single command node; position comes from the saved graph
  const initialNodes = useMemo(() => {
    const saved = Array.isArray(graph?.nodes) ? graph.nodes.find((n) => n.id === "command") : null;
    return [{ id: "command", type: "command", position: saved?.position ?? { x: 0, y: 0 }, data: {}, deletable: false }];
  }, [graph]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  // keep the node in sync with the settings
  useEffect(() => {
    const data = { name: check.value.name || cmd.name, args: check.value.args, description: check.value.description };
    setNodes((ns) => ns.map((n) => (n.id === "command" ? { ...n, data } : n)));
  }, [check, cmd.name, setNodes]);

  // settings autosave (only when valid); positions autosave
  const settingsValue = useMemo(() => (check.ok ? JSON.stringify(check.value) : null), [check]);
  useAutosave(
    settingsValue,
    async (json) => {
      const res = await saveCommand({ id: command.id, command: JSON.parse(json) });
      setServerErrors(res?.errors ?? {});
      return !res?.error;
    },
    setStatus,
    check.ok
  );
  const positions = useMemo(() => JSON.stringify(nodes.map(({ id, position }) => ({ id, position }))), [nodes]);
  useAutosave(positions, async (json) => !(await saveCommandGraph({ id: command.id, graph: { nodes: JSON.parse(json) } }))?.error, setStatus);

  return (
    <>
      <div className={styles.canvas}>
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
            <span className={styles.toolbarTitle}>/{check.value.name || cmd.name || "…"}</span>
          </Panel>

          <Panel position="top-right" className={styles.status} data-status={status}>
            <span className={styles.statusDot} />
            {LABELS[status]}
          </Panel>

          <Panel position="bottom-center" className={styles.hint}>
            Only the command node for now. Actions will connect to “runs” later.
          </Panel>
        </ReactFlow>
      </div>
      <Inspector cmd={cmd} errors={errors} onChange={setCmd} />
    </>
  );
}

export default function CommandEditor({ command, graph }) {
  return (
    <div className={styles.wrap}>
      <ReactFlowProvider>
        <Editor key={command.id} command={command} graph={graph} />
      </ReactFlowProvider>
    </div>
  );
}
