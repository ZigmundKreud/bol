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
        "systems/bol/templates/actor/parts/tabs/actor-features.hbs",
        "systems/bol/templates/actor/parts/tabs/actor-equipment.hbs",
        // ITEMS
        "systems/bol/templates/item/parts/item-header.hbs",
        "systems/bol/templates/item/parts/properties/feature-properties.hbs",
        "systems/bol/templates/item/parts/properties/equipment-properties.hbs",
        "systems/bol/templates/item/parts/properties/protection-properties.hbs",
        "systems/bol/templates/item/parts/properties/shield-properties.hbs",
        "systems/bol/templates/item/parts/properties/weapon-properties.hbs",
        "systems/bol/templates/item/parts/properties/armor-properties.hbs",
        "systems/bol/templates/item/parts/properties/melee-properties.hbs",
        "systems/bol/templates/item/parts/properties/ranged-properties.hbs",
        "systems/bol/templates/item/parts/properties/item-properties.hbs",
        // DIALOGS
        "systems/bol/templates/roll/parts/roll-dialog-modifiers.hbs",
        "systems/bol/templates/roll/parts/roll-dialog-attribute.hbs"
    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};
