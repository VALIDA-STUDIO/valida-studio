"use client";

import { useStore } from "@xyflow/react";
import { EVENTS } from "./events";
import { ACTIONS } from "./actions";
import { LOOPS } from "./LoopNode";

// Walks the edges backwards from a node and collects what the blocks above it provide:
// event variables, variables set by actions, and the loop item when coming out of "each".
function collect(s, nodeId) {
  const seen = new Set();
  const queue = [nodeId];
  const vars = [];
  const events = [];
  const push = (v) => !vars.some((x) => x.id === v.id) && vars.push(v);
  while (queue.length) {
    const id = queue.shift();
    for (const e of s.edges) {
      if (e.target !== id) continue;
      const n = s.nodeLookup.get(e.source);
      if (!n) continue;
      if (n.type === "loop" && e.sourceHandle === "each") {
        const loop = LOOPS[n.data?.over] ?? LOOPS.online_players;
        push(loop.each);
      }
      if (seen.has(e.source)) continue;
      seen.add(e.source);
      if (n.type === "event" && EVENTS[n.data?.event]) {
        events.push(EVENTS[n.data.event]);
        for (const v of EVENTS[n.data.event].outputs) push(v);
      }
      if (n.type === "action") for (const v of ACTIONS[n.data?.action]?.provides?.(n.data?.values ?? {}) ?? []) push(v);
      queue.push(e.source);
    }
  }
  return { vars, events };
}

const sameVars = (a, b) => a.length === b.length && a.every((v, i) => v.id === b[i].id && v.type === b[i].type);

// Variables available to a node.
export function useVars(nodeId) {
  return useStore((s) => collect(s, nodeId).vars, sameVars);
}

// The nearest event above a node, or null.
export function useUpstreamEvent(nodeId) {
  return useStore(
    (s) => collect(s, nodeId).events[0] ?? null,
    (a, b) => a?.id === b?.id
  );
}
