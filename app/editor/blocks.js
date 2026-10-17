import { CONDITIONS } from "./conditions";
import { ACTIONS } from "./actions";

// Blocks the sidebar offers. `kind` matches the filter dropdown; `node` is what gets added.
export const BLOCKS = [
  { id: "group", kind: "Groups", label: "Group", desc: "A named area, drop blocks into it to move them together", node: { type: "group", data: { name: "" }, width: 380, height: 240 } },
  { id: "event", kind: "Events", label: "Event", desc: "Runs when something happens on the server", node: { type: "event", data: { event: "player_join" } } },
  ...Object.entries(CONDITIONS).map(([cond, c]) => ({ id: `cond_${cond}`, kind: "Conditions", label: c.label, desc: c.desc, node: { type: "condition", data: { cond, values: {} } } })),
  { id: "modify", kind: "Actions", label: "Modify event", desc: "Changes the event: messages, cancel", icon: "wrench", node: { type: "modify", data: { values: {} } } },
  ...Object.entries(ACTIONS).map(([action, a]) => ({ id: `act_${action}`, kind: "Actions", label: a.label, desc: a.desc, icon: a.icon, node: { type: "action", data: { action, values: {} } } })),
];

export const DRAG_TYPE = "application/valida-block";
export const ADD_EVENT = "valida:add-block";
