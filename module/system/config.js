export const System = {};

System.label = "Barbarians of Lemuria";
System.name = "bol";
System.rootPath = "/systems/" + System.name;
System.dataPath = System.rootPath + "/data";
System.templatesPath = System.rootPath + "/templates";
System.debugMode = true;

export const BOL = {};

BOL.itemProperties = {
    "equipable": "BOL.properties.equipable",
    "stackable": "BOL.properties.stackable",
    "unique": "BOL.properties.unique",
    "tailored": "BOL.properties.tailored",
    "2h": "BOL.properties.2H",
    "predilection": "BOL.properties.predilection",
    "ranged": "BOL.properties.ranged",
    "proficient": "BOL.properties.proficient",
    "finesse": "BOL.properties.finesse",
    "two-handed": "BOL.properties.two-handed",
    "equipment": "BOL.properties.equipment",
    "weapon": "BOL.properties.weapon",
    "protection": "BOL.properties.protection",
    "reloadable": "BOL.properties.reloadable",
    "bow": "BOL.properties.bow",
    "crossbow": "BOL.properties.crossbow",
    "powder": "BOL.properties.powder",
    "throwing": "BOL.properties.throwing",
    "dr": "BOL.properties.dr",
    "sneak": "BOL.properties.sneak",
    "powerful": "BOL.properties.powerful",
    "critscience": "BOL.properties.critscience",
    "specialization": "BOL.properties.specialization",
    "effects": "BOL.properties.effects",
    "activable": "BOL.properties.activable",
    "2H": "BOL.properties.2H",
    "13strmin": "BOL.properties.13strmin",
    "bashing": "BOL.properties.bashing",
    "sling": "BOL.properties.sling",
    "spell": "BOL.properties.spell",
    "profile": "BOL.properties.profile",
    "prestige": "BOL.properties.prestige",
    "alternative": "BOL.properties.alternative",
    "consumable": "BOL.properties.consumable",
    "racial": "BOL.properties.racial",
    "creature" : "BOL.properties.creature"
};

BOL.itemCategories = {
    "other": "BOL.category.other",
    "armor": "BOL.category.armor",
    "shield": "BOL.category.shield",
    "melee": "BOL.category.melee",
    "ranged": "BOL.category.ranged",
    "spell": "BOL.category.spell",
    "jewel": "BOL.category.jewel",
    "scroll": "BOL.category.scroll",
    "wand": "BOL.category.wand",
    "ammunition": "BOL.category.ammunition",
    "consumable": "BOL.category.consumable",
    "container": "BOL.category.container",
    "mount": "BOL.category.mount",
    "currency": "BOL.category.currency",
    "trapping": "BOL.category.trapping"
}

BOL.itemIcons = {
    "item": "icons/containers/chest/chest-worn-oak-tan.webp",
    "capacity":"icons/sundries/scrolls/scroll-plain-tan-red.webp",
    "species": "icons/environment/people/group.webp",
    "profile": "icons/sundries/documents/blueprint-axe.webp",
    "path": "icons/sundries/books/book-embossed-gold-red.webp"
}

BOL.actorIcons = {
    "npc": "icons/environment/people/commoner.webp",
    "encounter":"icons/svg/mystery-man-black.svg",
    "loot": "icons/containers/bags/sack-simple-leather-brown.webp"
}

BOL.debug = false;