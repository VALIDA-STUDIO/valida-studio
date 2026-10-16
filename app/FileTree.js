"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createNode, renameNode, deleteNode } from "./projects/nodes";
import styles from "./FileTree.module.css";

const icon = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const ChevronIcon = () => (
  <svg {...icon} width="12" height="12">
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const FolderIcon = () => (
  <svg {...icon} width="15" height="15">
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </svg>
);
const FolderOpenIcon = () => (
  <svg {...icon} width="15" height="15">
    <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
  </svg>
);
const FileIcon = () => (
  <svg {...icon} width="15" height="15">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </svg>
);
const FilePlusIcon = () => (
  <svg {...icon} width="13" height="13">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4M9 15h6M12 12v6" />
  </svg>
);
const FolderPlusIcon = () => (
  <svg {...icon} width="13" height="13">
    <path d="M12 10v6M9 13h6" />
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </svg>
);
const PencilIcon = () => (
  <svg {...icon} width="13" height="13">
    <path d="M21.17 6.83a2.83 2.83 0 0 0-4-4L4 16l-1 5 5-1z" />
    <path d="m15 5 4 4" />
  </svg>
);
const TrashIcon = () => (
  <svg {...icon} width="13" height="13">
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);
const CheckIcon = () => (
  <svg {...icon} width="13" height="13" strokeWidth="2.5">
    <path d="m5 12 5 5L20 7" />
  </svg>
);
const XIcon = () => (
  <svg {...icon} width="13" height="13">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

// folders first, then files, both alphabetical
const sortNodes = (a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name, undefined, { sensitivity: "base" }) : a.kind === "folder" ? -1 : 1);

// Inline name editor used for both create and rename
function NameInput({ initial, placeholder, onCommit, onCancel }) {
  const [value, setValue] = useState(initial);
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    // select the name without its extension
    const dot = initial.lastIndexOf(".");
    ref.current?.setSelectionRange(0, dot > 0 ? dot : initial.length);
  }, [initial]);

  const commit = () => (value.trim() && value.trim() !== initial ? onCommit(value) : onCancel());

  return (
    <input
      ref={ref}
      className={styles.input}
      value={value}
      placeholder={placeholder}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") onCancel();
      }}
      maxLength={60}
      autoComplete="off"
      spellCheck={false}
      aria-label={placeholder}
    />
  );
}

