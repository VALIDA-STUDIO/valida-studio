// Actions: fields on the node, one "then" output. `paper` hints at the call behind it.
export const ACTIONS = {
  set_variable: {
    label: "Change variable",
    desc: "Sets, adds to or resets a project variable",
    icon: "variable",
    fields: [
      { key: "name", label: "Variable", variable: true },
      { key: "op", label: "Do", select: ["set", "add", "subtract", "reset"] },
      { key: "value", label: "Value", placeholder: "1", vars: true, when: { op: ["set", "add", "subtract"] } },
    ],
    paper: "VariableStore.set / add / reset",
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
