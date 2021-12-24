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
        // ITEMS
        "systems/bol/templates/item/parts/item-header.hbs",
        "systems/bol/templates/item/parts/properties/feature-properties.hbs",
        "systems/bol/templates/item/parts/properties/item-properties.hbs",
        "systems/bol/templates/item/parts/properties/item/equipment-properties.hbs",
        "systems/bol/templates/item/parts/properties/item/vehicle-properties.hbs",
        "systems/bol/templates/item/parts/properties/item/protection-properties.hbs",
        "systems/bol/templates/item/parts/properties/item/weapon-properties.hbs",
        "systems/bol/templates/item/parts/properties/item/magical-properties.hbs",
        "systems/bol/templates/item/parts/properties/feature/career-properties.hbs",
        "systems/bol/templates/item/parts/properties/feature/boon-properties.hbs",
        "systems/bol/templates/item/parts/properties/feature/flaw-properties.hbs",
        "systems/bol/templates/item/parts/properties/feature/origin-properties.hbs",
        "systems/bol/templates/item/parts/properties/feature/race-properties.hbs",
        // DIALOGS
        "systems/bol/templates/roll/parts/roll-dialog-modifiers.hbs",
        "systems/bol/templates/roll/parts/roll-dialog-attribute.hbs"
    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};
