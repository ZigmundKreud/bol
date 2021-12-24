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
        console.log(dialogData.careers);
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
                        const career = (!careers) ? 0 : Math.max(...careers.map(i => parseInt(i)));
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
                        const career = (!careers) ? 0 : Math.max(...careers.map(i => parseInt(i)));
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
    constructor(label, formula, description){
        this._label = label;
        this._formula = formula;
        this._isSuccess = false;
        this._isCritical = false;
        this._isFumble = false;
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
