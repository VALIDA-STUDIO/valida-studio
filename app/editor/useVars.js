"use client";

import { useStore } from "@xyflow/react";
import { EVENTS } from "./events";

// Walks the edges backwards from a node and returns the event nodes above it.
function upstreamEvents(s, nodeId) {
  const seen = new Set();
  const queue = [nodeId];
  const found = [];
  while (queue.length) {
    const id = queue.shift();
    for (const e of s.edges) {
      if (e.target !== id || seen.has(e.source)) continue;
      seen.add(e.source);
      const n = s.nodeLookup.get(e.source);
      if (n?.type === "event" && EVENTS[n.data?.event]) found.push(EVENTS[n.data.event]);
      queue.push(e.source);
    }
  }
  return found;
}

// Variables available to a node: everything the events upstream of it provide.
export function useVars(nodeId) {
  return useStore(
    (s) => {
      const vars = [];
      for (const ev of upstreamEvents(s, nodeId)) for (const v of ev.outputs) if (!vars.some((x) => x.id === v.id)) vars.push(v);
      return vars;
    },
    (a, b) => a.length === b.length && a.every((v, i) => v.id === b[i].id)
  );
}

// The nearest event above a node, or null.
export function useUpstreamEvent(nodeId) {
  return useStore(
    (s) => upstreamEvents(s, nodeId)[0] ?? null,
    (a, b) => a?.id === b?.id
  );
}
