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
  updateResourcesData() {
    if (this.type == 'character') {
      let newVitality = 10 + this.data.data.attributes.vigor.value + this.data.data.resources.hp.bonus
      if (this.data.data.resources.hp.max != newVitality) {
        this.update({ 'data.resources.hp.max': newVitality })
      }
      let newPower = 10 + this.data.data.attributes.mind.value + this.data.data.resources.power.bonus
      if (this.data.data.resources.power.max != newPower) {
        this.update({ 'data.resources.power.max': newPower })
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
  get itemData() {
    return Array.from(this.data.items.values()).map(i => i.data)
  }
  get details() {
    return this.data.data.details
  }
  get attributes() {
    return Object.values(this.data.data.attributes)
  }
  get aptitudes() {
    return Object.values(this.data.data.aptitudes)
  }

  /* -------------------------------------------- */
  clearRoundModifiers() { // Process data/items that are finished at end of a round
    let foList = this.fightoptions
    for (let fo of foList) {
      if (fo.data.properties.used) {
        this.updateEmbeddedDocuments("Item", [{ _id: fo._id, 'data.properties.used': false }])
      }
    }
  }

  /* -------------------------------------------- */
  get defenseValue() {
    let defMod = 0
    let fo = this.getActiveFightOption()
    if (fo && fo.data.properties.fightoptiontype == "intrepid") {
      defMod += -2
    }
    if (fo && fo.data.properties.fightoptiontype == "fulldefense") {
      defMod += 2
    }
    if (fo && fo.data.properties.fightoptiontype == "twoweaponsdef" && !fo.data.properties.used) {
      defMod += 1
      this.updateEmbeddedDocuments("Item", [{ _id: fo._id, 'data.properties.used': true }])
    }
    if (fo && fo.data.properties.fightoptiontype == "defense") {
      defMod += 1
    }
    if (fo && fo.data.properties.fightoptiontype == "attack") {
      defMod += -1
    }
    return this.data.data.aptitudes.def.value + defMod
  }

  /* -------------------------------------------- */
  getActiveFightOption() {
    let it = this.itemData.find(i => i.type === "feature" && i.data.subtype === "fightoption" && i.data.properties.activated)
    if (it) {
      return duplicate(it)
    }
    return undefined
  }

  /* -------------------------------------------- */
  incAttributeXP(key) {
    let attr = duplicate(this.data.data.attributes[key])
    if (attr) {
      let nextXP = (attr.value == -1) ? 2 : attr.value + (attr.value + 1)
      let xp = duplicate(this.data.data.xp)
      if (xp.total - xp.spent >= nextXP) {
        attr.value += 1
        xp.spent += nextXP
        this.update({ [`data.attributes.${key}`]: attr, [`data.xp`]: xp })
      } else {
        ui.notifications.warn("Pas assez de points d'expérience !")
      }
    }
  }

  /* -------------------------------------------- */
  incAptitudeXP(key) {
    let apt = duplicate(this.data.data.aptitudes[key])
    if (apt) {
      let nextXP = (apt.value == -1) ? 1 : apt.value + 2
      let xp = duplicate(this.data.data.xp)
      if (xp.total - xp.spent >= nextXP) {
        apt.value += 1
        xp.spent += nextXP
        this.update({ [`data.aptitudes.${key}`]: apt, [`data.xp`]: xp })
      } else {
        ui.notifications.warn("Pas assez de points d'expérience !")
      }
    }
  }
  /* -------------------------------------------- */
  incCareerXP(itemId) {
    let career = this.data.items.get(itemId)
    if (career) {
      career = duplicate(career)
      let nextXP = career.data.rank + 1
      let xp = duplicate(this.data.data.xp)
      if (xp.total - xp.spent >= nextXP) {
        xp.spent += nextXP
        this.update({ [`data.xp`]: xp })
        this.updateEmbeddedDocuments('Item', [{ _id: career._id, 'data.rank': career.data.rank + 1 }])
      } else {
        ui.notifications.warn("Pas assez de points d'expérience !")
      }
    }
  }

  /* -------------------------------------------- */
  async toggleFightOption(itemId) {
    let fightOption = this.data.items.get(itemId)
    let state
    let updates = []

    if (fightOption) {
      fightOption = duplicate(fightOption)
      if (fightOption.data.properties.activated) {
        state = false
      } else {
        state = true
      }
      updates.push({ _id: fightOption._id, 'data.properties.activated': state }) // Update the selected one
      await this.updateEmbeddedDocuments("Item", updates) // Apply all changes
      // Then notify 
      ChatMessage.create({
        alias: this.name,
        whisper: BoLUtility.getWhisperRecipientsAndGMs(this.name),
        content: await renderTemplate('systems/bol/templates/chat/chat-activate-fight-option.hbs', { name: this.name, img: fightOption.img, foName: fightOption.name, state: state })
      })

    }
  }

  /*-------------------------------------------- */
  get armorMalusValue() { // used for Fight Options
    for (let armor of this.armors) {
      if (armor.data.properties.armorQuality.includes("light")) {
        return 1
      }
      if (armor.data.properties.armorQuality.includes("medium")) {
        return 2
      }
      if (armor.data.properties.armorQuality.includes("heavy")) {
        return 3
      }
    }
    return 0
  }

  get resources() {
    return Object.values(this.data.data.resources)
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
    return this.itemData.filter(i => i.type === "feature" && i.data.subtype === "language")
  }
  get fightoptions() {
    return this.itemData.filter(i => i.type === "feature" && i.data.subtype === "fightoption")
  }
  get godsfaith() {
    return this.itemData.filter(i => i.type === "feature" && i.data.subtype === "godsfaith")
  }
  get features() {
    return this.itemData.filter(i => i.type === "feature")
  }
  get equipment() {
    return this.itemData.filter(i => i.type === "item")
  }
  get equipmentCreature() {
    return this.itemData.filter(i => i.type === "item" &&  i.data.category === "equipment" && (( i.data.subtype === "weapon" && i.data.properties.natural === true) || (i.data.subtype === "armor"))  )
  }
  get armors() {
    return this.itemData.filter(i => i.type === "item" && i.data.category === "equipment" && i.data.subtype === "armor");
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
    return this.itemData.filter(i => i.type === "item" && i.data.category === "spell");
  }
  get alchemy() {
    return this.itemData.filter(i => i.type === "item" && i.data.category === "alchemy");
  }
  get melee() {
    return this.weapons.filter(i => i.data.properties.melee === true);
  }
  get natural() {
    return this.weapons.filter(i => i.data.properties.natural === true);
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
    return this.itemData.filter(i => i.type === "item" && i.data.category === "equipment" && (i.data.subtype === "other" || i.data.subtype === "container" || i.data.subtype === "scroll" || i.data.subtype === "jewel"));
  }

  get bonusBoons() {
    return this.itemData.filter(i => i.type === "feature" && i.data.subtype === "boon" && i.data.properties.isbonusdice);
  }
  get malusFlaws() {
    return this.itemData.filter(i => i.type === "feature" && i.data.subtype === "flaw" && i.data.properties.ismalusdice);
  }

  isSorcerer() {
    if (this.careers.find(item => item.data.properties.sorcerer == true))
      return true
    return false
  }
  isAlchemist() {
    if (this.careers.find(item => item.data.properties.alchemist == true))
      return true
    return false
  }
  isPriest() {
    if (this.careers.find(item => item.data.properties.priest == true))
      return true
    return false
  }

  /*-------------------------------------------- */
  getPPCostArmor() {
    let armors = this.armors
    let ppCostArmor = 0
    for (let armor of armors) {
      if (armor.data.worn) {
        ppCostArmor += Number(armor.data.properties.modifiers.powercost) || 0
      }
    }
    return ppCostArmor
  }
  /*-------------------------------------------- */
  getArmorAgiMalus() {
    let malusAgi = 0
    for (let armor of this.protections) {
      if (armor.data.worn) {
        malusAgi += Number(armor.data.properties.modifiers.agility) || 0
      }
    }
    return malusAgi
  }
  /*-------------------------------------------- */
  getArmorInitMalus() {
    let malusInit = 0
    for (let armor of this.protections) {
      if (armor.data.worn) {
        malusInit += Number(armor.data.properties.modifiers.init) || 0
      }
    }
    return malusInit
  }

  /*-------------------------------------------- */
  spendPowerPoint(ppCost) {
    let newPP = this.data.data.resources.power.value - ppCost
    newPP = (newPP < 0) ? 0 : newPP
    this.update({ 'data.resources.power.value': newPP })
  }

  /*-------------------------------------------- */
  resetAlchemyStatus(alchemyId) {
    let alchemy = this.data.items.get(alchemyId)
    if (alchemy) {
      this.updateEmbeddedDocuments('Item', [{ _id: alchemy.id, 'data.properties.pccurrent': 0 }])
    }
  }

  /*-------------------------------------------- */
  async spendAlchemyPoint(alchemyId, pcCost) {
    let alchemy = this.data.items.get(alchemyId)
    if (alchemy) {
      pcCost = Number(pcCost) ?? 0
      if (this.data.data.resources.alchemypoints.value >= pcCost) {
        let newPC = this.data.data.resources.alchemypoints.value - pcCost
        newPC = (newPC < 0) ? 0 : newPC
        this.update({ 'data.resources.alchemypoints.value': newPC })
        newPC = alchemy.data.data.properties.pccurrent + pcCost
        await this.updateEmbeddedDocuments('Item', [{ _id: alchemy.id, 'data.properties.pccurrent': newPC }])
      } else {
        ui.notifications.warn("Plus assez de Points de Création !")
      }
    }
  }

  getAlchemistBonus() {
    let sorcerer = this.careers.find(item => item.data.properties.alchemist == true)
    if (sorcerer) {
      return sorcerer.data.rank
    }
    return 0;
  }
  getSorcererBonus() {
    let sorcerer = this.careers.find(item => item.data.properties.sorcerer == true)
    if (sorcerer) {
      return sorcerer.data.rank
    }
    return 0;
  }

  heroReroll() {
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

  buildFeatures() {
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
      },
      "fightoptions": {
        "label": "BOL.featureCategory.fightoptions",
        "ranked": false,
        "items": this.fightoptions
      },
      "godsfaith": {
        "label": "BOL.featureSubtypes.gods",
        "ranked": false,
        "items": this.godsfaith
      }
    }
  }

  buildCombat() {
    return {
      "melee": {
        "label": "BOL.combatCategory.melee",
        "weapon": true,
        "protection": false,
        "blocking": false,
        "ranged": false,
        "options": false,
        "items": this.melee
      },
      "ranged": {
        "label": "BOL.combatCategory.ranged",
        "weapon": true,
        "protection": false,
        "blocking": false,
        "ranged": true,
        "options": false,
        "items": this.ranged
      },
      "protections": {
        "label": "BOL.combatCategory.protections",
        "weapon": false,
        "protection": true,
        "blocking": false,
        "ranged": false,
        "options": false,
        "items": this.protections
      },
      "shields": {
        "label": "BOL.combatCategory.shields",
        "weapon": false,
        "protection": false,
        "blocking": true,
        "ranged": false,
        "options": false,
        "items": this.shields
      },
      "fightoptions": {
        "label": "BOL.combatCategory.fightOptions",
        "weapon": false,
        "protection": false,
        "blocking": false,
        "ranged": false,
        "options": true,
        "items": this.fightoptions
      }
    }
  }

  buildCombatCreature() {
    return {
      "natural": {
        "label": "BOL.combatCategory.natural",
        "weapon": true,
        "protection": false,
        "blocking": false,
        "ranged": false,
        "options": false,
        "items": this.natural
      },
      "protections": {
        "label": "BOL.combatCategory.protections",
        "weapon": false,
        "protection": true,
        "blocking": false,
        "ranged": false,
        "options": false,
        "items": this.protections
      },
    }
  }

  /*-------------------------------------------- */
  buildRollList() {
    let rolls = []
    for (let key in this.data.data.attributes) {
      let attr = this.data.data.attributes[key]
      rolls.push({ key: key, value: attr.value, name: attr.label, type: "attribute" })
    }
    for (let key in this.data.data.aptitudes) {
      if (key != "def") {
        let apt = this.data.data.aptitudes[key]
        rolls.push({ key: key, value: apt.value, name: apt.label, type: "aptitude" })
      }
    }
    return rolls
  }

  /*-------------------------------------------- */
  buildListeActions() {
    return this.melee.concat(this.ranged).concat(this.natural)
  }

  /*-------------------------------------------- */
  async manageHealthState() {
    let hpID = "lastHP" + this.id
    let lastHP = await this.getFlag("world", hpID)
    if (lastHP != this.data.data.resources.hp.value && this.isOwner ) {
      await this.setFlag("world", hpID, this.data.data.resources.hp.value)
      if (this.data.data.resources.hp.value <= 0) {
        ChatMessage.create({
          alias: this.name,
          whisper: BoLUtility.getWhisperRecipientsAndGMs(this.name),
          content: await renderTemplate('systems/bol/templates/chat/chat-vitality-zero.hbs', { name: this.name, img: this.img, hp: this.data.data.resources.hp.value })
        })
      }
    }
  }

  /*-------------------------------------------- */
  registerInit(initScore, isCritical, isFumble) {
    this.update({ 'data.combat.lastinit': initScore, 'data.combat.iscritical': isCritical, 'data.combat.isfumble': isFumble })
  }

  /*-------------------------------------------- */
  getLastInitData() {
    return this.data.data.combat
  }

  /*-------------------------------------------- */
  async subHeroPoints(nb) {
    let newHeroP = this.data.data.resources.hero.value - nb;
    newHeroP = (newHeroP < 0) ? 0 : newHeroP;
    await this.update({ 'data.resources.hero.value': newHeroP });
  }

  /*-------------------------------------------- */
  async sufferDamage(damage) {
    let newHP = this.data.data.resources.hp.value - damage
    await this.update({ 'data.resources.hp.value': newHP }) 
  }

  /* -------------------------------------------- */
  getArmorFormula() {
    let protectWorn = this.protections.filter(item => item.data.worn)
    let formula = ""
    for (let protect of protectWorn) {
      if (protect.data.subtype == 'helm') {
        formula += "+1"
      } else if (protect.data.subtype == 'armor') {
        if (BoLUtility.getRollArmor()) {
          if (!protect.data.properties.soak.formula || protect.data.properties.soak.formula == "") {
            ui.notifications.warn(`L'armure ${protect.name} n'a pas de formule pour la protection !`)
          } else {
            formula += "+" + " max(" + protect.data.properties.soak.formula +",0)"
          }
        } else {
          if (protect.data.properties.soak.value == undefined) {
            ui.notifications.warn(`L'armure ${protect.name} n'a pas de valeur fixe pour la protection !`)
          } else {
            formula += "+ " + protect.data.properties.soak.value
          }
        }
      }
    }
    console.log("Protect Formula", formula)
    return (formula == "") ? "0" : formula;
  }

  /* -------------------------------------------- */
  rollProtection(itemId) {
    let armor = this.data.items.get(itemId)
    if (armor) {
      let armorFormula = "max("+armor.data.data.properties.soak.formula + ", 0)"
      let rollArmor = new Roll(armorFormula)
      rollArmor.roll({ async: false }).toMessage()
    }
  }

  /* -------------------------------------------- */
  rollWeaponDamage(itemId) {
    let weapon = this.data.items.get(itemId)
    if (weapon) {
      let r = new BoLDefaultRoll({ id: randomID(16), isSuccess: true, mode: "weapon", weapon: weapon, actorId: this.id, actor: this })
      r.setSuccess(true)
      r.rollDamage()
    }
  }

  /* -------------------------------------------- */
  toggleEquipItem(item) {
    const equipable = item.data.data.properties.equipable;
    if (equipable) {
      let itemData = duplicate(item.data);
      itemData.data.worn = !itemData.data.worn;
      return item.update(itemData);
    }
  }
}