// Shared (client + server) model of a command, modelled on Paper's Brigadier command API
// (docs.papermc.io/paper/dev/command-api). Nothing here generates code; it only keeps the data valid.

// Argument types a command can take. `paper` is the API call the backend will use for it.
export const ARG_GROUPS = [
  {
    group: "Text & numbers",
    types: [
      { id: "word", label: "Word", hint: "one word", paper: "StringArgumentType.word()" },
      { id: "string", label: "Text", hint: "one word or \"quoted text\"", paper: "StringArgumentType.string()" },
      { id: "greedy", label: "Rest of line", hint: "everything after it, must be last", paper: "StringArgumentType.greedyString()", last: true },
      { id: "integer", label: "Whole number", hint: "e.g. 64", paper: "IntegerArgumentType.integer()", bounds: true },
      { id: "number", label: "Number", hint: "e.g. 2.5", paper: "DoubleArgumentType.doubleArg()", bounds: true },
      { id: "boolean", label: "True / false", paper: "BoolArgumentType.bool()" },
    ],
  },
  {
    group: "Players & entities",
    types: [
      { id: "player", label: "Player", hint: "one online player", paper: "ArgumentTypes.player()" },
      { id: "players", label: "Players", hint: "one or more, selectors allowed", paper: "ArgumentTypes.players()" },
      { id: "offline_player", label: "Offline player", hint: "by name, need not be online", paper: "ArgumentTypes.playerProfiles()" },
      { id: "entity", label: "Entity", hint: "one entity or selector", paper: "ArgumentTypes.entity()" },
      { id: "entities", label: "Entities", hint: "selector matching many", paper: "ArgumentTypes.entities()" },
    ],
  },
  {
    group: "World",
    types: [
      { id: "world", label: "World", paper: "ArgumentTypes.world()" },
      { id: "block_position", label: "Block position", hint: "x y z, ~ allowed", paper: "ArgumentTypes.blockPosition()" },
      { id: "position", label: "Position", hint: "exact x y z", paper: "ArgumentTypes.finePosition(false)" },
      { id: "rotation", label: "Rotation", hint: "yaw pitch", paper: "ArgumentTypes.rotation()" },
      { id: "block", label: "Block", hint: "e.g. stone", paper: "ArgumentTypes.blockState()" },
      { id: "item", label: "Item", hint: "e.g. diamond_sword", paper: "ArgumentTypes.itemStack()" },
      { id: "game_mode", label: "Game mode", paper: "ArgumentTypes.gameMode()" },
      { id: "time", label: "Time", hint: "e.g. 10s, 2d, 100t", paper: "ArgumentTypes.time()" },
      { id: "color", label: "Color", hint: "a named chat color", paper: "ArgumentTypes.namedColor()" },
      { id: "component", label: "Formatted text", hint: "JSON text component", paper: "ArgumentTypes.component()" },
      { id: "uuid", label: "UUID", paper: "ArgumentTypes.uuid()" },
      { id: "key", label: "Key", hint: "e.g. minecraft:stone", paper: "ArgumentTypes.namespacedKey()" },
    ],
  },
];

export const ARG_TYPES = Object.fromEntries(ARG_GROUPS.flatMap((g) => g.types.map((t) => [t.id, t])));

export const SENDERS = [
  { id: "any", label: "Anyone" },
  { id: "player", label: "Players" },
  { id: "console", label: "Console" },
];

export const LIMITS = { name: 32, description: 120, permission: 64, aliases: 5, args: 10, argName: 32 };

const NAME_RE = /^[a-z0-9_-]{1,32}$/;
const ARG_NAME_RE = /^[a-z][a-z0-9_]{0,31}$/;
const PERMISSION_RE = /^[a-z0-9_.-]{1,64}$/;

export const normalizeName = (name) => String(name ?? "").trim().replace(/^\/+/, "").toLowerCase();
const str = (v, max) => String(v ?? "").trim().slice(0, max);
const num = (v) => (v === "" || v === null || v === undefined ? null : Number.isFinite(Number(v)) ? Number(v) : NaN);

export function validateName(name) {
  const clean = normalizeName(name);
  if (!clean) return { error: "Name is required" };
  if (!NAME_RE.test(clean)) return { error: "Only letters, numbers, - and _, up to 32 characters" };
  return { clean };
}

// Returns { value, errors, ok }. `errors` holds one message per field; args errors are keyed by index.
export function validateCommand(input) {
  const errors = {};
  const argErrors = {};
  const name = validateName(input?.name);
  if (name.error) errors.name = name.error;

  const description = str(input?.description, LIMITS.description);
  const permission = str(input?.permission, LIMITS.permission).toLowerCase();
  if (permission && !PERMISSION_RE.test(permission)) errors.permission = "Lowercase letters, numbers, dots, - and _";

  const aliases = [];
  for (const raw of Array.isArray(input?.aliases) ? input.aliases : []) {
    const a = normalizeName(raw);
    if (!a) continue;
    if (!NAME_RE.test(a)) errors.aliases = `“${a}” is not a valid alias`;
    else if (a === name.clean) errors.aliases = "An alias can't equal the name";
    else if (!aliases.includes(a)) aliases.push(a);
  }
  if (aliases.length > LIMITS.aliases) errors.aliases = `Up to ${LIMITS.aliases} aliases`;

  const sender = SENDERS.some((s) => s.id === input?.sender) ? input.sender : "any";

  const args = [];
  const list = Array.isArray(input?.args) ? input.args.slice(0, LIMITS.args) : [];
  let optionalSeen = false;
  list.forEach((raw, i) => {
    const type = ARG_TYPES[raw?.type] ? raw.type : "word";
    const argName = str(raw?.name, LIMITS.argName).toLowerCase();
    const required = raw?.required !== false;
    const arg = { name: argName, type, required };
    if (!argName) argErrors[i] = "Name is required";
    else if (!ARG_NAME_RE.test(argName)) argErrors[i] = "Lowercase letters, numbers and _, starting with a letter";
    else if (args.some((a) => a.name === argName)) argErrors[i] = "Another argument has that name";
    if (ARG_TYPES[type].last && i !== list.length - 1) argErrors[i] ??= `${ARG_TYPES[type].label} must be the last argument`;
    if (!required) optionalSeen = true;
    else if (optionalSeen) argErrors[i] ??= "Required arguments must come before optional ones";
    if (ARG_TYPES[type].bounds) {
      const min = num(raw?.min);
      const max = num(raw?.max);
      if (Number.isNaN(min) || Number.isNaN(max)) argErrors[i] ??= "Min and max must be numbers";
      else {
        if (type === "integer" && ((min !== null && !Number.isInteger(min)) || (max !== null && !Number.isInteger(max)))) argErrors[i] ??= "Min and max must be whole numbers";
        if (min !== null && max !== null && min > max) argErrors[i] ??= "Min can't be above max";
        if (min !== null) arg.min = min;
        if (max !== null) arg.max = max;
      }
    }
    args.push(arg);
  });
  if (Object.keys(argErrors).length) errors.args = argErrors;

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: { name: name.clean ?? "", description, permission, aliases, sender, args },
  };
}

// "/teleport <player> [reason…]" — required in <>, optional in [], greedy text gets an ellipsis
export function usage(cmd) {
  const parts = (cmd?.args ?? []).map((a) => {
    const label = a.name || "?";
    const tail = ARG_TYPES[a.type]?.last ? "…" : "";
    return a.required === false ? `[${label}${tail}]` : `<${label}${tail}>`;
  });
  return ["/" + normalizeName(cmd?.name), ...parts].join(" ");
}
