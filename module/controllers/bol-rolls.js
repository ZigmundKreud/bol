import { BoLUtility } from "../system/bol-utility.js";

export class BoLRoll {
    static options() {
        return { classes: ["bol", "dialog"] };
    }

    static attributeCheck(actor, actorData, dataset, event) {
        // const elt = $(event.currentTarget)[0];
        // let key = elt.attributes["data-rolling"].value;
        const key = dataset.key;
        const adv = dataset.adv;
        let attribute = eval(`actor.data.data.attributes.${key}`);
        let label = (attribute.label) ? game.i18n.localize(attribute.label) : null;
        let description = actor.name + " - " + game.i18n.localize('BOL.ui.attributeCheck') + " - " + game.i18n.localize(attribute.label) ;
        return this.attributeRollDialog(actor, actorData, attribute, label, description, adv, 0);
    }

    static aptitudeCheck(actor, actorData, dataset, event) {
        // const elt = $(event.currentTarget)[0];
        // let key = elt.attributes["data-rolling"].value;
        const key = dataset.key;
        const adv = dataset.adv;
        let aptitude = eval(`actor.data.data.aptitudes.${key}`);
        let label = (aptitude.label) ? game.i18n.localize(aptitude.label) : null;
        let description = actor.name + " - " + game.i18n.localize('BOL.ui.aptitudeCheck') + " - " + game.i18n.localize(aptitude.label) ;
        return this.aptitudeRollDialog(actor, actorData, aptitude, label, description, adv, 0);
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
      let attackDef= {
        id:randomID(16),
        attacker: actor,
        attackerData: actorData,
        weapon :weapon,
        mod: 0,
        target : target,
        defender: (target) ? game.actors.get(target.data.actorId) : undefined,
        adv :dataset.adv || 0,
        attribute : eval(`actor.data.data.attributes.${weaponData.properties.attackAttribute}`),
        aptitude : eval(`actor.data.data.aptitudes.${weaponData.properties.attackAptitude}`),
        label : (weapon.name) ? weapon.name : game.i18n.localize('BOL.ui.noWeaponName'),
        description : actor.name + " - " + game.i18n.localize('BOL.ui.weaponAttack'),
      }
      console.log("WEAPON!", attackDef, weaponData);
      return this.weaponRollDialog(attackDef);
  }

