// Import Modules
import { BoLActor } from "./actor/actor.js";
import { BoLActorSheet } from "./actor/actor-sheet.js";
import { BoLItem } from "./item/item.js";
import { BoLItemSheet } from "./item/item-sheet.js";
import { System, BOL } from "./system/config.js";
import { preloadHandlebarsTemplates } from "./system/templates.js";
import { registerHandlebarsHelpers } from "./system/helpers.js";
import { registerSystemSettings } from "./system/settings.js";
import registerHooks from "./system/hooks.js";
import { Macros } from "./system/macros.js";
import { BoLUtility } from "./system/bol-utility.js";
import { BoLCombatManager } from "./system/bol-combat.js";

Hooks.once('init', async function () {

  game.bol = {
    BoLActor,
    BoLItem,
    macros: Macros,
    config: BOL
  };
  
  // Game socket 
  game.socket.on("system.bol", sockmsg => {
    BoLUtility.onSocketMessage(sockmsg);
  });


  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "2d6+@attributes.mind.value+@aptitudes.init.value",
    decimals: 3
  };
  
  // Define custom Entity classes
  CONFIG.Actor.documentClass = BoLActor;
  CONFIG.Item.documentClass = BoLItem;
  CONFIG.Combat.documentClass = BoLCombatManager;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("bol", BoLActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("bol", BoLItemSheet, { makeDefault: true });

  // Inot useful stuff
  BoLUtility.init();
  
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