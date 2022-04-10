import { BoLUtility } from "../system/bol-utility.js";

const _apt2attr = { init: "mind", melee: "agility", ranged: "agility", def: "vigor" }

/* -------------------------------------------- */
export class BoLRoll {

  /* -------------------------------------------- */
  static options() {
    return { classes: ["bol", "dialog"], width: 480, height: 540 };
  }

  /* -------------------------------------------- */
  static getDefaultAttribute(key) {
    return _apt2attr[key]
  }

  /* -------------------------------------------- */
  static attributeCheck(actor, key) {

    let attribute = eval(`actor.data.data.attributes.${key}`)
    let label = (attribute.label) ? game.i18n.localize(attribute.label) : null
    let description = game.i18n.localize('BOL.ui.attributeCheck') + " - " + game.i18n.localize(attribute.label)

    let rollData = {
      mode: "attribute",
      actorId: actor.id,
      attribute: attribute,
      attrValue: attribute.value,
      aptValue: 0,
      label: label,
      careerBonus: 0,
      description: description,
      armorAgiMalus: actor.getArmorAgiMalus(),
      armorInitMalus: actor.getArmorInitMalus(),
      mod: 0
    }
    console.log(">>>>>>>>>>", rollData, actor)
    return this.displayRollDialog(rollData)
  }

  /* -------------------------------------------- */
  static aptitudeCheck(actor, key) {

    let aptitude = eval(`actor.data.data.aptitudes.${key}`)
    let attrKey = this.getDefaultAttribute(key)
    let attribute = eval(`actor.data.data.attributes.${attrKey}`)

    let label = (aptitude.label) ? game.i18n.localize(aptitude.label) : null;
    let description = game.i18n.localize('BOL.ui.aptitudeCheck') + " - " + game.i18n.localize(aptitude.label);
    return this.displayRollDialog(
      {
        mode: "aptitude",
        actorId: actor.id,
        attribute: attribute,
        aptitude: aptitude,
        attrValue: attribute.value,
        aptValue: aptitude.value,
        armorAgiMalus: actor.getArmorAgiMalus(),
        armorInitMalus: actor.getArmorInitMalus(),
        label: label,
        careerBonus: 0,
        description: description,
        mod: 0
      })
  }

  /* -------------------------------------------- */
  static weaponCheckWithWeapon(actor, weapon) {

    let target = BoLUtility.getTarget()

    let weaponData = weapon.data.data
    let attribute = eval(`actor.data.data.attributes.${weaponData.properties.attackAttribute}`)
    let aptitude = eval(`actor.data.data.aptitudes.${weaponData.properties.attackAptitude}`)

    // Manage specific case
    let fightOption = actor.getActiveFightOption()
    if (fightOption && fightOption.data.fightoptiontype == "fulldefense") {
      ui.notifications.warn(`{{actor.name}} est en Défense Totale ! Il ne peut pas attaquer ce round.`)
      return
    }
    // Build the roll structure
    let rolldata = {
      mode: "weapon",
      actorId: actor.id,
      weapon: weapon,
      isRanged: weaponData.properties.ranged || weaponData.properties.throwing,
      targetId: target?.id,
      fightOption: fightOption,
      careerBonus: 0,
      defenderId: target?.data?.actorId,
      attribute: attribute,
      aptitude: aptitude,
      attrValue: attribute.value,
      aptValue: aptitude.value,
      armorAgiMalus: actor.getArmorAgiMalus(),
      armorInitMalus: actor.getArmorInitMalus(),
      mod: 0,
      modRanged: 0,
      label: (weapon.name) ? weapon.name : game.i18n.localize('BOL.ui.noWeaponName'),
      description: game.i18n.localize('BOL.ui.weaponAttack') + " : " + weapon.name,
    }
    return this.displayRollDialog(rolldata)
  }
  /* -------------------------------------------- */
  static weaponCheck(actor, event) {
    const li = $(event.currentTarget).parents(".item")
    const weapon = actor.items.get(li.data("item-id"))
    if (!weapon) {
      ui.notifications.warn("Unable to find weapon !")
      return
    }
    return this.weaponCheckWithWeapon(actor, weapon)
  }

