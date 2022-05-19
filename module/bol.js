/* -------------------------------------------- */
// Import Modules
import { BoLActor } from "./actor/actor.js"
import { BoLActorSheet } from "./actor/actor-sheet.js"
import { BoLItem } from "./item/item.js"
import { BoLItemSheet } from "./item/item-sheet.js"
import { System, BOL } from "./system/config.js"
import { preloadHandlebarsTemplates } from "./system/templates.js"
import { registerHandlebarsHelpers } from "./system/helpers.js"
import registerHooks from "./system/hooks.js"
import { Macros } from "./system/macros.js"
import { BoLUtility } from "./system/bol-utility.js"
import { BoLCombatManager } from "./system/bol-combat.js"
import { BoLTokenHud } from "./system/bol-action-hud.js"
import { BoLHotbar } from "./system/bol-hotbar.js"
import { BoLAdventureGenerator } from "./system/bol-adventure-generator.js"

/* -------------------------------------------- */
Hooks.once('init', async function () {

  game.bol = {
    BoLActor,
    BoLItem,
    BoLHotbar,
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
  BoLUtility.init()
  BoLTokenHud.init()
  BoLHotbar.init()

  // Preload Handlebars Templates
  await preloadHandlebarsTemplates();

  // Register Handlebars helpers
  registerHandlebarsHelpers();

  // Register hooks
  registerHooks()

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
    let regURL = `https://www.uberwald.me/fvtt_appcount/count.php?name="${registerKey}"&worldKey="${worldKey}"&version="${game.release.generation}.${game.release.build}"&system="${game.system.id}"&systemversion="${game.system.data.version}"`
    $.ajax(regURL)
  }
}

/* -------------------------------------------- */
function welcomeMessage() {
  ChatMessage.create({
    user: game.user.id,
    whisper: [game.user.id],
    content: `<div id="welcome-message-pegasus"><span class="rdd-roll-part">
    <strong>` + game.i18n.localize("BOL.chat.welcome1") + `</strong><p>` +
    game.i18n.localize("BOL.chat.welcome2") + "<p>" +
    game.i18n.localize("BOL.chat.welcome3") + "<p>" +
    game.i18n.localize("BOL.chat.welcome4") + "</p>" +
    game.i18n.localize("BOL.chat.welcome5") + "</p>"  
  } )
}

/* -------------------------------------------- */
Hooks.once('ready', async function () {
  registerUsageCount('bol')

  welcomeMessage()

  BoLAdventureGenerator.init()
});


