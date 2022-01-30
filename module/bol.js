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

/* -------------------------------------------- */
// Register world usage statistics
function registerUsageCount( registerKey ) {
  if ( game.user.isGM ) {
    game.settings.register(registerKey, "world-key", {
      name: "Unique world key",
      scope: "world",
      config: false,
      type: String
    });

    let worldKey = game.settings.get(registerKey, "world-key")
    if ( worldKey == undefined || worldKey == "" ) {
      worldKey = randomID(32)
      game.settings.set(registerKey, "world-key", worldKey )
    }
    // Simple API counter
    $.ajax(`https://jdr.lahiette.com/fvtt_appcount/count.php?name="${registerKey}"&worldKey="${worldKey}"&version="${game.release.generation}.${game.release.build}"&system="${game.system.id}"&systemversion="${game.system.data.version}"`)
    /* -------------------------------------------- */
  }
}

/* -------------------------------------------- */
Hooks.once('ready', async function () {
  registerUsageCount('bol')
});


