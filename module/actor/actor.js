import { BoLRollDialog } from "../system/roll-dialog.js";
import { BoLUtility } from "../system/bol-utility.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class BoLActor extends Actor {
  /** @override */
  prepareData() {
    super.prepareData();

    console.debug("prepareData");

    const actorData = this.data;
    // console.log(actorData);
    // const data = actorData.data;
    // const flags = actorData.flags;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    // if (actorData.type === 'character') this._prepareCharacterData(actorData);
  }

  // /**
  //  * Prepare Character type specific data
  //  */
  // _prepareCharacterData(actorData) {
  //   const data = actorData.data;
  //
  //   // Make modifications to data here. For example:
  ////   // Loop through ability scores, and add their modifiers to our sheet output.
  //   for (let [key, ability] of Object.entries(data.abilities)) {
  //     // Calculate the modifier using d20 rules.
  //     ability.mod = Math.floor((ability.value - 10) / 2);
  //   }
  // }
  /* -------------------------------------------- */
  getBoons() {
    return this.data.items.filter(i => i.type === "feature" && i.data.subtype === "boon");   
  }
  /* -------------------------------------------- */
  getFlaws() {
    return this.data.items.filter(i => i.type === "feature" && i.data.subtype === "flaw");    
  }
  /* -------------------------------------------- */
  getCareers() {
    return this.data.items.filter(i => i.type === "feature" && i.data.subtype === "career");    
  }
  /* -------------------------------------------- */
  saveRollData( rollData) {
    this.currentRollData = rollData;
  }

  async rollCareer( careerId ) {
    let career = BoLUtility.data(this.data.items.find( item => item.type == 'feature' && item.id == careerId));
    if (career) {
      let rollData = {
        mode : "career",
        actorId: this.id,
        actorImg: this.img,
        career :  career,
        rollAttribute: 'mind',
        attributes :  duplicate(this.data.data.attributes),
        boons :  this.getBoons(),
        flaws :  this.getFlaws(),
        d6Bonus: 0,
        d6Malus: 0,
        rollMode: game.settings.get("core", "rollMode"),
        title: `${career.name} : ${career.data.rank}`,
        optionsBonusMalus: BoLUtility.buildListOptions(-8, +2),
        bonusMalus: 0
      }
      let rollDialog = await BoLRollDialog.create( this, rollData);
      rollDialog.render( true );
    } else {
      ui.notifications.warn("Unable to find career for actor " + this.name + " - Career ID  " + careerId);
    }
  }
}