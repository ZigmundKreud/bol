export const System = {};

System.label = "Barbarians of Lemuria";
System.name = "bol";
System.rootPath = "/systems/" + System.name;
System.dataPath = System.rootPath + "/data";
System.templatesPath = System.rootPath + "/templates";
System.debugMode = true;

export const BOL = {};

BOL.damageValues = {
    "d3" : "d3",
    "d6M" : "d6M (Malus)",
    "d6" : "d6",
    "d6B" : "d6B (Bonus)",
    "d6BB" : "d6B + dé bonus",
}

BOL.equipmentSlots = {
    "none" : "BOL.equipmentSlots.none",
    "head" : "BOL.equipmentSlots.head",
    "neck" : "BOL.equipmentSlots.neck",
    "shoulders" : "BOL.equipmentSlots.shoulders",
    "body" : "BOL.equipmentSlots.body",
    "rhand" : "BOL.equipmentSlots.rhand",
    "lhand" : "BOL.equipmentSlots.lhand",
    "2hands" : "BOL.equipmentSlots.2hands",
    "rarm" : "BOL.equipmentSlots.rarm",
    "larm" : "BOL.equipmentSlots.larm",
    "chest" : "BOL.equipmentSlots.chest",
    "belt" : "BOL.equipmentSlots.belt",
    "legs" : "BOL.equipmentSlots.legs",
    "feet" : "BOL.equipmentSlots.feet",
    "finder" : "BOL.equipmentSlots.finder",
    "ear" : "BOL.equipmentSlots.ear"
}

BOL.armorQualities = {
    "none" : "BOL.armorQuality.none",
    "light" : "BOL.armorQuality.light",
    "lightQ" : "BOL.armorQuality.lightQ",
    "lightSup" : "BOL.armorQuality.lightSup",
    "lightLeg" : "BOL.armorQuality.lightLeg",
    "medium" : "BOL.armorQuality.medium",
    "mediumQ" : "BOL.armorQuality.mediumQ",
    "mediumSup" : "BOL.armorQuality.mediumSup",
    "mediumLeg" : "BOL.armorQuality.mediumLeg",
    "heavy" : "BOL.armorQuality.heavy",
    "heavyQ" : "BOL.armorQuality.heavyQ",
    "heavySup" : "BOL.armorQuality.heavySup",
    "heavyLeg" : "BOL.armorQuality.heavyLeg"
}

BOL.soakFormulas = {
    "none" : "0",
    "light" : "1d6-3",
    "lightQ" : "1d6r1-3",
    "lightSup" : "1d6-2",
    "lightLeg" : "2d6kh1-2",
    "medium" : "1d6-2",
    "mediumQ" : "1d6r1-2",
    "mediumSup" : "1d6-1",
    "mediumLeg" : "2d6kh1-1",
    "heavy" : "1d6-1",
    "heavyQ" : "1d6r1-1",
    "heavySup" : "1d6",
    "heavyLeg" : "2d6kh1"
}

BOL.attackAttributes = {
    "vigor" : "BOL.attributes.vigor",
    "agility" : "BOL.attributes.agility",
    "mind" : "BOL.attributes.mind",
    "appeal" : "BOL.attributes.appeal"
}

BOL.attackAptitudes = {
    "melee" : "BOL.aptitudes.melee",
    "ranged" : "BOL.aptitudes.ranged"
}

BOL.aptitudes = {
    "melee" : "BOL.aptitudes.melee",
    "ranged" : "BOL.aptitudes.ranged",
    "init" : "BOL.aptitudes.init",
    "def" : "BOL.aptitudes.def"
}

BOL.weaponSizes = {
    "unarmed" : "BOL.weaponSize.unarmed",
    "improvised" : "BOL.weaponSize.improvised",
    "light" : "BOL.weaponSize.light",
    "medium" : "BOL.weaponSize.medium",
    "heavy" : "BOL.weaponSize.heavy"
}

BOL.damageAttributes = {
    "zero" : "0",
    "vigor" : "BOL.attributes.vigor",
    "half-vigor" : "BOL.attributes.halfvigor"
}

BOL.itemCategories = {
    "equipment" : "BOL.itemCategory.equipment",
    "capacity" : "BOL.itemCategory.capacity",
    "spell" : "BOL.itemCategory.spell",
    "vehicle" : "BOL.itemCategory.vehicle",
    "other" : "BOL.itemCategory.other"
}

BOL.itemSubtypes = {
    "armor" : "BOL.equipmentCategory.armor",
    "weapon" : "BOL.equipmentCategory.weapon",
    "shield" : "BOL.equipmentCategory.shield",
    "helm" : "BOL.equipmentCategory.helm",
    "jewel" : "BOL.equipmentCategory.jewel",
    "scroll" : "BOL.equipmentCategory.scroll",
    "container" : "BOL.equipmentCategory.container",
    "ammunition" : "BOL.equipmentCategory.ammunition",
    "currency" : "BOL.equipmentCategory.currency",
    "other" : "BOL.equipmentCategory.other"
}

