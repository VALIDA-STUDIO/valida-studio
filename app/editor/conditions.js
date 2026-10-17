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
  cooldown: {
    label: "Cooldown",
    desc: "Lets it through once, then waits",
    fields: [
      { key: "seconds", label: "Seconds", placeholder: "10", number: true },
      { key: "scope", label: "", select: ["per player", "global"] },
      { key: "player", label: "Player", placeholder: "{player}", vars: true, when: { scope: "per player" } },
    ],
    outputs: [
      { id: "yes", label: "ready" },
      { id: "no", label: "waiting" },
    ],
    paper: "timestamp map keyed by player uuid",
  },
  chance: {
    label: "Chance",
    desc: "Random, a percentage of the time",
    fields: [{ key: "percent", label: "Percent", placeholder: "25", number: true }],
    paper: "ThreadLocalRandom.current().nextDouble() * 100 < percent",
  },
  is_op: {
    label: "Is operator",
    desc: "Player is a server operator",
    fields: [{ key: "player", label: "Player", placeholder: "{player}", vars: true }],
    paper: "player.isOp()",
  },
};
