/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {

    // Define template paths to load
    const templatePaths = [
        // ACTORS
        "systems/bol/templates/actor/parts/actor-header.hbs",
        "systems/bol/templates/actor/parts/tabs/actor-stats.hbs",
        "systems/bol/templates/actor/parts/tabs/actor-combat.hbs",
        "systems/bol/templates/actor/parts/tabs/actor-actions.hbs",
        "systems/bol/templates/actor/parts/tabs/actor-features.hbs",
        "systems/bol/templates/actor/parts/tabs/actor-equipment.hbs",
        "systems/bol/templates/actor/parts/tabs/actor-spellalchemy.hbs",
        "systems/bol/templates/actor/parts/tabs/actor-biodata.hbs",
        "systems/bol/templates/actor/parts/tabs/creature-stats.hbs",
        "systems/bol/templates/actor/parts/tabs/creature-actions.hbs",
        // ITEMS
        "systems/bol/templates/item/parts/item-header.hbs",
        "systems/bol/templates/item/parts/properties/feature-properties.hbs",
        "systems/bol/templates/item/parts/properties/item-properties.hbs",
        "systems/bol/templates/item/parts/properties/item/equipment-properties.hbs",
        "systems/bol/templates/item/parts/properties/item/capacity-properties.hbs",
        "systems/bol/templates/item/parts/properties/item/vehicle-properties.hbs",
        "systems/bol/templates/item/parts/properties/item/protection-properties.hbs",
        "systems/bol/templates/item/parts/properties/item/weapon-properties.hbs",
        "systems/bol/templates/item/parts/properties/item/spell-properties.hbs",
        "systems/bol/templates/item/parts/properties/item/alchemy-properties.hbs",
        "systems/bol/templates/item/parts/properties/item/magical-properties.hbs",
        "systems/bol/templates/item/parts/properties/feature/career-properties.hbs",
        "systems/bol/templates/item/parts/properties/feature/boon-properties.hbs",
        "systems/bol/templates/item/parts/properties/feature/flaw-properties.hbs",
        "systems/bol/templates/item/parts/properties/feature/origin-properties.hbs",
        "systems/bol/templates/item/parts/properties/feature/race-properties.hbs",
        "systems/bol/templates/item/parts/properties/feature/fightoption-properties.hbs",

        // DIALOGS
        "systems/bol/templates/chat/rolls/attack-damage-card.hbs",
        "systems/bol/templates/chat/rolls/spell-roll-card.hbs",
        "systems/bol/templates/chat/rolls/alchemy-roll-card.hbs",
        "systems/bol/templates/dialogs/aptitude-roll-part.hbs",
        "systems/bol/templates/dialogs/attribute-roll-part.hbs",
        "systems/bol/templates/dialogs/mod-roll-part.hbs",
        "systems/bol/templates/dialogs/adv-roll-part.hbs",
        "systems/bol/templates/dialogs/career-roll-part.hbs",
        "systems/bol/templates/dialogs/boons-roll-part.hbs",
        "systems/bol/templates/dialogs/flaws-roll-part.hbs",
        "systems/bol/templates/dialogs/total-roll-part.hbs",   
        "systems/bol/templates/dialogs/fightoptions-roll-part.hbs",
    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};
