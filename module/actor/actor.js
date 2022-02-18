import { BoLDefaultRoll } from "../controllers/bol-rolls.js";
import { BoLUtility } from "../system/bol-utility.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class BoLActor extends Actor {
  
  /** @override */
  prepareData() {
    const actorData = this.data;
    // console.log(actorData);
    // const data = actorData.data;
    // const flags = actorData.flags;
    // Make separate methods for each Actor type (character, npc, etc.) to keep things organized.
    if (actorData.type === 'character') {
      actorData.type = 'player';
      actorData.villainy = false;
    }
    if (actorData.type === 'encounter') {
      actorData.type = 'tough';
      actorData.villainy = true;
    }
    super.prepareData();
  }

  /* -------------------------------------------- */
  //_onUpdate(changed, options, user) {
    //    
  //}

  /* -------------------------------------------- */
  updateResourcesData( ) {
    if ( this.type == 'character') {
      let newVitality = 10 + this.data.data.attributes.vigor.value + this.data.data.resources.hp.bonus
      if ( this.data.data.resources.hp.max != newVitality) {
        this.update( {'data.resources.hp.max': newVitality} );
      }
      let newPower = 10 + this.data.data.attributes.mind.value + this.data.data.resources.power.bonus
      if ( this.data.data.resources.power.max != newPower) {
        this.update( {'data.resources.power.max': newPower} );
      }
    }
  }

  /* -------------------------------------------- */
  prepareDerivedData() {
    super.prepareDerivedData()
    this.updateResourcesData()
    this.manageHealthState();
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
  get defenseValue() {
    return this.data.data.aptitudes.def.value;
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
  get armors() {
    return this.itemData.filter(i => i.type === "item"  && i.data.category === "equipment" && i.data.subtype === "armor");
  }
  get helms() {
    return this.itemData.filter(i => i.type === "item" && i.data.category === "equipment" && i.data.subtype === "helm");
  }
  get shields() {
    return this.itemData.filter(i => i.type === "item" && i.data.category === "equipment" && i.data.subtype === "shield");
  }

  get weapons() {
    return this.itemData.filter(i => i.type === "item" && i.data.category === "equipment" && i.data.subtype === "weapon");
  }
  get protections() {
    return this.armors.concat(this.helms).concat(this.shields)
  }
  get spells() {
    return this.itemData.filter(i => i.type === "item"  && i.data.category === "spell");
  }
  get alchemy() {
    return this.itemData.filter(i => i.type === "item"  && i.data.category === "alchemy");
  }
  get melee() {
    return this.weapons.filter(i => i.data.properties.melee === true);
  }
  get ranged() {
    return this.weapons.filter(i => i.data.properties.ranged === true);
  }

  get containers() {
    return this.itemData.filter(i => i.type === "item" && i.data.category === "equipment" && i.data.subtype === "container");
  }

  get treasure() {
    return this.itemData.filter(i => i.type === "item" && i.data.category === "equipment" && i.data.subtype === "currency");
  }

  get vehicles() {
    return this.itemData.filter(i => i.type === "item" && i.data.category === "vehicle");
  }

  get ammos() {
    return this.itemData.filter(i => i.type === "item" && i.data.category === "equipment" && i.data.subtype === "ammunition");
  }

  get misc() {
    return this.itemData.filter(i => i.type === "item" && i.data.category === "equipment" && (i.data.subtype === "other" ||i.data.subtype === "container" ||i.data.subtype === "scroll" || i.data.subtype === "jewel"));
  }
  
  get bonusBoons() {
    return this.itemData.filter(i => i.type === "feature" && i.data.subtype === "boon" && i.data.properties.isbonusdice);
  }
  get malusFlaws() {
    return this.itemData.filter(i => i.type === "feature" && i.data.subtype === "flaw" && i.data.properties.ismalusdice);
  }

  isSorcerer( ) {
    if ( this.careers.find( item => item.data.properties.sorcerer == true) ) 
      return true
    return false
  }
  isAlchemist( ) {
    if ( this.careers.find( item => item.data.properties.alchemist == true) ) 
      return true
    return false
  }
  isPriest( ) {
    if ( this.careers.find( item => item.data.properties.priest == true) ) 
      return true
    return false
  }

  spendPowerPoint( ppCost ) {
    let newPP = this.data.data.resources.power.value - ppCost
    newPP = (newPP<0) ? 0 : newPP
    this.update( {'data.resources.power.value': newPP})
  }

  resetAlchemyStatus( alchemyId ) {
    let alchemy = this.data.items.get( alchemyId)
    if (alchemy) {
      this.updateEmbeddedDocuments('Item', [{_id: alchemy.id, 'data.properties.pccurrent': 0}] )
    }
  }

  async spendAlchemyPoint( alchemyId, pcCost) {
    let alchemy = this.data.items.get( alchemyId)
    if (alchemy) {
      pcCost = Number(pcCost)?? 0
      if ( this.data.data.resources.alchemypoints.value >= pcCost) { 
        let newPC = this.data.data.resources.alchemypoints.value - pcCost
        newPC = (newPC<0) ? 0 : newPC
        this.update( {'data.resources.alchemypoints.value': newPC} )
        newPC = alchemy.data.data.properties.pccurrent + pcCost
        await this.updateEmbeddedDocuments('Item', [{_id: alchemy.id, 'data.properties.pccurrent': newPC}] )
      } else {
        ui.notifications.warn("Plus assez de Points de Création !")
      }
    }
  }  

  getAlchemistBonus() {
    let sorcerer = this.careers.find( item => item.data.properties.alchemist == true)
    if (sorcerer) {
      return sorcerer.data.rank
    }
    return 0;
  }
  getSorcererBonus() {
    let sorcerer = this.careers.find( item => item.data.properties.sorcerer == true)
    if (sorcerer) {
      return sorcerer.data.rank
    }
    return 0;
  }

  heroReroll( ) {
    if (this.type == 'character') {
      return this.data.data.resources.hero.value > 0;
    } else {
      if (this.data.data.type == 'adversary') {
        return this.data.data.resources.hero.value > 0;
      }
    }
    return false
  }

  getResourcesFromType() {
    let resources = {};
    if (this.type == 'encounter') {
      resources['hp'] = this.data.data.resources.hp;
      if (this.data.data.type != 'base') {
        resources['faith'] = this.data.data.resources.faith
        resources['power'] = this.data.data.resources.power
      }
      if (this.data.data.type == 'adversary') {
        resources['hero'] = duplicate(this.data.data.resources.hero)
        resources['hero'].label = "BOL.resources.villainy"
      }
    } else {
      resources = this.data.data.resources;
    }
    return resources
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

  /*-------------------------------------------- */
  async manageHealthState() {
    if (this.data.data.resources.hp.value <= 0  && this.data.lastHP != this.data.data.resources.hp.value) {
      this.data.lastHP = this.data.data.resources.hp.value
      ChatMessage.create({
        alias: this.name,
        whisper: BoLUtility.getWhisperRecipientsAndGMs(this.name),
        content: await renderTemplate('systems/bol/templates/chat/chat-vitality-zero.hbs', { name: this.name, hp: this.data.lastHP} )
      })
    }
  }

  /*-------------------------------------------- */
  registerInit(initScore, isCritical, isFumble) {
    this.update( { 'data.combat.lastinit': initScore, 'data.combat.iscritical': isCritical, 'data.combat.isfumble': isFumble} )
  }

  /*-------------------------------------------- */
  getLastInitData() {
    return this.data.data.combat
  }

  /*-------------------------------------------- */
  async subHeroPoints( nb) {
    let newHeroP = this.data.data.resources.hero.value - nb;
    newHeroP = (newHeroP < 0 ) ? 0 : newHeroP;
    await this.update( { 'data.resources.hero.value': newHeroP} );
  }

  /*-------------------------------------------- */
  async sufferDamage( damage) {
    let newHP = this.data.data.resources.hp.value - damage;
    await this.update( { 'data.resources.hp.value': newHP} );
  }

  /* -------------------------------------------- */
  getArmorFormula( ) {
    let protectWorn = this.protections.filter( item => item.data.worn)
    let formula = ""
    for (let protect of protectWorn) {
      if ( protect.data.subtype == 'helm') {
        formula += "+1"  
      } else if ( protect.data.subtype == 'armor') {
        formula += "+" + protect.data.properties.soak.formula;
      }
    }
    console.log("Protect Formula", formula)
    return (formula == "") ? "0" :formula;
  }

  /* -------------------------------------------- */
  rollProtection( itemId) {
    let armor = this.data.items.get( itemId )
    if ( armor ) {
      let armorFormula = armor.data.data.properties.soak.formula;        
      let rollArmor = new Roll(armorFormula)
      rollArmor.roll( {async: false} ).toMessage();
    }
  }

  /* -------------------------------------------- */
  rollWeaponDamage( itemId) {
    let weapon = this.data.items.get(itemId )
    if ( weapon ) {
      let r = new BoLDefaultRoll( { id: randomID(16), isSuccess: true, mode: "weapon", weapon: weapon, actor: this} )
      r.setSuccess(true)
      r.rollDamage()
    }
  }

  /* -------------------------------------------- */
  toggleEquipItem(item) {
    const equipable = item.data.data.properties.equipable;
    if(equipable){
      let itemData = duplicate(item.data);
      itemData.data.worn = !itemData.data.worn;
      return item.update(itemData);
    }
  }
}