BOL.vehicleSubtypes = {
    "mount" : "BOL.vehicleCategory.mount",
    "flying" : "BOL.vehicleCategory.flying",
    "boat" : "BOL.vehicleCategory.boat",
    "other" : "BOL.vehicleCategory.other"
}

// BOL.equipmentCategories = {
//     "armor" : "BOL.equipmentCategory.armor",
//     "weapon" : "BOL.equipmentCategory.weapon",
//     "shield" : "BOL.equipmentCategory.shield",
//     "helm" : "BOL.equipmentCategory.helm",
//     "jewel" : "BOL.equipmentCategory.jewel",
//     "scroll" : "BOL.equipmentCategory.scroll",
//     "container" : "BOL.equipmentCategory.container",
//     "ammunition" : "BOL.equipmentCategory.ammunition",
//     "currency" : "BOL.equipmentCategory.currency",
//     "other" : "BOL.equipmentCategory.other"
// }

BOL.protectionCategories = {
    "armor" : "BOL.protectionCategory.armor",
    "shield" : "BOL.protectionCategory.shield",
    "helm" : "BOL.protectionCategory.helm",
    "other" : "BOL.protectionCategory.other"
}

BOL.weaponCategories = {
    "melee" : "BOL.weaponCategory.melee",
    "ranged" : "BOL.weaponCategory.ranged",
    "other" : "BOL.weaponCategory.other"
}

BOL.itemProperties1 = {
    "equipable" : "BOL.itemProperty.equipable",
    "protection" : "BOL.itemProperty.protection",
    "magical" : "BOL.itemProperty.magical",
    "worn" : "BOL.itemProperty.worn",
}

BOL.itemProperties2 = {
    "equipable" : "BOL.itemProperty.equipable",
    "protection" : "BOL.itemProperty.protection",
    "blocking" : "BOL.itemProperty.blocking",
    "magical" : "BOL.itemProperty.magical",
    "concealable" : "BOL.itemProperty.concealable",
    "2H" : "BOL.itemProperty.2H",
    "helm" : "BOL.itemProperty.helm",
    "improvised" : "BOL.itemProperty.improvised",
    "shield" : "BOL.itemProperty.shield",
    "melee" : "BOL.itemProperty.melee",
    "throwable" : "BOL.itemProperty.throwable",
    "ignoreshield" : "BOL.itemProperty.ignoreshield",
    "bashing" : "BOL.itemProperty.bashing",
    "stackable" : "BOL.itemProperty.stackable",
    "ranged" : "BOL.itemProperty.ranged",
    "weapon" : "BOL.itemProperty.weapon",
    "reloadable" : "BOL.itemProperty.reloadable",
    "worn" : "BOL.itemProperty.worn",
    "spell" : "BOL.itemProperty.spell",
    "armor" : "BOL.itemProperty.armor",
    "consumable" : "BOL.itemProperty.consumable",
    "bow" : "BOL.itemProperty.bow",
    "crossbow" : "BOL.itemProperty.crossbow",
    "throwing" : "BOL.itemProperty.throwing",
    "activable" : "BOL.itemProperty.activable",
    "powder" : "BOL.itemProperty.powder",
    "damage" : "BOL.itemProperty.damage"
    
}

BOL.itemStats = {
    "quantity" : "BOL.itemStat.quantity",
    "weight" : "BOL.itemStat.weight",
    "price" : "BOL.itemStat.price",
    "range" : "BOL.itemStat.range",
    "damage" : "BOL.itemStat.damage",
    "reload" : "BOL.itemStat.reload",
    "soak" : "BOL.itemStat.soak",
    "blocking" : "BOL.itemStat.blocking",
    "modifiers" : "BOL.itemStat.modifiers"
}

BOL.itemModifiers = {
    "init" : "BOL.itemModifiers.init",
    "social" : "BOL.itemModifiers.social",
    "agility" : "BOL.itemModifiers.agility",
    "powercost" : "BOL.itemModifiers.powercost"
}

BOL.itemBlocking = {
    "malus" : "BOL.itemBlocking.malus",
    "nbAttacksPerRound" : "BOL.itemBlocking.nbAttacksPerRound"
}

BOL.itemSoak = {
    "formula" : "BOL.itemSoak.formula",
    "value" : "BOL.itemSoak.value"
}

BOL.featureSubtypes = {
    "origin" : "BOL.featureSubtypes.origin",
    "race" : "BOL.featureSubtypes.race",
    "career" : "BOL.featureSubtypes.career",
    "boon" : "BOL.featureSubtypes.boon",
    "flaw" : "BOL.featureSubtypes.flaw"
}

BOL.itemIcons = {
    "item": "icons/containers/chest/chest-worn-oak-tan.webp",
    "capacity": "icons/sundries/scrolls/scroll-plain-tan-red.webp",
    "species": "icons/environment/people/group.webp",
    "profile": "icons/sundries/documents/blueprint-axe.webp",
    "path": "icons/sundries/books/book-embossed-gold-red.webp"
}

BOL.actorIcons = {
    "npc": "icons/environment/people/commoner.webp",
    "encounter": "icons/svg/mystery-man-black.svg",
    "loot": "icons/containers/bags/sack-simple-leather-brown.webp"
}

BOL.debug = false;