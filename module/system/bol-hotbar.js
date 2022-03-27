import { BoLRoll } from "../controllers/bol-rolls.js";

export class BoLHotbar {

  /**
   * Create a macro when dropping an entity on the hotbar
   * Item      - open roll dialog for item
   * Actor     - open actor sheet
   * Journal   - open journal sheet
   */
  static init( ) {

    Hooks.on("hotbarDrop", async (bar, documentData, slot) => {
    // Create item macro if rollable item - weapon, spell, prayer, trait, or skill
    if (documentData.type == "Item") {
      console.log("Drop done !!!", bar, documentData, slot)
      let item = documentData.data
      let command = `game.bol.BoLHotbar.rollMacro("${item.name}", "${item.type}");`
      let macro = game.macros.contents.find(m => (m.name === item.name) && (m.command === command))
      if (!macro) {
        macro = await Macro.create({
          name: item.name,
          type: "script",
          img: item.img,
          command: command
        }, { displaySheet: false })
      }
      game.user.assignHotbarMacro(macro, slot);
    }
    // Create a macro to open the actor sheet of the actor dropped on the hotbar
    else if (documentData.type == "Actor") {
      let actor = game.actors.get(documentData.id);
      let command = `game.actors.get("${documentData.id}").sheet.render(true)`
      let macro = game.macros.contents.find(m => (m.name === actor.name) && (m.command === command));
      if (!macro) {
        macro = await Macro.create({
          name: actor.data.name,
          type: "script",
          img: actor.data.img,
          command: command
        }, { displaySheet: false })
        game.user.assignHotbarMacro(macro, slot);
      }
    }
    // Create a macro to open the journal sheet of the journal dropped on the hotbar
    else if (documentData.type == "JournalEntry") {
      let journal = game.journal.get(documentData.id);
      let command = `game.journal.get("${documentData.id}").sheet.render(true)`
      let macro = game.macros.contents.find(m => (m.name === journal.name) && (m.command === command));
      if (!macro) {
        macro = await Macro.create({
          name: journal.data.name,
          type: "script",
          img: "systems/bol/icons/images/icone_parchement_vierge.webp",
          command: command
        }, { displaySheet: false })
        game.user.assignHotbarMacro(macro, slot);
      }
    }
    return false;
  });
  }

  /** Roll macro */
  static rollMacro(itemName, itemType, bypassData) {
    const speaker = ChatMessage.getSpeaker()
    let actor
    if (speaker.token) actor = game.actors.tokens[speaker.token]
    if (!actor) actor = game.actors.get(speaker.actor)
    if (!actor) {
      return ui.notifications.warn(`Selectionnez votre personnage pour utiliser la macro`)
    }

    let item = actor.items.find(it => it.name === itemName && it.type == itemType)
    if (!item ) {
      return ui.notifications.warn(`Impossible de trouver l'objet de cette macro`)
    }
    // Trigger the item roll
    if  (item.data.data.category === "equipment" && item.data.data.subtype === "weapon") {
      return BoLRoll.weaponCheckWithWeapon( actor, item)
    }
    if  (item.data.data.category === "spell") {
      return BoLRoll.spellCheckWithSpell( actor, item)
    }
  }

}
