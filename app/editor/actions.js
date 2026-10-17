// Actions: fields on the node, one "then" output. `paper` hints at the call behind it.
export const ACTIONS = {
  set_variable: {
    label: "Set variable",
    desc: "Stores a value under a name, per player or for everyone",
    icon: "variable",
    fields: [
      { key: "name", label: "Name", placeholder: "kills", code: true },
      { key: "scope", label: "Scope", select: ["per player", "global"] },
      { key: "value", label: "Value", placeholder: "0", vars: true },
      { key: "persist", label: "Keep after restart", toggle: true },
    ],
    // the variable this block makes available to the blocks after it
    provides: (v) => (v.name ? [{ id: `var.${v.name}`, label: v.name, type: "String" }] : []),
    paper: "PersistentDataContainer / plugin storage",
  },
  random_number: {
    label: "Random number",
    desc: "Picks a number between two values",
    icon: "dice",
    fields: [
      { key: "name", label: "Name", placeholder: "roll", code: true },
      { key: "min", label: "Min", placeholder: "1", number: true },
      { key: "max", label: "Max", placeholder: "6", number: true },
    ],
    provides: (v) => [{ id: `var.${v.name || "random"}`, label: v.name || "random", type: "Number" }],
    paper: "ThreadLocalRandom.current().nextInt(min, max + 1)",
  },
  broadcast: {
    label: "Broadcast",
    desc: "Sends a message to everyone online",
    icon: "megaphone",
    fields: [{ key: "message", label: "Message", area: true, placeholder: "Welcome, {player}!", vars: true }],
    paper: "Bukkit.broadcast(message)",
  },
  send_message: {
    label: "Send message",
    desc: "Sends a message to one player",
    icon: "message",
    fields: [
      { key: "target", label: "To", placeholder: "{player}", vars: true },
      { key: "message", label: "Message", area: true, placeholder: "Hi {player.name}!", vars: true },
    ],
    paper: "target.sendMessage(message)",
  },
};
