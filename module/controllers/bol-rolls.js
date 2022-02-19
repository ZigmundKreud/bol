import { BoLUtility } from "../system/bol-utility.js";

const __adv2dice = { ["1B"]: 3, ["2B"]: 4, ["2"]: 2, ["1M"]: 3, ["2M"]: 4 }
const _apt2attr = { init: "mind", melee: "agility", ranged: "agility", def: "vigor" }

export class BoLRoll {
  static options() {
    return { classes: ["bol", "dialog"], width: 480, height: 540 };
  }

  static convertToAdv(adv) {
    if (adv == 0) return "2"
    return Math.abs(adv) + (adv < 0) ? 'M' : 'B';
  }
  static getDefaultAttribute(key) {
    return _apt2attr[key]
  }
  /* -------------------------------------------- */
  static attributeCheck(actor, actorData, dataset, event) {
    const key = dataset.key;
    const adv = dataset.adv;
    let attribute = eval(`actor.data.data.attributes.${key}`);
    let label = (attribute.label) ? game.i18n.localize(attribute.label) : null;
    let description = actor.name + " - " + game.i18n.localize('BOL.ui.attributeCheck') + " - " + game.i18n.localize(attribute.label);
    return this.displayRollDialog(
      {
        mode: "attribute",
        actor: actor,
        actorData: actorData,
        attribute: attribute,
        attrValue: attribute.value,
        aptValue: 0,
        label: label,
        careerBonus: 0,
        description: description,
        adv: this.convertToAdv(adv),
        mod: 0
      });
  }

  /* -------------------------------------------- */
  static aptitudeCheck(actor, actorData, dataset, event) {
    const key = dataset.key;
    const adv = dataset.adv;

    let aptitude = eval(`actor.data.data.aptitudes.${key}`);
    let attrKey = this.getDefaultAttribute(key)
    let attribute = eval(`actor.data.data.attributes.${attrKey}`);

    let label = (aptitude.label) ? game.i18n.localize(aptitude.label) : null;
    let description = actor.name + " - " + game.i18n.localize('BOL.ui.aptitudeCheck') + " - " + game.i18n.localize(aptitude.label);
    return this.displayRollDialog(
      {
        mode: "aptitude",
        actor: actor,
        actorData: actorData,
        attribute: attribute,
        aptitude: aptitude,
        attrValue: attribute.value,
        aptValue: aptitude.value,
        label: label,
        careerBonus: 0,
        description: description,
        adv: this.convertToAdv(adv),
        mod: 0
      });
  }

  /* -------------------------------------------- */
  static weaponCheck(actor, actorData, dataset, event) {
    let target = BoLUtility.getTarget()
    const li = $(event.currentTarget).parents(".item");
    const weapon = actor.items.get(li.data("item-id"));
    if (!weapon) {
      ui.notifications.warn("Unable to find weapon !");
      return;
    }
    let weaponData = weapon.data.data;
    let attribute =  eval(`actor.data.data.attributes.${weaponData.properties.attackAttribute}`)
    let aptitude = eval(`actor.data.data.aptitudes.${weaponData.properties.attackAptitude}`)
    
    let attackDef = {
      mode: "weapon",
      actor: actor,
      actorData: actorData,
      weapon: weapon,
      target: target,
      careerBonus: 0,
      defender: (target) ? game.actors.get(target.data.actorId) : undefined,
      attribute: attribute,
      aptitude: aptitude,
      attrValue: attribute.value,
      aptValue: aptitude.value,
      mod: 0,
      label: (weapon.name) ? weapon.name : game.i18n.localize('BOL.ui.noWeaponName'),
      description: actor.name + " - " + game.i18n.localize('BOL.ui.weaponAttack'),
      adv: "2",
    }
    console.debug("WEAPON!", attackDef, weaponData);
    return this.displayRollDialog(attackDef);
  }

  /* -------------------------------------------- */
  static alchemyCheck(actor, actorData, dataset, event) {
    const li = $(event.currentTarget).parents(".item");
    const alchemy = actor.items.get(li.data("item-id"));
    if (!alchemy) {
      ui.notifications.warn("Unable to find Alchemy !");
      return;
    }
    let alchemyData = alchemy.data.data
    if (alchemyData.properties.pccurrent < alchemyData.properties.pccost) {
      ui.notifications.warn("Pas assez de Points de Cration investis dans la Préparation !")
      return
    }

    let alchemyDef = {
      mode: "alchemy",
      actor: actor,
      actorData: actorData,
      alchemy: alchemy,
      attribute: actor.data.data.attributes.mind,
      attrValue: actor.data.data.attributes.mind.value,
      aptValue: 0,
      careerBonus: actor.getAlchemistBonus(),
      pcCost: Number(alchemyData.properties.pccost),
      pcCostCurrent: Number(alchemyData.properties.pccurrent),
      mod: Number(alchemyData.properties.difficulty),
      label: alchemy.name,
      description: actor.name + " - " + game.i18n.localize('BOL.ui.makeAlchemy'),
    }
    console.log("ALCHEMY!", alchemyDef);
    return this.displayRollDialog(alchemyDef);
  }


