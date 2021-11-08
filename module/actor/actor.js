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

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    let newVitality = 10 + this.data.data.attributes.vigor.value;
    if ( newVitality != this.data.data.resources.hp.max) {
      this.data.data.resources.hp.max = newVitality;
      this.update( { 'data.resources.hp.max': newVitality});
    }
  }

  /* -------------------------------------------- */
  get itemData(){
    return Array.from(this.data.items.values()).map(i => i.data);
  }
  get details() {
    return this.data.data.details;
  }
  get attributes() {
    return Object.values(this.data.data.attributes);
  }
  get aptitudes() {
    return Object.values(this.data.data.aptitudes);
  }
  get resources() {
    return Object.values(this.data.data.resources);
  }
  get boons() {
    return this.itemData.filter(i => i.type === "feature" && i.data.subtype === "boon");
  }
  get flaws() {
    return this.itemData.filter(i => i.type === "feature" && i.data.subtype === "flaw");
  }
  get careers() {
    return this.itemData.filter(i => i.type === "feature" && i.data.subtype === "career");
  }
  get origins() {
    return this.itemData.filter(i => i.type === "feature" && i.data.subtype === "origin");
  }
  get races() {
    return this.itemData.filter(i => i.type === "feature" && i.data.subtype === "race");
  }
  get languages() {
    return this.itemData.filter(i => i.type === "feature" && i.data.subtype === "language");
  }
  get features() {
    return this.itemData.filter(i => i.type === "feature");
  }
  get equipment() {
    return this.itemData.filter(i => i.type === "item");
  }
  get weapons() {
    return this.itemData.filter(i => i.type === "item" && i.data.subtype === "weapon");
  }
  get armors() {
    return this.itemData.filter(i => i.type === "item" && i.data.subtype === "armor" && i.data.worn === true);
  }
  get helms() {
    return this.itemData.filter(i => i.type === "item" && i.data.subtype === "helm" && i.data.worn === true);
  }
  get shields() {
    return this.itemData.filter(i => i.type === "item" && i.data.subtype === "shield" && i.data.worn === true);
  }
  get protections() {
    return this.armors.concat(this.helms)
  }
  get melee() {
    return this.weapons.filter(i => i.data.properties.melee === true && i.data.worn === true);
  }
  get ranged() {
    return this.weapons.filter(i => i.data.properties.ranged === true && i.data.worn === true);
  }
  buildFeatures(){
    return {
      "careers": {
        "label": "BOL.featureCategory.careers",
        "ranked": true,
        "items": this.careers
      },
      "origins": {
        "label": "BOL.featureCategory.origins",
        "ranked": false,
        "items": this.origins
      },
      "races": {
        "label": "BOL.featureCategory.races",
        "ranked": false,
        "items": this.races
      },
      "boons": {
        "label": "BOL.featureCategory.boons",
        "ranked": false,
        "items": this.boons
      },
      "flaws": {
        "label": "BOL.featureCategory.flaws",
        "ranked": false,
        "items": this.flaws
      },
      "languages": {
        "label": "BOL.featureCategory.languages",
        "ranked": false,
        "items": this.languages
      }
    };
  }
  buildCombat(){
    return {
      "melee" : {
        "label" : "BOL.combatCategory.melee",
        "weapon" : true,
        "protection" : false,
        "blocking" : false,
        "ranged" : false,
        "items" : this.melee
      },
      "ranged" : {
        "label" : "BOL.combatCategory.ranged",
        "weapon" : true,
        "protection" : false,
        "blocking" : false,
        "ranged" : true,
        "items" : this.ranged
      },
      "protections" : {
        "label" : "BOL.combatCategory.protections",
        "weapon" : false,
        "protection" : true,
        "blocking" : false,
        "ranged" : false,
        "items" : this.protections
      },
      "shields" : {
        "label" : "BOL.combatCategory.shields",
        "weapon" : false,
        "protection" : false,
        "blocking" : true,
        "ranged" : false,
        "items" : this.shields
      }
    };
  }
  /* -------------------------------------------- */
  buildRollData(mode, title) {
    return {
      mode : mode,
      title : title,
      actorId: this.id,
      actorImg: this.img,
      boons :  this.boons,
      flaws :  this.flaws,
      d6Bonus: 0,
      d6Malus: 0,
      rollMode: game.settings.get("core", "rollMode"),
      optionsBonusMalus: BoLUtility.buildListOptions(-8, +2),
      bonusMalus: 0
    }
  }

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
      let rollData = this.buildRollData("attribute", game.i18n.localize(attr.label));
      rollData.attribute = duplicate(attr);
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
      let rollData = this.buildRollData("career", `${career.name} : ${career.data.rank}`);
      rollData.career = career;
      rollData.rollAttribute = 'mind';
      rollData.attributes = duplicate(this.data.data.attributes);
      let rollDialog = await BoLRollDialog.create( this, rollData);
      rollDialog.render( true );
    } else {
      ui.notifications.warn("Unable to find career for actor " + this.name + " - Career ID  " + careerId);
    }
  }

  /* -------------------------------------------- */
  async rollWeapon( weaponId ) {
    let weapon = BoLUtility.data(this.data.items.find( item => item.type == 'item' && item.id == weaponId));
    if (weapon) {
      let target = BoLUtility.getTarget();
      // if ( !target) {
      //   ui.notifications.warn("You must have a target to attack with a Weapon");
      //   return;
      // }
      let objectDefender = (target) ? BoLUtility.data(game.actors.get(target.data.actorId)) : null;
      objectDefender = (objectDefender) ? mergeObject(objectDefender, target.data.actorData) : null;
      let rollData = this.buildRollData("weapon", weapon.name);
      rollData.weapon =  weapon;
      rollData.target = target;
      rollData.isRanged = BoLUtility.isRangedWeapon( weapon );
      rollData.defender = objectDefender;
      rollData.rollAttribute = 'agility';
      rollData.attributes = duplicate(this.data.data.attributes); // For damage bonus
      rollData.rangeModifier = 0;

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


  /**
   *
   * @param {*} item
   * @param {*} bypassChecks
   * @returns
   */
  toggleEquipItem(item) {
    const equipable = item.data.data.properties.equipable;
    if(equipable){
      let itemData = duplicate(item.data);
      itemData.data.worn = !itemData.data.worn;
      return item.update(itemData);
    }
  }


}