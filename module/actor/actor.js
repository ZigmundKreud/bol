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
    if (actorData.type === 'character') {
      this._prepareCharacterData(actorData);
    }
  }

  // /**
  //  * Prepare Character type specific data
  //  */
  /* -------------------------------------------- */
  _prepareCharacterData(actorData) {
    let newVitality = 10 + this.data.data.attributes.vigor.value; 
    if ( newVitality != this.data.data.resources.hp.max) {
      this.data.data.resources.hp.max = newVitality;
      this.update( { 'data.resources.hp.max': newVitality});
    }
  }

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

  /* -------------------------------------------- */
  async rollAttributeAptitude( attrKey ) {
    let attr = this.data.data.attributes[attrKey];
    if ( !attr) {
      attr = this.data.data.aptitudes[attrKey];
    }
    if (attr) {
      let rollData = {
        mode : "attribute",
        actorId: this.id,
        actorImg: this.img,
        attribute: duplicate(attr),
        boons :  this.getBoons(),
        flaws :  this.getFlaws(),
        d6Bonus: 0,
        d6Malus: 0,
        rollMode: game.settings.get("core", "rollMode"),
        title: game.i18n.localize(attr.label),
        optionsBonusMalus: BoLUtility.buildListOptions(-8, +2),
        bonusMalus: 0
      }
      let rollDialog = await BoLRollDialog.create( this, rollData);
      rollDialog.render( true );
    } else {
      ui.notifications.warn("Unable to find attribute " + attrKey );
    }
  }

  /* -------------------------------------------- */
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

  /* -------------------------------------------- */
  async rollWeapon( weaponId ) {
    let weapon = BoLUtility.data(this.data.items.find( item => item.type == 'weapon' && item.id == weaponId));
    if (weapon) {
      let target = BoLUtility.getTarget();
      if ( !target) {
        ui.notifications.warn("You must have a target to attack with a Weapon");
        return;
      }
      let objectDefender = BoLUtility.data(game.actors.get(target.data.actorId));
      objectDefender = mergeObject(objectDefender, target.data.actorData);
      let rollData = {
        mode : "weapon",
        actorId: this.id,
        actorImg: this.img,
        weapon :  weapon,
        target: target,
        defender: objectDefender,
        boons :  this.getBoons(),
        flaws :  this.getFlaws(),
        rollAttribute: 'agility',
        attributes: duplicate(this.data.data.attributes), // For damage bonus
        d6Bonus: 0,
        d6Malus: 0,
        rollMode: game.settings.get("core", "rollMode"),
        title: weapon.name,
        rangeModifier: 0,
        optionsBonusMalus: BoLUtility.buildListOptions(-8, +2),
        bonusMalus: 0
      }
      if ( weapon.data.type == 'melee') {
        rollData.aptitude = duplicate(this.data.data.aptitudes.melee);
      } else {
        rollData.aptitude = duplicate(this.data.data.aptitudes.ranged);
      }
      console.log("WEAPON ! ", rollData);
      let rollDialog = await BoLRollDialog.create( this, rollData);
      rollDialog.render( true );
    } else {
      ui.notifications.warn("Unable to find weapon for actor " + this.name + " - Weapon ID  " + weaponId);
    }
  }

  
}