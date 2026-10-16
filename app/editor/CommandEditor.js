"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  MarkerType,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CommandNode from "./CommandNode";
import BlockNode from "./BlockNode";
import Inspector from "./Inspector";
import BlockPanel from "./BlockPanel";
import { BLOCKS, PALETTE } from "./blockDefs";
import { BLOCK_ICONS } from "./blockIcons";
import { validateCommand } from "../canvas/commandSchema";
import { saveCommand, saveCommandGraph, deleteCommand } from "../projects/commands";
import styles from "./editor.module.css";

const nodeTypes = { command: CommandNode, block: BlockNode };
const LABELS = { saved: "Saved", dirty: "Unsaved", saving: "Saving…", error: "Not saved" };
const arrow = { markerEnd: { type: MarkerType.ArrowClosed } };
const fitViewOptions = { maxZoom: 1, padding: 0.3 };
const deleteKeys = ["Backspace", "Delete"];
const newId = () => "b_" + Math.random().toString(36).slice(2, 8);

const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

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

// graph as stored: block nodes with their values, the command node's position only, and the edges
const serialize = (nodes, edges) => ({
  nodes: nodes.map((n) => (n.id === "command" ? { id: n.id, position: n.position } : { id: n.id, type: n.type, position: n.position, data: n.data })),
  edges: edges.map(({ id, source, sourceHandle, target }) => ({ id, source, sourceHandle, target })),
});

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
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [deleting, startDelete] = useTransition();
  const router = useRouter();
  const { fitView } = useReactFlow();
  const gone = useRef(false); // set once deleted so no autosave fires afterwards
  const check = useMemo(() => validateCommand(cmd), [cmd]);
  const errors = { ...check.errors, ...serverErrors };

  // nodes + edges from the saved graph; the command node always exists and can't be deleted
  const initial = useMemo(() => {
    const saved = Array.isArray(graph?.nodes) ? graph.nodes : [];
    const commandPos = saved.find((n) => n.id === "command")?.position ?? { x: 0, y: 0 };
    const blocks = saved
      .filter((n) => n.id !== "command" && BLOCKS[n.data?.type])
      .map((n) => ({ id: n.id, type: "block", position: n.position ?? { x: 0, y: 0 }, data: n.data }));
    const ids = new Set(["command", ...blocks.map((b) => b.id)]);
    const edges = (Array.isArray(graph?.edges) ? graph.edges : []).filter((e) => ids.has(e.source) && ids.has(e.target)).map((e) => ({ ...e, ...arrow }));
    return { nodes: [{ id: "command", type: "command", position: commandPos, data: {}, deletable: false }, ...blocks], edges };
  }, [graph]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  // keep the command node in sync with the settings
  useEffect(() => {
    const data = { name: check.value.name || cmd.name, args: check.value.args, description: check.value.description };
    setNodes((ns) => ns.map((n) => (n.id === "command" ? { ...n, data } : n)));
  }, [check, cmd.name, setNodes]);

  const remove = () =>
    startDelete(async () => {
      const res = await deleteCommand(command.id);
      if (res?.error) return setStatus("error");
      gone.current = true;
      router.push("/canvas/commands");
    });

  // settings autosave (only when valid); graph autosave
  const settingsValue = useMemo(() => (check.ok ? JSON.stringify(check.value) : null), [check]);
  useAutosave(
    settingsValue,
    async (json) => {
      if (gone.current) return true;
      const res = await saveCommand({ id: command.id, command: JSON.parse(json) });
      setServerErrors(res?.errors ?? {});
      return !res?.error;
    },
    setStatus,
    check.ok
  );
  const graphValue = useMemo(() => JSON.stringify(serialize(nodes, edges)), [nodes, edges]);
  useAutosave(graphValue, async (json) => gone.current || !(await saveCommandGraph({ id: command.id, graph: JSON.parse(json) }))?.error, setStatus);

  // one connection per output; never into the command node or into itself
  const isValidConnection = useCallback(
    (c) => c.source !== c.target && c.target !== "command" && !edges.some((e) => e.source === c.source && (e.sourceHandle ?? null) === (c.sourceHandle ?? null)),
    [edges]
  );
  const onConnect = useCallback((c) => setEdges((eds) => addEdge({ ...c, ...arrow }, eds)), [setEdges]);

  // selection → which panel is open; same value never re-renders
  const onSelectionChange = useCallback(({ nodes: sel }) => {
    const next = sel[0]?.id ?? null;
    setSelectedId((prev) => (prev === next ? prev : next));
  }, []);

  // new blocks line up to the right of the command, one below the other
  const addBlock = (type) => {
    const cmdNode = nodes.find((n) => n.id === "command");
    const count = nodes.length - 1;
    const pos = { x: (cmdNode?.position.x ?? 0) + 320, y: (cmdNode?.position.y ?? 0) + count * 130 };
    const id = newId();
    setNodes((ns) => ns.map((n) => ({ ...n, selected: false })).concat({ id, type: "block", position: pos, data: { type, values: {} }, selected: true }));
    setSelectedId(id);
    // keep everything in view now that the panel takes part of the width
    setTimeout(() => fitView({ ...fitViewOptions, duration: 200 }), 50);
  };
  const removeBlock = (id) => {
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
    setSelectedId(null);
  };
  const updateBlock = (id, data) => setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, data } : n)));

  const selected = nodes.find((n) => n.id === selectedId) ?? null;

  return (
    <>
      <div className={styles.canvas}>
        <ReactFlow
          className={styles.flow}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          isValidConnection={isValidConnection}
          defaultEdgeOptions={arrow}
          fitView
          fitViewOptions={fitViewOptions}
          minZoom={0.4}
          maxZoom={1.75}
          deleteKeyCode={deleteKeys}
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

          {/* block picker, under the toolbar */}
          <Panel position="top-left" className={styles.palette} aria-label="Blocks">
            <label className={styles.paletteSearch}>
              <SearchIcon />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search blocks" aria-label="Search blocks" autoComplete="off" spellCheck={false} />
            </label>
            {PALETTE.map((group) => {
              const types = group.types.filter((t) => !query || BLOCKS[t].title.toLowerCase().includes(query.toLowerCase()));
              if (!types.length) return null;
              return (
                <div key={group.kind} className={styles.paletteGroup}>
                  <span className={styles.paletteLabel}>{group.label}</span>
                  {types.map((t) => {
                    const Icon = BLOCK_ICONS[t];
                    return (
                      <button key={t} className={styles.paletteItem} type="button" onClick={() => addBlock(t)}>
                        <span className={styles.paletteIcon} data-kind={group.kind}>
                          {Icon && <Icon />}
                        </span>
                        <span className={styles.paletteText}>
                          <span className={styles.paletteTitle}>{BLOCKS[t].title}</span>
                          <span className={styles.paletteDesc}>{BLOCKS[t].desc}</span>
                        </span>
                        <span className={styles.paletteAdd} aria-hidden="true">
                          <PlusIcon />
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
            {query && !PALETTE.some((g) => g.types.some((t) => BLOCKS[t].title.toLowerCase().includes(query.toLowerCase()))) && (
              <span className={styles.paletteEmpty}>No block matches “{query}”.</span>
            )}
          </Panel>

          {!selected && (
            <Panel position="bottom-center" className={styles.hint}>
              Click the command to edit it. Add blocks from the left and connect “runs” to them.
            </Panel>
          )}
        </ReactFlow>
      </div>

      {selected?.id === "command" && <Inspector cmd={cmd} errors={errors} onChange={setCmd} onDelete={remove} deleting={deleting} />}
      {selected && selected.id !== "command" && <BlockPanel key={selected.id} node={selected} onChange={(data) => updateBlock(selected.id, data)} onRemove={() => removeBlock(selected.id)} />}
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
