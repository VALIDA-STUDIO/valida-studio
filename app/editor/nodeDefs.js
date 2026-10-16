// Placeholder node catalogue for the test editor. Nothing here runs yet.
export const NODE_DEFS = {
  player_join: { kind: "event", title: "Player joins", outputs: ["then"] },
  block_break: { kind: "event", title: "Block broken", outputs: ["then"] },
  command: { kind: "event", title: "Command used", fields: [{ key: "name", label: "Command", placeholder: "/hello" }], outputs: ["then"] },
  send_message: { kind: "action", title: "Send message", fields: [{ key: "message", label: "Message", placeholder: "Welcome, %player%!" }], outputs: ["then"] },
  give_item: {
    kind: "action",
    title: "Give item",
    fields: [
      { key: "item", label: "Item", placeholder: "diamond" },
      { key: "amount", label: "Amount", placeholder: "1" },
    ],
    outputs: ["then"],
  },
  wait: { kind: "action", title: "Wait", fields: [{ key: "seconds", label: "Seconds", placeholder: "2" }], outputs: ["then"] },
  has_permission: {
    kind: "condition",
    title: "Has permission",
    fields: [{ key: "permission", label: "Permission", placeholder: "myplugin.vip" }],
    outputs: ["yes", "no"],
  },
};

export const PALETTE = [
  { kind: "event", types: ["player_join", "block_break", "command"] },
  { kind: "action", types: ["send_message", "give_item", "wait"] },
  { kind: "condition", types: ["has_permission"] },
];
