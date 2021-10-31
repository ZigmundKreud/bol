// Import Modules
import {BoLActor} from "./actor/actor.js";
import {BoLActorSheet} from "./actor/actor-sheet.js";
import {BoLItem} from "./item/item.js";
import {BoLItemSheet} from "./item/item-sheet.js";
import {System, BOL} from "./system/config.js";
import {preloadHandlebarsTemplates} from "./system/templates.js";
import {registerHandlebarsHelpers} from "./system/helpers.js";
import {registerSystemSettings} from "./system/settings.js";
import registerHooks from "./system/hooks.js";
import {DataLoader} from "./system/data.js";

Hooks.once('init', async function () {

    game.bol = {
        BoLActor,
        BoLItem
    };

    /**
     * Set an initiative formula for the system
     * @type {String}
     */
    CONFIG.Combat.initiative = {
        formula: "2d6+@attributes.mind.value+@aptitudes.init.value",
        decimals: 0
    };

    // Define custom Entity classes
    CONFIG.Actor.documentClass = BoLActor;
    CONFIG.Item.documentClass = BoLItem;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("bol", BoLActorSheet, {makeDefault: true});
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("bol", BoLItemSheet, {makeDefault: true});

    // Register System Settings
    registerSystemSettings();

    // Preload Handlebars Templates
    await preloadHandlebarsTemplates();

    // Register Handlebars helpers
    registerHandlebarsHelpers();

    // Register hooks
    registerHooks();

    // // If you need to add Handlebars helpers, here are a few useful examples:
    // Handlebars.registerHelper('concat', function() {
    //   var outStr = '';
    //   for (var arg in arguments) {
    //     if (typeof arguments[arg] != 'object') {
    //       outStr += arguments[arg];
    //     }
    //   }
    //   return outStr;
    // });
    //
    // Handlebars.registerHelper('toLowerCase', function(str) {
    //   return str.toLowerCase();
    // });
});


/**
 * Ready hook loads tables, and override's foundry's entity link functions to provide extension to pseudo entities
 */

Hooks.once("ready", async () => {

    console.debug("Importing data");

    // DataLoader.loadData("boons");
    // DataLoader.loadData("flaws");
    // DataLoader.loadData("careers");
    // DataLoader.loadData("origins");
    // DataLoader.loadData("races");
    // DataLoader.loadData("equipment");

    // UpdateUtils.updatePacks();
    // UpdateUtils.updatePaths();
    // UpdateUtils.updateProfiles();
    // UpdateUtils.updateSpecies();
    // UpdateUtils.updateEncounters();

    console.info("BOL | System Initialized.");
});
