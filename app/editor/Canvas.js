"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProjectVarsContext, ProjectIdContext } from "./useVars";
import { ReactFlow, ReactFlowProvider, Background, BackgroundVariant, Controls, MarkerType, ConnectionLineType, addEdge, useNodesState, useEdgesState, useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import EventNode from "./EventNode";
import ActionNode from "./ActionNode";
import ConditionNode from "./ConditionNode";
import ModifyNode from "./ModifyNode";
import FlowEdge from "./FlowEdge";
import LoopNode from "./LoopNode";
import { ADD_EVENT, DRAG_TYPE, BLOCKS } from "./blocks";
import { saveGraph } from "../projects/actions";
import styles from "./editor.module.css";

const nodeTypes = { event: EventNode, action: ActionNode, broadcast: ActionNode, condition: ConditionNode, modify: ModifyNode, loop: LoopNode };
// kind of each node type, and the colour its connections get
const KIND = { event: "event", action: "action", broadcast: "action", condition: "condition", modify: "action", loop: "action" };
const KIND_COLOR = { command: "var(--kind-command)", event: "var(--kind-event)", condition: "var(--kind-condition)", action: "var(--kind-action)" };
const edgeTypes = { flow: FlowEdge };
const arrow = { type: "flow", animated: true, markerEnd: { type: MarkerType.ArrowClosed } };
const deleteKeys = ["Backspace", "Delete"];
const fitViewOptions = { maxZoom: 1, padding: 0.3 };
const snapGrid = [8, 8];
const connectionLineStyle = { strokeDasharray: "6 4" };
const newId = () => "n_" + Math.random().toString(36).slice(2, 8);

// graph JSON → nodes/edges React Flow can render
const hydrate = (graph) => ({
  nodes: (Array.isArray(graph?.nodes) ? graph.nodes : [])
    .filter((n) => nodeTypes[n.type])
    .map((n) => (n.type === "broadcast" ? { ...n, type: "action", data: { action: "broadcast", values: { message: n.data?.message ?? "" } } } : n)),
  edges: (Array.isArray(graph?.edges) ? graph.edges : []).map((e) => ({ ...e, ...arrow })),
});

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

  // undo / redo: snapshots of the graph; quick successive edits (typing) merge into one step
  const past = useRef([]);
  const future = useRef([]);
  const lastJson = useRef(json);
  const lastPush = useRef(0);
  const applying = useRef(false);
  const announce = () => window.dispatchEvent(new CustomEvent("valida:history", { detail: { canUndo: past.current.length > 0, canRedo: future.current.length > 0 } }));
  useEffect(() => {
    if (json === lastJson.current) return;
    if (applying.current) {
      applying.current = false;
      lastJson.current = json;
      return;
    }
    const now = Date.now();
    if (now - lastPush.current > 500) past.current.push(lastJson.current);
    if (past.current.length > 100) past.current.shift();
    future.current = [];
    lastPush.current = now;
    lastJson.current = json;
    announce();
  }, [json]);
  const restore = useCallback(
    (snapshot) => {
      applying.current = true;
      const g = hydrate(JSON.parse(snapshot));
      setNodes(g.nodes);
      setEdges(g.edges);
      lastPush.current = 0;
    },
    [setNodes, setEdges]
  );
  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (prev === undefined) return;
    future.current.push(lastJson.current);
    restore(prev);
    announce();
  }, [restore]);
  const redo = useCallback(() => {
    const next = future.current.pop();
    if (next === undefined) return;
    past.current.push(lastJson.current);
    restore(next);
    announce();
  }, [restore]);
  useEffect(() => {
    const onUndo = () => undo();
    const onRedo = () => redo();
    const onKey = (e) => {
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") (e.preventDefault(), redo());
        return;
      }
      e.preventDefault();
      e.shiftKey ? redo() : undo();
    };
    window.addEventListener("valida:undo", onUndo);
    window.addEventListener("valida:redo", onRedo);
    window.addEventListener("keydown", onKey);
    announce();
    return () => {
      window.removeEventListener("valida:undo", onUndo);
      window.removeEventListener("valida:redo", onRedo);
      window.removeEventListener("keydown", onKey);
    };
  }, [undo, redo]);
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
    (blockId, position) => {
      const block = BLOCKS.find((b) => b.id === blockId);
      if (!block) return;
      const id = newId();
      setNodes((ns) => ns.map((n) => ({ ...n, selected: false })).concat({ id, type: block.node.type, position, data: structuredClone(block.node.data), selected: true }));
    },
    [setNodes]
  );

  // click in the sidebar: drop the block near the middle of the view
  useEffect(() => {
    const onAdd = (e) => {
      const el = document.querySelector(`.${styles.flow}`);
      const r = el?.getBoundingClientRect();
      const base = screenToFlowPosition({ x: (r?.left ?? 0) + (r?.width ?? 800) / 2 - 120, y: (r?.top ?? 0) + (r?.height ?? 600) / 2 - 70 });
      add(e.detail.id, { x: base.x + (nodes.length % 5) * 24, y: base.y + (nodes.length % 5) * 24 });
    };
    window.addEventListener(ADD_EVENT, onAdd);
    return () => window.removeEventListener(ADD_EVENT, onAdd);
  }, [add, nodes.length, screenToFlowPosition]);

  // connections take the colour of the block they start from
  const styledEdges = useMemo(() => {
    const kindOf = new Map(nodes.map((n) => [n.id, KIND[n.type] ?? "action"]));
    return edges.map((e) => {
      const color = KIND_COLOR[kindOf.get(e.source)] ?? "var(--muted)";
      return { ...e, type: "flow", style: { stroke: color }, markerEnd: { type: MarkerType.ArrowClosed, color } };
    });
  }, [nodes, edges]);

  // an output may feed several blocks (they all run); never into itself, no duplicate line
  const isValidConnection = useCallback(
    (c) => c.source !== c.target && !edges.some((e) => e.source === c.source && (e.sourceHandle ?? null) === (c.sourceHandle ?? null) && e.target === c.target),
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
    const blockId = e.dataTransfer.getData(DRAG_TYPE);
    setOver(false);
    if (!blockId) return;
    e.preventDefault();
    add(blockId, screenToFlowPosition({ x: e.clientX - 120, y: e.clientY - 20 }));
  };

  return (
    <ReactFlow
      className={styles.flow}
      data-over={over || undefined}
      nodes={nodes}
      edges={styledEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
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
      connectionLineType={ConnectionLineType.Step}
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
      {nodes.length === 0 && (
        <div className={styles.emptyHint} aria-hidden="true">
          Drag a block from the left, or click one.
        </div>
      )}
    </ReactFlow>
  );
}

// The node canvas of a project. Blocks come from the sidebar; changes are saved on the project.
export default function Canvas({ projectId, graph, variables = [] }) {
  const initial = useMemo(() => hydrate(graph), [graph]);
  const [vars, setVars] = useState(variables);
  useEffect(() => setVars(variables), [variables]);
  useEffect(() => {
    const on = (e) => setVars(e.detail);
    window.addEventListener("valida:variables", on);
    return () => window.removeEventListener("valida:variables", on);
  }, []);
  return (
    <div className={styles.wrap}>
      <ProjectIdContext.Provider value={projectId}>
        <ProjectVarsContext.Provider value={vars}>
          <ReactFlowProvider>
            <Flow projectId={projectId} initial={initial} />
          </ReactFlowProvider>
        </ProjectVarsContext.Provider>
      </ProjectIdContext.Provider>
    </div>
  );
}
