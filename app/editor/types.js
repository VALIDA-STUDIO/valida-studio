// What each variable type offers. `paper` is the call behind it, for the backend.
// A property with `type` can be followed further; `arg` asks for a number (slot(1)).
export const TYPES = {
  Player: {
    name: { paper: "getName()" },
    displayName: { paper: "displayName()" },
    uuid: { paper: "getUniqueId()" },
    health: { paper: "getHealth()" },
    food: { paper: "getFoodLevel()" },
    level: { paper: "getLevel()" },
    gameMode: { paper: "getGameMode()" },
    playedBefore: { paper: "hasPlayedBefore()" },
    firstPlayed: { paper: "getFirstPlayed()" },
    lastSeen: { paper: "getLastSeen()" },
    ping: { paper: "getPing()" },
    sneaking: { paper: "isSneaking()" },
    flying: { paper: "isFlying()" },
    world: { paper: "getWorld()", type: "World" },
    location: { paper: "getLocation()", type: "Location" },
    inventory: { paper: "getInventory()", type: "Inventory" },
    mainHand: { paper: "getInventory().getItemInMainHand()", type: "ItemStack" },
  },
  Location: {
    x: { paper: "getBlockX()" },
    y: { paper: "getBlockY()" },
    z: { paper: "getBlockZ()" },
    yaw: { paper: "getYaw()" },
    pitch: { paper: "getPitch()" },
    world: { paper: "getWorld()", type: "World" },
  },
  World: {
    name: { paper: "getName()" },
    time: { paper: "getTime()" },
    playerCount: { paper: "getPlayers().size()" },
  },
  Inventory: {
    slot: { paper: "getItem(n)", type: "ItemStack", arg: { label: "Slot", min: 0, max: 40, placeholder: "0" } },
    helmet: { paper: "getHelmet()", type: "ItemStack" },
    chestplate: { paper: "getChestplate()", type: "ItemStack" },
    leggings: { paper: "getLeggings()", type: "ItemStack" },
    boots: { paper: "getBoots()", type: "ItemStack" },
  },
  ItemStack: {
    type: { paper: "getType()" },
    amount: { paper: "getAmount()" },
    name: { paper: "getItemMeta().displayName()" },
  },
};
