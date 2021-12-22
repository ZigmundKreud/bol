import {BoLRoll} from "../controllers/bol-rolls.js";

export class Macros {
    /**
     * @name getSpeakersActor
     * @description
     * 
     * @returns 
     */
    static getSpeakersActor = function(){
        // Vérifie qu'un seul token est sélectionné
        const tokens = canvas.tokens.controlled;
        if (tokens.length > 1) {
            ui.notifications.warn(game.i18n.localize('BOL.notification.MacroMultipleTokensSelected'));
            return null;
        }
        
        const speaker = ChatMessage.getSpeaker();
        let actor;
        // Si un token est sélectionné, le prendre comme acteur cible
        if (speaker.token) actor = game.actors.tokens[speaker.token];
        // Sinon prendre l'acteur par défaut pour l'utilisateur courrant
        if (!actor) actor = game.actors.get(speaker.actor);
        return actor;
    }

    static rollMacro = async function (rollType, key, adv, mod){
        const actor = this.getSpeakersActor();
        // Several tokens selected
        if (actor === null) return;
        // No token selected
        if (actor === undefined) return ui.notifications.error(game.i18n.localize("BOL.notification.MacroNoTokenSelected"));

        const actorData = {};
        actorData.data = {
            features : actor.buildFeatures()
        };

        if(rollType === "attribute") {
            let attribute = eval(`actor.data.data.attributes.${key}`);
            let rollLabel = (attribute.label) ? game.i18n.localize(attribute.label) : null;
            let description = actor.name + " - " + game.i18n.localize('BOL.ui.attributeCheck') + " - " + game.i18n.localize(attribute.label) ;
            BoLRoll.attributeRollDialog(actor, actorData, attribute, rollLabel, description, adv, mod);
        }
        else if(rollType === "aptitude") {
            let aptitude = eval(`actor.data.data.aptitudes.${key}`);
            let rollLabel = (aptitude.label) ? game.i18n.localize(aptitude.label) : null;
            let description = actor.name + " - " + game.i18n.localize('BOL.ui.aptitudeCheck') + " - " + game.i18n.localize(aptitude.label) ;
            BoLRoll.aptitudeRollDialog(actor, actorData, aptitude, rollLabel, description, adv, mod);
        }
    }
}