  /* -------------------------------------------- */
  static alchemyCheck(actor, event) {
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
      actorId: actor.id,
      alchemy: alchemy,
      attribute: actor.data.data.attributes.mind,
      attrValue: actor.data.data.attributes.mind.value,
      aptValue: 0,
      careerBonus: actor.getAlchemistBonus(),
      pcCost: Number(alchemyData.properties.pccost),
      pcCostCurrent: Number(alchemyData.properties.pccurrent),
      mod: Number(alchemyData.properties.difficulty),
      armorAgiMalus: actor.getArmorAgiMalus(),
      armorInitMalus: actor.getArmorInitMalus(),
      label: alchemy.name,
      description: game.i18n.localize('BOL.ui.makeAlchemy') + "+" + alchemy.name,
    }
    console.log("ALCHEMY!", alchemyDef);
    return this.displayRollDialog(alchemyDef);
  }

  /* -------------------------------------------- */
  static spellCheckWithSpell( actor, spell ) {
    let spellData = spell.data.data
    let spellDef = {
      mode: "spell",
      actorId: actor.id,
      spell: spell,
      attribute: actor.data.data.attributes.mind,
      attrValue: actor.data.data.attributes.mind.value,
      aptValue: 0,
      ppCurrent: Number(actor.data.data.resources.power.value),
      careerBonus: actor.getSorcererBonus(),
      ppCostArmor: actor.getPPCostArmor(),
      ppCost: Number(spell.data.data.properties.ppcost),
      mod: Number(spellData.properties.difficulty),
      armorAgiMalus: actor.getArmorAgiMalus(),
      armorInitMalus: actor.getArmorInitMalus(),
      label: spell.name,
      description: game.i18n.localize('BOL.ui.focusSpell') + " : " + spell.name,
    }
    console.log("SPELL!", spellDef)
    return this.displayRollDialog(spellDef)
  }

  /* -------------------------------------------- */
  static spellCheck(actor, event) {
    if (actor.data.data.resources.power.value <= 0) {
      ui.notifications.warn("Plus assez de points de Pouvoir !")
      return
    }
    const li = $(event.currentTarget).parents(".item")
    const spell = actor.items.get(li.data("item-id"))
    if (!spell) {
      ui.notifications.warn("Impossible de trouver ce sort !")
      return
    }
    return this.spellCheckWithSpell( actor, spell)
  }

  /* -------------------------------------------- */
  static updateTotalDice() {

    this.updateArmorMalus(this.rollData)
    this.updatePPCost(this.rollData)

    this.rollData.bmDice = this.rollData.nbBoons - this.rollData.nbFlaws + this.rollData.bDice - this.rollData.mDice
    this.rollData.nbDice = 2 + Math.abs(this.rollData.bmDice)
    if (this.rollData.bmDice == 0) {
      $('#roll-nbdice').val("2")
    } else {
      let letter = (this.rollData.bmDice > 0) ? "B" : "M"
      $('#roll-nbdice').val("2 + " + String(Math.abs(this.rollData.bmDice)) + letter)
    }
    let rollbase = this.rollData.attrValue + "+" + this.rollData.aptValue
    if ( this.rollData.weapon && this.rollData.weapon.data.data.properties.onlymodifier ) {
      rollbase = ""
    }
    $('#roll-modifier').val(rollbase + "+" + this.rollData.careerBonus + "+" + this.rollData.mod + "+" +
      this.rollData.modRanged + "+" + this.rollData.weaponModifier + "-" + this.rollData.defence + "-" + this.rollData.modArmorMalus + "-" +
      this.rollData.shieldMalus + "+" + this.rollData.attackModifier + "+" + this.rollData.appliedArmorMalus)
  }

  /* -------------------------------------------- */
  static preProcessFightOption(rollData) {
    rollData.damagesIgnoresArmor = false  // Always reset flags
    rollData.modArmorMalus = 0
    rollData.attackModifier = 0

    let fgItem = rollData.fightOption
    if (fgItem) {
      console.log(fgItem)
      if (fgItem.data.properties.fightoptiontype == "armordefault") {
        rollData.modArmorMalus = rollData.armorMalus // Activate the armor malus
        rollData.damagesIgnoresArmor = true
      }
      if (fgItem.data.properties.fightoptiontype == "intrepid") {
        rollData.attackModifier += 2
      }
      if (fgItem.data.properties.fightoptiontype == "defense") {
        rollData.attackModifier += -1
      }
      if (fgItem.data.properties.fightoptiontype == "attack") {
        rollData.attackModifier += 1
      }
      if (fgItem.data.properties.fightoptiontype == "twoweaponsdef" || fgItem.data.properties.fightoptiontype == "twoweaponsatt") {
        rollData.attackModifier += -1
      }
    }
  }
  /* -------------------------------------------- */
  static updateArmorMalus(rollData) {
    rollData.appliedArmorMalus = 0
    if (rollData.attribute.key == "agility") {
      $("#armor-agi-malus").show()
      rollData.appliedArmorMalus += rollData.armorAgiMalus
    } else {
      $("#armor-agi-malus").hide()
    }
    if (rollData.aptitude && rollData.aptitude.key == "init") {
      $("#armor-init-malus").show()
      rollData.appliedArmorMalus += rollData.armorInitMalus
    } else {
      $("#armor-init-malus").hide()
    }
  }

  /* ------------------------------ -------------- */
  static updatePPCost(rollData) {
    $('#ppcost').html(rollData.ppCost + " + Armor(" + rollData.ppCostArmor + ")=" + Number(rollData.ppCost + rollData.ppCostArmor))
  }

  /* ------------------------------ -------------- */
  static rollDialogListener(html) {

    this.updateTotalDice()

    html.find('#optcond').change((event) => { // Dynamic change of PP cost of spell
      let pp = BoLUtility.computeSpellCost(this.rollData.spell, event.currentTarget.selectedOptions.length)
      this.rollData.ppCost = pp
      this.updatePPCost( this.rollData)
    })

    html.find('#mod').change((event) => {
      this.rollData.mod = Number(event.currentTarget.value)
      this.updateTotalDice()
    })
    html.find('#modRanged').change((event) => {
      this.rollData.modRanged = Number(event.currentTarget.value)
      this.updateTotalDice()
    })

    html.find('#attr').change((event) => {
      let attrKey = event.currentTarget.value
      let actor = game.actors.get( this.rollData.actorId)
      this.rollData.attribute = duplicate(actor.data.data.attributes[attrKey])
      this.rollData.attrValue = actor.data.data.attributes[attrKey].value
      this.updateTotalDice()
    })
    html.find('#apt').change((event) => {
      let aptKey = event.currentTarget.value
      let actor = game.actors.get( this.rollData.actorId)
      this.rollData.aptitude = duplicate(actor.data.data.aptitudes[aptKey])
      this.rollData.aptValue = actor.data.data.aptitudes[aptKey].value
      this.updateTotalDice()
    })

    html.find('#applyShieldMalus').click((event) => {
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

  /* -------------------------------------------- */
  static preProcessWeapon(rollData) {
    if (rollData.mode == "weapon") {
      rollData.weaponModifier = rollData.weapon.data.data.properties.attackModifiers ?? 0;
      rollData.attackBonusDice = rollData.weapon.data.data.properties.attackBonusDice
      if (rollData.defender) { // If target is selected
        rollData.defence = rollData.defender.defenseValue
        rollData.armorMalus = rollData.defender.armorMalusValue
        rollData.shieldBlock = 'none'
        let shields = rollData.defender.shields
        for (let shield of shields) {
          rollData.shieldBlock = (shield.data.properties.blocking.blockingAll) ? 'blockall' : 'blockone';
          rollData.shieldAttackMalus = (shield.data.properties.blocking.malus) ? shield.data.properties.blocking.malus : 1;
          rollData.applyShieldMalus = false
        }
      }
    }
  }

  /* ROLL DIALOGS                                 */
  /* -------------------------------------------- */
  static async displayRollDialog(rollData, onEnter = "submit") {

    // initialize default flags/values
    const rollOptionTpl = `systems/bol/templates/dialogs/${rollData.mode}-roll-dialog.hbs`

    let actor = game.actors.get( rollData.actorId )
    rollData.careers = actor.careers
    rollData.boons = actor.bonusBoons
    rollData.flaws = actor.malusFlaws
    rollData.rollOwnerID = actor.id
    rollData.defence = 0
    rollData.attackModifier = 0 // Used for fight options
    rollData.modArmorMalus = 0 // Used for fight options
    rollData.bDice = 0
    rollData.mDice = 0
    rollData.nbBoons = 0
    rollData.nbFlaws = 0
    rollData.nbDice = 0
    if (rollData.shieldBlock == 'blockall') {
      rollData.shieldMalus = rollData.shieldAttackMalus;
    } else {
      rollData.shieldMalus = 0
    }
    rollData.careerBonus = rollData.careerBonus ?? 0
    rollData.modRanged = rollData.modRanged ?? 0
    rollData.mod = rollData.mod ?? 0
    rollData.id = randomID(16)
    rollData.weaponModifier = 0
    rollData.attackBonusDice = false
    rollData.armorMalus = 0
    // Specific stuff 
    this.preProcessWeapon(rollData)
    this.preProcessFightOption(rollData)
    this.updateArmorMalus(rollData)
    this.updatePPCost(rollData)
    // Save
    this.rollData = rollData
    console.log("ROLLDATA", rollData)

    // Then display+process the dialog
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

            rollData.registerInit = (rollData.aptitude && rollData.aptitude.key == 'init') ? $('#register-init').is(":checked") : false;

            const isMalus = rollData.mDice > 0
            rollData.nbDice += (rollData.attackBonusDice) ? 1 : 0

            let rollbase = rollData.attrValue + rollData.aptValue
            if ( rollData.weapon && rollData.weapon.data.data.properties.onlymodifier ) {
              rollbase = 0
            }        
            const modifiers = rollbase + rollData.careerBonus + rollData.mod + rollData.weaponModifier - rollData.defence - rollData.modArmorMalus + rollData.shieldMalus + rollData.attackModifier + rollData.appliedArmorMalus
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

/* -------------------------------------------- */
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

  /* -------------------------------------------- */
  async roll() {

    const r = new Roll(this.rollData.formula)
    // console.log("Roll formula", this.rollData.formula)
    await r.roll({ "async": false })
    const activeDice = r.terms[0].results.filter(r => r.active)
    const diceTotal = activeDice.map(r => r.result).reduce((a, b) => a + b)
    this.rollData.roll = r
    this.rollData.isSuccess = (r.total >= 9)
    this.rollData.isCritical = (diceTotal === 12)
    this.rollData.isRealCritical = (diceTotal === 12)
    this.rollData.isHeroic = (diceTotal === 12)
    this.rollData.isLegendary = false
    this.rollData.isFumble = (diceTotal === 2)
    this.rollData.isFailure = !this.rollData.isSuccess

    let actor = game.actors.get( this.rollData.actorId)
    if (this.rollData.reroll == undefined) {
      this.rollData.reroll = actor.heroReroll()
    }
    
    if (this.rollData.registerInit) {
      actor.registerInit(r.total, this.rollData.isCritical, this.rollData.isFumble)
    }
    if (this.rollData.isSuccess && this.rollData.mode == "spell") { // PP cost management
      actor.spendPowerPoint(this.rollData.ppCost + this.rollData.ppCostArmor)
    }
    if (this.rollData.mode == "alchemy") { // PP cost management
      actor.resetAlchemyStatus(this.rollData.alchemy.id)
    }

    await this.sendChatMessage()
  }

  /* -------------------------------------------- */
  async sendChatMessage() {
    let actor = game.actors.get( this.rollData.actorId)
    this._buildChatMessage(this.rollData).then(msgFlavor => {
      this.rollData.roll.toMessage({
        user: game.user.id,
        rollMode: game.settings.get("core", "rollMode"),
        //whisper: BoLUtility.getWhisperRecipientsAndGMs(this.rollData.actor.name),
        flavor: msgFlavor,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
      })
    })
  }

  /* -------------------------------------------- */
  upgradeToLegendary() {
    // Force to Critical roll
    this.rollData.isCritical = true
    this.rollData.isLegendary = true
    this.rollData.isRealCritical = false
    this.rollData.isSuccess = true
    this.rollData.isFailure = false
    this.rollData.roll = new Roll("12+" + this.rollData.modifiers)
    this.rollData.reroll = false
    this.sendChatMessage()
  }

  /* -------------------------------------------- */
  upgradeToHeroic() {
    // Force to Critical roll
    this.rollData.isCritical = true
    this.rollData.isHeroic = true
    this.rollData.isLegendary = false
    this.rollData.isRealCritical = false
    this.rollData.isSuccess = true
    this.rollData.isFailure = false
    this.rollData.roll = new Roll("12+" + this.rollData.modifiers)
    this.rollData.reroll = false
    this.sendChatMessage()
  }
  
  /* -------------------------------------------- */
  setSuccess(flag) {
    this.rollData.isSuccess = flag
  }

  /* -------------------------------------------- */
  async sendDamageMessage() {
    let actor = game.actors.get( this.rollData.actorId)
    this._buildDamageChatMessage(this.rollData).then(msgFlavor => {
      this.rollData.damageRoll.toMessage({
        user: game.user.id,
        flavor: msgFlavor,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flags: { msgType: "default" }
      })
    });
  }

  /* -------------------------------------------- */
  getDamageAttributeValue(attrDamage) {
    let attrDamageValue = 0
    let actor = game.actors.get( this.rollData.actorId)
    if (attrDamage.includes("vigor")) {
      attrDamageValue = actor.data.data.attributes.vigor.value
      if (attrDamage.includes("half")) {
        attrDamageValue = Math.floor(attrDamageValue / 2)
      }
    }
    return attrDamageValue
  }

  /* -------------------------------------------- */
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
        let weaponFormula = BoLUtility.getDamageFormula(this.rollData.weapon.data.data, this.rollData.fightOption)

        let damageFormula = weaponFormula + "+" + bonusDmg + "+" + attrDamageValue
        console.log("DAMAGE !!!", damageFormula, attrDamageValue, this.rollData)

        //console.log("Formula", weaponFormula, damageFormula, this.rollData.weapon.data.data.properties.damage)
        this.rollData.damageFormula = damageFormula
        this.rollData.damageRoll = new Roll(damageFormula)
        await this.rollData.damageRoll.roll({ "async": false })
        this.rollData.damageTotal = this.rollData.damageRoll.total
      }
      $(`#${this.rollData.optionsId}`).hide() // Hide the options roll buttons
      this.sendDamageMessage()
    }
  }

  /* -------------------------------------------- */
  _buildDamageChatMessage(rollData) {
    const rollMessageTpl = 'systems/bol/templates/chat/rolls/damage-roll-card.hbs';
    return renderTemplate(rollMessageTpl, rollData)
  }

  /* -------------------------------------------- */
  _buildChatMessage(rollData) {
    const rollMessageTpl = 'systems/bol/templates/chat/rolls/default-roll-card.hbs';
    return renderTemplate(rollMessageTpl, rollData);
  }

}