  /* -------------------------------------------- */
  static spellCheck(actor, actorData, dataset, event) {
    if (actor.data.data.resources.power.value <= 0) {
      ui.notifications.warn("Plus assez de points de Pouvoir !")
      return
    }
    const li = $(event.currentTarget).parents(".item");
    const spell = actor.items.get(li.data("item-id"));
    if (!spell) {
      ui.notifications.warn("Unable to find spell !");
      return;
    }
    let spellData = spell.data.data;
    let spellDef = {
      mode: "spell",
      actor: actor,
      actorData: actorData,
      spell: spell,
      attribute: actor.data.data.attributes.mind,
      attrValue: actor.data.data.attributes.mind.value,
      aptValue: 0,
      ppCurrent: Number(actor.data.data.resources.power.value),
      careerBonus: actor.getSorcererBonus(),
      ppCost: Number(spell.data.data.properties.ppcost),
      mod: Number(spellData.properties.difficulty),
      label: spell.name,
      description: actor.name + " - " + game.i18n.localize('BOL.ui.focusSpell'),
    }
    console.log("SPELL!", spellDef);
    return this.displayRollDialog(spellDef);
  }

  /* -------------------------------------------- */
  static updateTotalDice() {
    this.rollData.bmDice =  this.rollData.nbBoons - this.rollData.nbFlaws + this.rollData.bDice - this.rollData.mDice
    this.rollData.nbDice = 2 + Math.abs(this.rollData.bmDice)
    if (this.rollData.bmDice == 0 ) {
      $('#roll-nbdice').val( "2" )
    } else { 
      let letter = (this.rollData.bmDice > 0) ? "B" : "M" 
      $('#roll-nbdice').val( "2 + " + String(Math.abs(this.rollData.bmDice)) + letter )
    }

    $('#roll-modifier').val( this.rollData.attrValue + "+" + this.rollData.aptValue + "+" + this.rollData.careerBonus + "+" + this.rollData.mod + "+" +
        this.rollData.weaponModifier + "-" + this.rollData.defence + "+" + this.rollData.shieldMalus )
  }

  /* -------------------------------------------- */
  static rollDialogListener(html) {
    
    this.updateTotalDice()
    
    html.find('#optcond').change((event) => { // Dynamic change of PP cost of spell
      let pp = BoLUtility.computeSpellCost(this.rollData.spell, event.currentTarget.selectedOptions.length)
      $('#ppcost').html(pp)
      this.rollData.ppCost = pp
    })

    html.find('#mod').change((event) => {
      this.rollData.mod = Number(event.currentTarget.value) 
      this.updateTotalDice()
    })

    html.find('#attr').change((event) => { 
      let attrKey = event.currentTarget.value
      this.rollData.attribute = duplicate(this.rollData.actor.data.data.attributes[attrKey])
      this.rollData.attrValue = this.rollData.actor.data.data.attributes[attrKey].value
      this.updateTotalDice()
    } )
    html.find('#apt').change((event) => { 
      let aptKey = event.currentTarget.value
      this.rollData.aptitude = duplicate(this.rollData.actor.data.data.aptitudes[aptKey])
      this.rollData.aptValue = this.rollData.actor.data.data.aptitudes[aptKey].value
      this.updateTotalDice()
    } )

    html.find('#applyShieldMalus').click( (event) => {
      if (event.currentTarget.checked) {
        this.rollData.shieldMalus = this.rollData.shieldAttackMalus
      } else {
        this.rollData.shieldMalus = 0
      }
    })

    html.find('#career').change((event) => { 
      let careers = $('#career').val()
      this.rollData.careerBonus = (!careers || careers.length == 0) ? 0 : Math.max(...careers.map(i => parseInt(i)))     
      this.updateTotalDice()
    })
    html.find('#boon').change((event) => { 
      let boons = $('#boon').val()
      this.rollData.nbBoons = (!boons || boons.length == 0) ? 0 : Math.max(...boons.map(i => parseInt(i)))     
      this.updateTotalDice()
    })
    html.find('#flaw').change((event) => { 
      let flaws = $('#flaw').val()
      this.rollData.nbFlaws = (!flaws || flaws.length == 0) ? 0 : Math.max(...flaws.map(i => parseInt(i)))  
      this.updateTotalDice()
    })
    html.find('.bdice').click((event) => {
      this.rollData.mDice = 0
      this.rollData.bDice = Number(event.currentTarget.value)    
      this.updateTotalDice()
    })
    html.find('.mdice').click((event) => { 
      this.rollData.bDice = 0
      this.rollData.mDice = Number(event.currentTarget.value)    
      this.updateTotalDice()
    })
  }

