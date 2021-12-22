export const System = {};

System.label = "Barbarians of Lemuria";
System.name = "bol";
System.rootPath = "/systems/" + System.name;
System.dataPath = System.rootPath + "/data";
System.templatesPath = System.rootPath + "/templates";
System.debugMode = true;

export const BOL = {};


BOL.itemCategories = {
    "equipment" : "BOL.itemCategory.equipment",
    "consumable" : "BOL.itemCategory.consumable",
    "spell" : "BOL.itemCategory.spell",
    "mount" : "BOL.itemCategory.mount",
    "vehicle" : "BOL.itemCategory.vehicle",
    "other" : "BOL.itemCategory.other"
}

BOL.equipmentCategories = {
    "weapon" : "BOL.equipmentCategory.weapon",
    "protection" : "BOL.equipmentCategory.protection",
    "jewel" : "BOL.equipmentCategory.jewel",
    "scroll" : "BOL.equipmentCategory.scroll",
    "ammunition" : "BOL.equipmentCategory.ammunition",
    "container" : "BOL.equipmentCategory.container",
    "currency" : "BOL.equipmentCategory.currency",
    "other" : "BOL.equipmentCategory.other"
}

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

BOL.itemProperties = {
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