export default function FileTree({ projectId, nodes }) {
  const storageKey = `valida.tree.${projectId}`;
  const [expanded, setExpanded] = useState(() => new Set());
  const [editing, setEditing] = useState(null); // { mode: "create", parentId, kind } | { mode: "rename", id } | { mode: "delete", id }
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  // remember open folders per project on this device
  useEffect(() => {
    try {
      setExpanded(new Set(JSON.parse(localStorage.getItem(storageKey) ?? "[]")));
    } catch {}
  }, [storageKey]);
  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };
  const open = (id) =>
    setExpanded((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {}
      return next;
    });

  const children = useMemo(() => {
    const map = new Map();
    for (const n of nodes) {
      const key = n.parent_id ?? "root";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(n);
    }
    for (const list of map.values()) list.sort(sortNodes);
    return map;
  }, [nodes]);

  const run = (action, after) =>
    startTransition(async () => {
      const res = await action();
      if (res?.error) setError(res.error);
      else {
        setError("");
        after?.(res);
      }
    });

  const startCreate = (parentId, kind) => {
    if (parentId) open(parentId);
    setError("");
    setEditing({ mode: "create", parentId, kind });
  };

  const renderRow = (n, depth) => {
    const isFolder = n.kind === "folder";
    const isOpen = isFolder && expanded.has(n.id);
    const indent = { paddingLeft: 8 + depth * 14 };

    if (editing?.mode === "rename" && editing.id === n.id) {
      return (
        <div key={n.id} className={styles.row} style={indent}>
          <span className={styles.caret} />
          <span className={styles.kind}>{isFolder ? <FolderIcon /> : <FileIcon />}</span>
          <NameInput
            initial={n.name}
            placeholder="Name"
            onCommit={(name) => run(() => renameNode({ id: n.id, name }), () => setEditing(null))}
            onCancel={() => setEditing(null)}
          />
        </div>
      );
    }

    if (editing?.mode === "delete" && editing.id === n.id) {
      return (
        <div key={n.id} className={`${styles.row} ${styles.confirm}`} style={indent}>
          <span className={styles.caret} />
          <span className={styles.confirmText}>
            Delete <strong>{n.name}</strong>{isFolder ? " and its contents" : ""}?
          </span>
          <button className={styles.action} type="button" aria-label="Cancel" onClick={() => setEditing(null)}>
            <XIcon />
          </button>
          <button
            className={`${styles.action} ${styles.danger}`}
            type="button"
            aria-label="Confirm delete"
            disabled={pending}
            onClick={() => run(() => deleteNode(n.id), () => setEditing(null))}
          >
            <CheckIcon />
          </button>
        </div>
      );
    }

    return (
      <div key={n.id}>
        <div
          className={styles.row}
          style={indent}
          data-selected={selected === n.id || undefined}
          onClick={() => (isFolder ? toggle(n.id) : setSelected(n.id))}
          onDoubleClick={() => setEditing({ mode: "rename", id: n.id })}
          role="treeitem"
          aria-expanded={isFolder ? isOpen : undefined}
          aria-selected={selected === n.id}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") isFolder ? toggle(n.id) : setSelected(n.id);
            if (e.key === "F2") setEditing({ mode: "rename", id: n.id });
            if (e.key === "Delete") setEditing({ mode: "delete", id: n.id });
          }}
        >
          <span className={styles.caret} data-open={isOpen || undefined}>
            {isFolder && <ChevronIcon />}
          </span>
          <span className={styles.kind}>{isFolder ? isOpen ? <FolderOpenIcon /> : <FolderIcon /> : <FileIcon />}</span>
          <span className={styles.name}>{n.name}</span>
          <span className={styles.actions} onClick={(e) => e.stopPropagation()}>
            {isFolder && (
              <>
                <button className={styles.action} type="button" title="New file" aria-label={`New file in ${n.name}`} onClick={() => startCreate(n.id, "file")}>
                  <FilePlusIcon />
                </button>
                <button className={styles.action} type="button" title="New folder" aria-label={`New folder in ${n.name}`} onClick={() => startCreate(n.id, "folder")}>
                  <FolderPlusIcon />
                </button>
              </>
            )}
            <button className={styles.action} type="button" title="Rename" aria-label={`Rename ${n.name}`} onClick={() => setEditing({ mode: "rename", id: n.id })}>
              <PencilIcon />
            </button>
            <button className={styles.action} type="button" title="Delete" aria-label={`Delete ${n.name}`} onClick={() => setEditing({ mode: "delete", id: n.id })}>
              <TrashIcon />
            </button>
          </span>
        </div>
        {isFolder && isOpen && renderChildren(n.id, depth + 1)}
      </div>
    );
  };

  const renderChildren = (parentKey, depth) => {
    const list = children.get(parentKey) ?? [];
    const creating = editing?.mode === "create" && (editing.parentId ?? "root") === parentKey;
    return (
      <>
        {list.map((n) => renderRow(n, depth))}
        {creating && (
          <div className={styles.row} style={{ paddingLeft: 8 + depth * 14 }}>
            <span className={styles.caret} />
            <span className={styles.kind}>{editing.kind === "folder" ? <FolderIcon /> : <FileIcon />}</span>
            <NameInput
              initial=""
              placeholder={editing.kind === "folder" ? "Folder name" : "File name"}
              onCommit={(name) =>
                run(
                  () => createNode({ projectId, parentId: editing.parentId, kind: editing.kind, name }),
                  () => setEditing(null)
                )
              }
              onCancel={() => setEditing(null)}
            />
          </div>
        )}
      </>
    );
  };

  const empty = !nodes.length && editing?.mode !== "create";

  return (
    <div className={styles.tree} data-pending={pending || undefined}>
      <div className={styles.head}>
        <span className={styles.headLabel}>Files</span>
        <span className={styles.headActions}>
          <button className={styles.action} type="button" title="New file" aria-label="New file" onClick={() => startCreate(null, "file")}>
            <FilePlusIcon />
          </button>
          <button className={styles.action} type="button" title="New folder" aria-label="New folder" onClick={() => startCreate(null, "folder")}>
            <FolderPlusIcon />
          </button>
        </span>
      </div>

      <div role="tree" aria-label="Project files">
        {renderChildren("root", 0)}
      </div>

      {empty && <p className={styles.empty}>No files yet.</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
