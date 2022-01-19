import { BoLUtility } from "../system/bol-utility.js";

const __adv2dice = { ["1B"]: 3, ["2B"]: 4, ["2"]: 2, ["1M"]: 3, ["2M"]: 4 }
const _apt2attr = { init: "mind", melee: "agility", ranged: "agility", def: "vigor" }

export class BoLRoll {
  static options() {
    return { classes: ["bol", "dialog"] };
  }

  static convertToAdv(adv) {
    if (adv == 0) return "2"
    return Math.abs(adv) + (adv < 0) ? 'M' : 'B';
  }
  static getDefaultAttribute(key) {
    return _apt2attr[key]
  }
  static attributeCheck(actor, actorData, dataset, event) {
    // const elt = $(event.currentTarget)[0];
    // let key = elt.attributes["data-rolling"].value;
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
        label: label,
        description: description,
        adv: this.convertToAdv(adv),
        mod: 0
      });
  }

  static aptitudeCheck(actor, actorData, dataset, event) {
    // const elt = $(event.currentTarget)[0];
    // let key = elt.attributes["data-rolling"].value;
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
        label: label,
        description: description,
        adv: this.convertToAdv(adv),
        mod: 0
      });
  }

  static weaponCheck(actor, actorData, dataset, event) {
    // const elt = $(event.currentTarget)[0];
    // let key = elt.attributes["data-rolling"].value;
    let target = BoLUtility.getTarget()
    const li = $(event.currentTarget).parents(".item");
    const weapon = actor.items.get(li.data("item-id"));
    if (!weapon) {
      ui.notifications.warn("Unable to find weapon !");
      return;
    }
    let weaponData = weapon.data.data;
    let attackDef = {
      mode: "weapon",
      actor: actor,
      actorData: actorData,
      weapon: weapon,
      target: target,
      defender: (target) ? game.actors.get(target.data.actorId) : undefined,
      attribute: eval(`actor.data.data.attributes.${weaponData.properties.attackAttribute}`),
      aptitude: eval(`actor.data.data.aptitudes.${weaponData.properties.attackAptitude}`),
      label: (weapon.name) ? weapon.name : game.i18n.localize('BOL.ui.noWeaponName'),
      description: actor.name + " - " + game.i18n.localize('BOL.ui.weaponAttack'),
      adv: "2",

    }
    console.debug("WEAPON!", attackDef, weaponData);
    return this.displayRollDialog(attackDef);
  }

  /* -------------------------------------------- */
  /* ROLL DIALOGS                                 */
  /* -------------------------------------------- */
  static async displayRollDialog(rollData, onEnter = "submit") {

    const rollOptionTpl = `systems/bol/templates/dialogs/${rollData.mode}-roll-dialog.hbs`
    rollData.careers = rollData.actorData.features.careers
    rollData.boons = rollData.actorData.features.boons
    rollData.flaws = rollData.actorData.features.flaws
    rollData.defence = 0
    rollData.mod = 0
    rollData.id = randomID(16)

    // Weapon mode specific management
    rollData.weaponModifier = 0
    rollData.attackBonusDice = false
    if (rollData.mode == "weapon") {
      //console.log("WEAPON", rollData.weapon)
      rollData.weaponModifier = rollData.weapon.data.data.properties.attackModifiers?? 0;
      rollData.attackBonusDice = rollData.weapon.data.data.properties.attackBonusDice
      if (rollData.defender) { // If target is selected
        rollData.defence = rollData.defender.defenseValue,
          rollData.shieldBlock = 'none'
        let shields = rollData.defender.shields
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
            rollData.attrKey = html.find('#attr').val();
            rollData.aptKey = html.find('#apt').val();
            rollData.adv = $("input[name='adv']:checked").val() || "2";
            //rollData.adv = html.find('#adv').val() || 0;
            rollData.mod = html.find('#mod').val() || 0;
            let careers = html.find('#career').val();
            rollData.career = (!careers || careers.length == 0) ? 0 : Math.max(...careers.map(i => parseInt(i)));
            rollData.registerInit = (rollData.aptKey == 'init') ? $('#register-init').is(":checked") : false;

            let shieldMalus = 0;
            if (rollData.mode == "weapon") {
              const applyShieldMalus = html.find('#applyShieldMalus').val() || false;
              if (applyShieldMalus || rollData.shieldBlock == 'blockall') {
                shieldMalus = rollData.shieldAttackMalus;
              }
            }

            const isMalus = rollData.adv.includes('M');
            let dicePool = __adv2dice[rollData.adv]
            dicePool += (rollData.attackBonusDice) ? 1 : 0
            //// const dicePool = (isMalus) ? 2 - parseInt(rollData.adv) : 2 + parseInt(rollData.adv);
            const attrValue = (rollData.attrKey) && eval(`rollData.actor.data.data.attributes.${rollData.attrKey}.value`) || 0;
            const aptValue = (rollData.aptKey) && eval(`rollData.actor.data.data.aptitudes.${rollData.aptKey}.value`) || 0

            const modifiers = rollData.weaponModifier + parseInt(attrValue) + parseInt(aptValue) + parseInt(rollData.mod) + parseInt(rollData.career) - rollData.defence - shieldMalus;
            const formula = (isMalus) ? dicePool + "d6kl2 + " + modifiers : dicePool + "d6kh2 + " + modifiers;
            rollData.formula = formula;
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
    if ( this.rollData.isSuccess == undefined ) { // First init
      this.rollData.isSuccess = false;
      this.rollData.isCritical = false;
      this.rollData.isFumble = false;
    }
    if ( this.rollData.optionsId) {
      $(`#${this.rollData.optionsId}`).hide() // Hide the options roll buttons
    }      
    if ( this.rollData.applyId) {
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

    console.log("ROLL", this.rollData)
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
  
  async rollDamage() {
    if (this.rollData.mode != "weapon") { // Only specific process in Weapon mode
      return;
    }

    if (this.rollData.isSuccess) {
      if ( !this.rollData.damageRoll) {
        let bonusDmg = 0
        if ( this.rollData.damageMode == 'damage-plus-6') {
          bonusDmg = 6
        }
        if ( this.rollData.damageMode == 'damage-plus-12') {
          bonusDmg = 12
        }
        console.log("DAMAGE !!!")
        let attrDamage = this.rollData.weapon.data.data.properties.damageAttribute;
        let weaponFormula = BoLUtility.getDamageFormula(this.rollData.weapon.data.data.properties.damage,
          this.rollData.weapon.data.data.properties.damageModifiers,
          this.rollData.weapon.data.data.properties.damageMultiplier)
        let damageFormula = weaponFormula + "+" + bonusDmg + ((attrDamage) ? "+" + this.rollData.actor.data.data.attributes[attrDamage].value : "+0");

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
