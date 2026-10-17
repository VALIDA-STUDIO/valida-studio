"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReactFlow, ReactFlowProvider, Background, BackgroundVariant, Controls, MiniMap, Panel, MarkerType, ConnectionLineType, addEdge, useNodesState, useEdgesState, useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import EventNode from "./EventNode";
import BroadcastNode from "./BroadcastNode";
import { DEFAULT_EVENT } from "./events";
import { ADD_EVENT, DRAG_TYPE } from "./blocks";
import { saveGraph } from "../projects/actions";
import styles from "./editor.module.css";

const nodeTypes = { event: EventNode, broadcast: BroadcastNode };
const arrow = { markerEnd: { type: MarkerType.ArrowClosed } };
const deleteKeys = ["Backspace", "Delete"];
const fitViewOptions = { maxZoom: 1, padding: 0.3 };
const snapGrid = [8, 8];
const connectionLineStyle = { strokeDasharray: "6 4" };
const newId = () => "n_" + Math.random().toString(36).slice(2, 8);

// what gets stored: nodes with their data, edges with their handles
const serialize = (nodes, edges) => ({
  nodes: nodes.map(({ id, type, position, data }) => ({ id, type, position, data })),
  edges: edges.map(({ id, source, sourceHandle, target }) => ({ id, source, sourceHandle, target })),
});

function Flow({ projectId, initial }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  // silent autosave: 600 ms after the last change; whatever is pending is flushed when leaving
  const json = useMemo(() => JSON.stringify(serialize(nodes, edges)), [nodes, edges]);
  const first = useRef(true);
  const pending = useRef(null);
  const timer = useRef(null);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!projectId) return;
    pending.current = json;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const g = pending.current;
      pending.current = null;
      saveGraph({ projectId, graph: JSON.parse(g) });
    }, 600);
    return () => clearTimeout(timer.current);
  }, [json, projectId]);
  useEffect(
    () => () => {
      if (pending.current && projectId) saveGraph({ projectId, graph: JSON.parse(pending.current) });
    },
    [projectId]
  );
  const [over, setOver] = useState(false);
  const { screenToFlowPosition } = useReactFlow();

  const add = useCallback(
    (type, position) => {
      const id = newId();
      setNodes((ns) => ns.map((n) => ({ ...n, selected: false })).concat({ id, type, position, data: type === "event" ? { event: DEFAULT_EVENT } : {}, selected: true }));
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

  // one connection per output, never into itself
  const isValidConnection = useCallback(
    (c) => c.source !== c.target && !edges.some((e) => e.source === c.source && (e.sourceHandle ?? null) === (c.sourceHandle ?? null)),
    [edges]
  );
  const onConnect = useCallback((c) => setEdges((es) => addEdge({ ...c, ...arrow }, es)), [setEdges]);

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
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      isValidConnection={isValidConnection}
      defaultEdgeOptions={arrow}
      onDragOver={onDragOver}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      snapToGrid
      snapGrid={snapGrid}
      connectionLineType={ConnectionLineType.SmoothStep}
      connectionLineStyle={connectionLineStyle}
      fitView={initial.nodes.length > 0}
      fitViewOptions={fitViewOptions}
      minZoom={0.4}
      maxZoom={1.75}
      deleteKeyCode={deleteKeys}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} />
      <Controls showInteractive={false} />
      <MiniMap pannable zoomable />
      {nodes.length === 0 && (
        <Panel position="bottom-center" className={styles.hint}>
          Drag a block from the left, or click one.
        </Panel>
      )}
    </ReactFlow>
  );
}

// The node canvas of a project. Blocks come from the sidebar; changes are saved on the project.
export default function Canvas({ projectId, graph }) {
  const initial = useMemo(
    () => ({
      nodes: (Array.isArray(graph?.nodes) ? graph.nodes : []).filter((n) => nodeTypes[n.type]),
      edges: (Array.isArray(graph?.edges) ? graph.edges : []).map((e) => ({ ...e, ...arrow })),
    }),
    [graph]
  );
  return (
    <div className={styles.wrap}>
      <ReactFlowProvider>
        <Flow projectId={projectId} initial={initial} />
      </ReactFlowProvider>
    </div>
  );
}