    /* -------------------------------------------- */
    /* ROLL DIALOGS                                 */
    /* -------------------------------------------- */
    static async attributeRollDialog(actor, actorData, attribute, label, description, adv, mod, onEnter = "submit") {
        const rollOptionTpl = 'systems/bol/templates/dialogs/attribute-roll-dialog.hbs';
        const dialogData = {
            adv:adv,
            mod: mod,
            attr:attribute,
            careers:actorData.features.careers,
            boons:actorData.features.boons,
            flaws:actorData.features.flaws
        };
        
        const rollOptionContent = await renderTemplate(rollOptionTpl, dialogData);
        let d = new Dialog({
            title: label,
            content: rollOptionContent,
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
                        const attr = html.find('#attr').val();
                        const adv = html.find('#adv').val();
                        const mod = html.find('#mod').val();
                        let careers = html.find('#career').val();
                        const career = (careers.length == 0) ? 0 : Math.max(...careers.map(i => parseInt(i)));
                        const isMalus = adv < 0;
                        const dicePool = (isMalus) ? 2 - parseInt(adv) : 2 + parseInt(adv);
                        const attrValue = eval(`actor.data.data.attributes.${attr}.value`);
                        const modifiers = parseInt(attrValue) + parseInt(mod) + parseInt(career);
                        const formula = (isMalus) ? dicePool + "d6kl2 + " + modifiers : dicePool + "d6kh2 + " + modifiers;
                        let r = new BoLDefaultRoll(label, formula, description);
                        r.roll(actor);
                    }
                }
            },
            default: onEnter,
            close: () => {}
        }, this.options());
        return d.render(true);
    }

    static async weaponRollDialog( attackDef) {
      const rollOptionTpl = 'systems/bol/templates/dialogs/weapon-roll-dialog.hbs';
      const dialogData = {
          attr:attackDef.attribute,
          adv:attackDef.adv,
          mod: attackDef.mod,
          apt:attackDef.aptitude,
          weapon: attackDef.weapon,
          attackId: attackDef.id,
          careers: attackDef.attackerData.features.careers,
          boons: attackDef.attackerData.features.boons,
          flaws: attackDef.attackerData.features.flaws,
      };
      if ( attackDef.defender) {
        dialogData.defence = attackDef.defender.defenseValue,
        dialogData.shieldBlock = 'none'
        let shields = attackDef.defender.shields
        for( let shield of shields) {
          dialogData.shieldBlock = (shield.data.properties.blocking.blockingAll) ? 'blockall' : 'blockone';
          dialogData.shieldAttackMalus = (shield.data.properties.blocking.malus)? shield.data.properties.blocking.malus : 1;
          dialogData.applyShieldMalus = false
        }
      }
      const rollOptionContent = await renderTemplate(rollOptionTpl, dialogData);
      let d = new Dialog({
          title: attackDef.label,
          content: rollOptionContent,
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
                      const attr =  html.find('#attr').val();
                      const apt = html.find('#apt').val();
                      const adv = html.find('#adv').val();
                      const mod = html.find('#mod').val() || 0;

                      let shieldMalus = 0;
                      const applyShieldMalus = html.find('#applyShieldMalus').val() || false;
                      if (applyShieldMalus || dialogData.shieldBlock =='blockall') {
                        shieldMalus = dialogData.shieldAttackMalus;
                      }

                      let careers = html.find('#career').val();
                      const career = (careers.length == 0) ? 0 : Math.max(...careers.map(i => parseInt(i)));
                      const isMalus = adv < 0;
                      const dicePool = (isMalus) ? 2 - parseInt(adv) : 2 + parseInt(adv);
                      const attrValue = eval(`attackDef.attacker.data.data.attributes.${attr}.value`);
                      const aptValue = eval(`attackDef.attacker.data.data.aptitudes.${apt}.value`);
                      const modifiers = parseInt(attrValue) + parseInt(aptValue) + parseInt(mod) + parseInt(career) - dialogData.defence - shieldMalus;
                      const formula = (isMalus) ? dicePool + "d6kl2 + " + modifiers : dicePool + "d6kh2 + " + modifiers;
                      attackDef.formula = formula;
                      let r = new BoLAttackRoll(attackDef);
                      r.roll();
                  }
              }
          },
          default: 'submit',
          close: () => {}
      }, this.options());
      return d.render(true);
    }

    static async aptitudeRollDialog(actor, actorData, aptitude, label, description, adv, mod, onEnter = "submit") {
        const rollOptionTpl = 'systems/bol/templates/dialogs/aptitude-roll-dialog.hbs';
        const dialogData = {
            adv:adv,
            mod: mod,
            apt:aptitude,
            careers:actorData.features.careers,
            boons:actorData.features.boons,
            flaws:actorData.features.flaws
        };
        const rollOptionContent = await renderTemplate(rollOptionTpl, dialogData);
        let d = new Dialog({
            title: label,
            content: rollOptionContent,
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
                        const apt = html.find('#apt').val();
                        const adv = html.find('#adv').val();
                        const mod = html.find('#mod').val();
                        let careers = html.find('#career').val();
                        const career = (careers.length == 0) ? 0 : Math.max(...careers.map(i => parseInt(i)));
                        const isMalus = adv < 0;
                        const dicePool = (isMalus) ? 2 - parseInt(adv) : 2 + parseInt(adv);
                        const aptValue = eval(`actor.data.data.aptitudes.${apt}.value`);
                        const modifiers = parseInt(aptValue) + parseInt(mod) + parseInt(career);
                        const formula = (isMalus) ? dicePool + "d6kl2 + " + modifiers : dicePool + "d6kh2 + " + modifiers;
                        let r = new BoLDefaultRoll(label, formula, description);
                        r.roll(actor);
                    }
                }
            },
            default: onEnter,
            close: () => {}
        }, this.options());
        return d.render(true);
    }
}

export class BoLDefaultRoll {
    constructor(label, formula, description, isWeapon=false){
        this._label = label;
        this._formula = formula;
        this._isSuccess = false;
        this._isCritical = false;
        this._isFumble = false;
        this._isWeapon = isWeapon;
        this._description = description;
    }

    async roll(actor){
        const r = new Roll(this._formula);
        await r.roll({"async": true});
        const activeDice = r.terms[0].results.filter(r => r.active);
        const diceTotal = activeDice.map(r => r.result).reduce((a, b) => a + b);
        this._isSuccess = (r.total >= 9);
        this._isCritical = (diceTotal === 12);
        this._isFumble = (diceTotal === 2);
        this._buildChatMessage(actor).then(msgFlavor => {
            r.toMessage({
                user: game.user.id,
                flavor: msgFlavor,
                speaker: ChatMessage.getSpeaker({actor: actor}),
                flags : {msgType : "default"}
            });
        });
        if (this._isSuccess && this._isWeapon) {

        }
    }

