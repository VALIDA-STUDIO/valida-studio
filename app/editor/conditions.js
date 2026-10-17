// Conditions: each has fields and yes / no outputs. `paper` hints at the check behind it.
export const CONDITIONS = {
  compare: {
    label: "Compare",
    desc: "Text or value is, is not, contains",
    fields: [
      { key: "left", label: "Value", placeholder: "{player.name}", vars: true },
      { key: "op", label: "", select: ["is", "is not", "contains", "starts with", "ends with"] },
      { key: "right", label: "", placeholder: "Steve", vars: true },
    ],
    paper: "String.equals / contains",
  },
  number: {
    label: "Number",
    desc: "Greater, smaller or equal",
    fields: [
      { key: "left", label: "Value", placeholder: "{player.health}", vars: true },
      { key: "op", label: "", select: [">", "<", ">=", "<=", "="] },
      { key: "right", label: "", placeholder: "10", number: true },
    ],
    paper: "numeric comparison",
  },
  has_permission: {
    label: "Has permission",
    desc: "Player has a permission node",
    fields: [
      { key: "player", label: "Player", placeholder: "{player}", vars: true },
      { key: "permission", label: "Permission", placeholder: "lobby.vip" },
    ],
    paper: "player.hasPermission(node)",
  },
  is_op: {
    label: "Is operator",
    desc: "Player is a server operator",
    fields: [{ key: "player", label: "Player", placeholder: "{player}", vars: true }],
    paper: "player.isOp()",
  },
};