  /* ROLL DIALOGS                                 */
  /* -------------------------------------------- */
  static async displayRollDialog(rollData, onEnter = "submit") {

    const rollOptionTpl = `systems/bol/templates/dialogs/${rollData.mode}-roll-dialog.hbs`
    rollData.careers = rollData.actorData.features.careers
    rollData.boons = rollData.actor.bonusBoons
    rollData.flaws = rollData.actor.malusFlaws
    rollData.defence = 0
    rollData.bDice   = 0
    rollData.mDice   = 0
    rollData.nbBoons = 0
    rollData.nbFlaws = 0
    rollData.nbDice  = 0
    if (rollData.shieldBlock == 'blockall') {
      rollData.shieldMalus = rollData.shieldAttackMalus;
    } else {
      rollData.shieldMalus = 0
    }
    rollData.careerBonus = rollData.careerBonus ?? 0
    rollData.mod = rollData.mod ?? 0
    rollData.id = randomID(16)

    // Weapon mode specific management
    rollData.weaponModifier = 0
    rollData.attackBonusDice = false

    // Saves
    this.rollData = rollData
    console.log("ROLLDATA", rollData)

    if (rollData.mode == "weapon") {
      rollData.weaponModifier = rollData.weapon.data.data.properties.attackModifiers ?? 0;
      rollData.attackBonusDice = rollData.weapon.data.data.properties.attackBonusDice
      if (rollData.defender) { // If target is selected
        rollData.defence = rollData.defender.defenseValue
        rollData.shieldBlock = 'none'
        let shields = rollData.defender.shields
        //console.log("Shields", shields)
        for (let shield of shields) {
          rollData.shieldBlock = (shield.data.properties.blocking.blockingAll) ? 'blockall' : 'blockone';
          rollData.shieldAttackMalus = (shield.data.properties.blocking.malus) ? shield.data.properties.blocking.malus : 1;
          rollData.applyShieldMalus = false
        }
      }
    }

    const rollOptionContent = await renderTemplate(rollOptionTpl, rollData);
    let d = new Dialog({
      title: rollData.label,
      content: rollOptionContent,
      rollData: rollData,
      render: html => this.rollDialogListener(html),
      buttons: {
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("BOL.ui.cancel"),
          callback: () => {
          }
        },
        submit: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("BOL.ui.submit"),
          callback: (html) => {
            if (rollData.mode == 'spell' && rollData.ppCurrent < rollData.ppCost) { // Check PP available
              ui.notifications.warn("Pas assez de Points de Pouvoir !")
              return
            }

            rollData.registerInit = (rollData.aptKey == 'init') ? $('#register-init').is(":checked") : false;

            const isMalus = rollData.mDice > 0 
            rollData.nbDice += (rollData.attackBonusDice) ? 1 : 0

            const modifiers = rollData.attrValue + rollData.aptValue + rollData.careerBonus + rollData.mod + rollData.weaponModifier - rollData.defence + rollData.shieldMalus
            const formula = (isMalus) ? rollData.nbDice + "d6kl2 + " + modifiers : rollData.nbDice + "d6kh2 + " + modifiers
            rollData.formula = formula
            rollData.modifiers = modifiers

            let r = new BoLDefaultRoll(rollData);
            r.roll();
          }
        }
      },
      default: onEnter,
      close: () => { }
    }, this.options());

    return d.render(true);
  }
}

export class BoLDefaultRoll {

  constructor(rollData) {
    BoLUtility.storeRoll(rollData)
    this.rollData = rollData
    if (this.rollData.isSuccess == undefined) { // First init
      this.rollData.isSuccess = false;
      this.rollData.isCritical = false;
      this.rollData.isFumble = false;
    }
    if (this.rollData.optionsId) {
      $(`#${this.rollData.optionsId}`).hide() // Hide the options roll buttons
    }
    if (this.rollData.applyId) {
      $(`#${this.rollData.applyId}`).hide() // Hide the options roll buttons
    }
    this.rollData.optionsId = randomID(16)
    this.rollData.applyId = randomID(16)
  }

