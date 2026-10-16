"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import FlowNode from "./FlowNode";
import { NODE_DEFS, PALETTE } from "./nodeDefs";
import { saveGraph } from "../projects/nodes";
import styles from "./editor.module.css";

const nodeTypes = { flow: FlowNode };
const newId = () => "n_" + Math.random().toString(36).slice(2, 8);
const arrow = { markerEnd: { type: MarkerType.ArrowClosed } };

function Canvas({ fileId, initial }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [status, setStatus] = useState("saved"); // saved | dirty | saving | error
  const { screenToFlowPosition } = useReactFlow();
  const timer = useRef(null);
  const first = useRef(true);
  const pending = useRef(null); // latest unsaved graph, flushed on unmount

  const serialize = (ns, es) => ({
    nodes: ns.map(({ id, type, position, data }) => ({ id, type, position, data })),
    edges: es.map(({ id, source, sourceHandle, target }) => ({ id, source, sourceHandle, target })),
  });

  // autosave, debounced; the first effect run is just the initial state
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setStatus("dirty");
    pending.current = serialize(nodes, edges);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const graph = pending.current;
      pending.current = null;
      setStatus("saving");
      const res = await saveGraph({ id: fileId, graph });
      setStatus(res?.error ? "error" : "saved");
    }, 700);
    return () => clearTimeout(timer.current);
  }, [nodes, edges, fileId]);

  // leaving the file (sidebar navigation) flushes whatever is still pending
  useEffect(
    () => () => {
      if (pending.current) saveGraph({ id: fileId, graph: pending.current });
    },
    [fileId]
  );

  // a full page unload can't be awaited: warn instead
  useEffect(() => {
    const warn = (e) => {
      if (pending.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const onConnect = useCallback((c) => setEdges((eds) => addEdge({ ...c, ...arrow }, eds)), [setEdges]);

  const add = (type) => {
    // drop new nodes near the top-left of the current view, slightly staggered
    const pos = screenToFlowPosition({ x: 520 + (nodes.length % 5) * 24, y: 160 + (nodes.length % 5) * 24 });
    setNodes((ns) => [...ns, { id: newId(), type: "flow", position: pos, data: { type, values: {} } }]);
  };

  return (
    <ReactFlow
      className={styles.flow}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      defaultEdgeOptions={arrow}
      isValidConnection={(c) => c.source !== c.target}
      fitView={initial.nodes.length > 0}
      fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
      minZoom={0.3}
      maxZoom={1.75}
      deleteKeyCode={["Backspace", "Delete"]}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} />
      <Controls showInteractive={false} />
      <MiniMap pannable zoomable />

      {/* palette */}
      <Panel position="top-left" className={styles.palette}>
        {PALETTE.map((group) => (
          <div key={group.kind} className={styles.paletteGroup}>
            <span className={styles.paletteLabel}>{group.kind}s</span>
            {group.types.map((t) => (
              <button key={t} className={styles.paletteItem} type="button" onClick={() => add(t)}>
                <span className={styles.paletteDot} data-kind={group.kind} />
                {NODE_DEFS[t].title}
              </button>
            ))}
          </div>
        ))}
      </Panel>

      {/* save status */}
      <Panel position="top-right" className={styles.status} data-status={status}>
        <span className={styles.statusDot} />
        {status === "saved" ? "Saved" : status === "saving" ? "Saving…" : status === "error" ? "Not saved" : "Unsaved"}
      </Panel>

      {nodes.length === 0 && (
        <Panel position="bottom-center" className={styles.hint}>
          Test editor — add nodes from the left and connect them. Nothing runs yet.
        </Panel>
      )}
    </ReactFlow>
  );
}

export default function Editor({ fileId, graph }) {
  const initial = useMemo(
    () => ({
      nodes: Array.isArray(graph?.nodes) ? graph.nodes : [],
      edges: Array.isArray(graph?.edges) ? graph.edges.map((e) => ({ ...e, ...arrow })) : [],
    }),
    [graph]
  );
  return (
    <div className={styles.wrap}>
      <ReactFlowProvider>
        <Canvas key={fileId} fileId={fileId} initial={initial} />
      </ReactFlowProvider>
    </div>
  );
}
