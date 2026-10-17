"use client";

import { useStore } from "@xyflow/react";
import { EVENTS } from "./events";

// Variables available to a node: everything the events upstream of it provide.
export function useVars(nodeId) {
  return useStore((s) => {
    const seen = new Set();
    const queue = [nodeId];
    const vars = [];
    while (queue.length) {
      const id = queue.shift();
      for (const e of s.edges) {
        if (e.target !== id || seen.has(e.source)) continue;
        seen.add(e.source);
        const n = s.nodeLookup.get(e.source);
        if (n?.type === "event") for (const v of EVENTS[n.data?.event]?.outputs ?? []) if (!vars.some((x) => x.id === v.id)) vars.push(v);
        queue.push(e.source);
      }
    }
    return vars;
  }, (a, b) => a.length === b.length && a.every((v, i) => v.id === b[i].id));
}
