// Blocks the sidebar offers. `kind` matches the filter dropdown.
export const BLOCKS = [
  { type: "event", kind: "Events", label: "Event", desc: "Runs when something happens on the server" },
  { type: "broadcast", kind: "Actions", label: "Broadcast", desc: "Sends a message to everyone online" },
];

export const DRAG_TYPE = "application/valida-block";
export const ADD_EVENT = "valida:add-block";