  async roll() {

    const r = new Roll(this.rollData.formula);
    await r.roll({ "async": false });
    const activeDice = r.terms[0].results.filter(r => r.active);
    const diceTotal = activeDice.map(r => r.result).reduce((a, b) => a + b);
    this.rollData.roll = r
    this.rollData.isSuccess = (r.total >= 9);
    this.rollData.isCritical = (diceTotal === 12)
    this.rollData.isRealCritical = (diceTotal === 12)
    this.rollData.isFumble = (diceTotal === 2);
    this.rollData.isFailure = !this.rollData.isSuccess
    if (this.rollData.reroll == undefined) {
      this.rollData.reroll = this.rollData.actor.heroReroll()
    }

    if (this.rollData.registerInit) {
      this.rollData.actor.registerInit(r.total, this.rollData.isCritical);
    }
    if (this.rollData.isSuccess && this.rollData.mode == "spell") { // PP cost management
      this.rollData.actor.spendPowerPoint(this.rollData.ppCost)
    }
    if (this.rollData.mode == "alchemy") { // PP cost management
      this.rollData.actor.resetAlchemyStatus(this.rollData.alchemy.id)
    }

    await this.sendChatMessage()
  }

  async sendChatMessage() {
    this._buildChatMessage(this.rollData).then(msgFlavor => {
      this.rollData.roll.toMessage({
        user: game.user.id,
        flavor: msgFlavor,
        speaker: ChatMessage.getSpeaker({ actor: this.rollData.actor }),
        flags: { msgType: "default" }
      })
    });
  }

  upgradeToCritical() {
    // Force to Critical roll
    this.rollData.isCritical = true
    this.rollData.isRealCritical = false
    this.rollData.isSuccess = true
    this.rollData.isFailure = false
    this.rollData.reroll = false
    this.rollData.roll = new Roll("12+" + this.rollData.modifiers)
    this.rollData.reroll = false
    this.sendChatMessage()
  }

  setSuccess(flag) {
    this.rollData.isSuccess = flag
  }

  async sendDamageMessage() {
    this._buildDamageChatMessage(this.rollData).then(msgFlavor => {
      this.rollData.damageRoll.toMessage({
        user: game.user.id,
        flavor: msgFlavor,
        speaker: ChatMessage.getSpeaker({ actor: this.rollData.actor }),
        flags: { msgType: "default" }
      })
    });
  }

  getDamageAttributeValue(attrDamage) {
    let attrDamageValue = 0
    if (attrDamage.includes("vigor")) {
      attrDamageValue = this.rollData.actor.data.data.attributes.vigor.value
      if (attrDamage.includes("half")) {
        attrDamageValue = Math.floor(attrDamageValue / 2)
      }
    }
    return attrDamageValue
  }

  async rollDamage() {
    if (this.rollData.mode != "weapon") { // Only specific process in Weapon mode
      return;
    }

    if (this.rollData.isSuccess) {
      if (!this.rollData.damageRoll) {
        let bonusDmg = 0
        if (this.rollData.damageMode == 'damage-plus-6') {
          bonusDmg = 6
        }
        if (this.rollData.damageMode == 'damage-plus-12') {
          bonusDmg = 12
        }
        let attrDamageValue = this.getDamageAttributeValue(this.rollData.weapon.data.data.properties.damageAttribute)
        let weaponFormula = BoLUtility.getDamageFormula(this.rollData.weapon.data.data.properties.damage,
          this.rollData.weapon.data.data.properties.damageModifiers,
          this.rollData.weapon.data.data.properties.damageMultiplier)
        let damageFormula = weaponFormula + "+" + bonusDmg + "+" + attrDamageValue
        console.log("DAMAGE !!!", damageFormula, attrDamageValue)

        //console.log("Formula", weaponFormula, damageFormula, this.rollData.weapon.data.data.properties.damage)
        this.rollData.damageFormula = damageFormula
        this.rollData.damageRoll = new Roll(damageFormula)
        this.rollData.damageTotal = this.rollData.damageRoll.total
        await this.rollData.damageRoll.roll({ "async": false })
      }
      $(`#${this.rollData.optionsId}`).hide() // Hide the options roll buttons
      this.sendDamageMessage()
    }
  }

  _buildDamageChatMessage(rollData) {
    const rollMessageTpl = 'systems/bol/templates/chat/rolls/damage-roll-card.hbs';
    return renderTemplate(rollMessageTpl, rollData);
  }

  _buildChatMessage(rollData) {
    const rollMessageTpl = 'systems/bol/templates/chat/rolls/default-roll-card.hbs';
    return renderTemplate(rollMessageTpl, rollData);
  }

}
