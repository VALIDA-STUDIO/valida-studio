import { CONDITIONS } from "./conditions";

// Blocks the sidebar offers. `kind` matches the filter dropdown; `node` is what gets added.
export const BLOCKS = [
  { id: "event", kind: "Events", label: "Event", desc: "Runs when something happens on the server", node: { type: "event", data: { event: "player_join" } } },
  ...Object.entries(CONDITIONS).map(([cond, c]) => ({ id: `cond_${cond}`, kind: "Conditions", label: c.label, desc: c.desc, node: { type: "condition", data: { cond, values: {} } } })),
  { id: "broadcast", kind: "Actions", label: "Broadcast", desc: "Sends a message to everyone online", node: { type: "broadcast", data: { message: "" } } },
];

export const DRAG_TYPE = "application/valida-block";
export const ADD_EVENT = "valida:add-block";