    _buildChatMessage(actor) {
        const rollMessageTpl = 'systems/bol/templates/chat/rolls/default-roll-card.hbs';
        const tplData = {
            actor : actor,
            label : this._label,
            isSuccess : this._isSuccess,
            isFailure : !this._isSuccess,
            isCritical : this._isCritical,
            isFumble : this._isFumble,
            hasDescription : this._description && this._description.length > 0,
            description : this._description
        };
        return renderTemplate(rollMessageTpl, tplData);
    }

}

export class BoLAttackRoll {
  constructor(attackDef){
      this.attackDef = attackDef;
      this._isSuccess = false;
      this._isCritical = false;
      this._isFumble = false;
}

  async roll(){
      const r = new Roll(this.attackDef.formula);
      await r.roll({"async": false});
      const activeDice = r.terms[0].results.filter(r => r.active);
      const diceTotal = activeDice.map(r => r.result).reduce((a, b) => a + b);
      this._isSuccess = (r.total >= 9);
      this._isCritical = (diceTotal === 12);
      this._isFumble = (diceTotal === 2);
      this._buildChatMessage(this.attackDef.attacker).then(msgFlavor => {
          r.toMessage({
              user: game.user.id,
              flavor: msgFlavor,
              speaker: ChatMessage.getSpeaker({actor: this.attackDef.attacker}),
              flags : {msgType : "default"}
          });
      });

      if (this._isSuccess ) {        
        let attrDamage = this.attackDef.weapon.data.data.properties.damageAttribute;
        let weaponFormula = BoLUtility.getDamageFormula(this.attackDef.weapon.data.data.properties.damage)
        let damageFormula = weaponFormula + "+" + this.attackDef.attacker.data.data.attributes[attrDamage].value;
        this.damageRoll = new Roll(damageFormula);
        await this.damageRoll.roll({"async": false});
        // Update attackDef object
        this.attackDef.damageFormula = damageFormula;
        this.attackDef.damageRoll = this.damageRoll;

        this._buildDamageChatMessage(this.attackDef.attacker, this.attackDef.weapon, this.damageRoll.total).then(msgFlavor => {
          this.damageRoll.toMessage({
              user: game.user.id,
              flavor: msgFlavor,
              speaker: ChatMessage.getSpeaker({actor: this.attackDef.attacker}),
              flags : {msgType : "default"}
          }).then( result => {           
            if (this.attackDef.target) { 
              // Broadcast to GM or process it directly in case of GM defense
              if ( !game.user.isGM) {
                game.socket.emit("system.bol", { msg: "msg_attack_success", data: this.attackDef });
              } else {
                BoLUtility.processAttackSuccess(  this.attackDef);
              }
            }
          });
      });
      }
    }

  _buildDamageChatMessage(actor, weapon, total) {
    const rollMessageTpl = 'systems/bol/templates/chat/rolls/damage-roll-card.hbs';
    const tplData = {
        actor : actor,
        label : this._label,
        weapon: weapon,
        damage: total,
    };
    return renderTemplate(rollMessageTpl, tplData);
}

  _buildChatMessage(actor) {
      const rollMessageTpl = 'systems/bol/templates/chat/rolls/default-roll-card.hbs';
      const tplData = {
          actor : actor,
          label : this._label,
          isSuccess : this._isSuccess,
          isFailure : !this._isSuccess,
          isCritical : this._isCritical,
          isFumble : this._isFumble,
          hasDescription : this._description && this._description.length > 0,
          description : this._description
      };
      return renderTemplate(rollMessageTpl, tplData);
  }

}
// export class BoLWeaponRoll {
//     constructor(actor, label, formula, isCritical, description){
//         this._label = label;
//         this._formula = formula;
//         this._isCritical = isCritical;
//         this._description = description;
//     }
//
//     _buildChatMessage() {
//         const rollMessageTpl = 'systems/bol/templates/chat/rolls/weapon-roll-card.hbs';
//         const tplData = {
//             label : this._label,
//             isCritical : this._isCritical,
//             hasDescription : this._description && this._description.length > 0,
//             description : this._description
//         };
//         return renderTemplate(rollMessageTpl, tplData);
//     }
// }

// export class BoLSpellRoll {
//     constructor(actor, label, formula, isCritical, description){
//         this._label = label;
//         this._formula = formula;
//         this._isCritical = isCritical;
//         this._description = description;
//     }
//
//     _buildChatMessage() {
//         const rollMessageTpl = 'systems/bol/templates/chat/rolls/spell-roll-card.hbs';
//         const tplData = {
//             label : this._label,
//             isCritical : this._isCritical,
//             hasDescription : this._description && this._description.length > 0,
//             description : this._description
//         };
//         return renderTemplate(rollMessageTpl, tplData);
//     }
// }
