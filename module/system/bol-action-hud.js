/* -------------------------------------------- */
import { BoLRoll } from "../controllers/bol-rolls.js";

/* -------------------------------------------- */
export class BoLTokenHud {

  static init() {
    // Integration du TokenHUD
    Hooks.on('renderTokenHUD', (app, html, data) => { BoLTokenHud.addTokenHudExtensions(app, html, data._id) });
  }

  /* -------------------------------------------- */
  static async removeExtensionHud(app, html, tokenId) {
    html.find('.control-icon.bol-roll').remove()
    html.find('.control-icon.bol-action').remove()
  }

  /* -------------------------------------------- */
  static async addExtensionHud(app, html, tokenId) {

    let token = canvas.tokens.get(tokenId)
    let actor = token.actor
    app.hasExtension = true

    const hudData = { actor: actor, actionsList: actor.buildListeActions(), rollsList: actor.buildRollList() }

    const controlIconActions = html.find('.control-icon[data-action=combat]');
    // initiative
    await BoLTokenHud._configureSubMenu(controlIconActions, 'systems/bol/templates/token/hud-actor-actions.hbs', hudData,
      (event) => {
        let actionIndex = Number(event.currentTarget.attributes['data-action-index'].value)
        let action = hudData.actionsList[actionIndex]
        const weapon = actor.items.get( action._id )
        BoLRoll.weaponCheckWithWeapon(hudData.actor, weapon)
        //console.log("Clicked", action)
      } )

    const controlIconTarget = html.find('.control-icon[data-action=target]');
    // att+apt+career
    await BoLTokenHud._configureSubMenu(controlIconTarget, 'systems/bol/templates/token/hud-actor-rolls.hbs', hudData,
      (event) => {
        let rollIndex = Number(event.currentTarget.attributes['data-roll-index'].value)
        let roll = hudData.rollsList[rollIndex]
        if ( roll.type == "aptitude") {
          BoLRoll.aptitudeCheck(actor, roll.key ) 
        } else if ( roll.type == "attribute") {
          BoLRoll.attributeCheck(actor, roll.key ) 
        }
      })
  }

  /* -------------------------------------------- */
  static async addTokenHudExtensions(app, html, tokenId) {
    const controlIconCombat  = html.find('.control-icon[data-action=combat]')
    if (controlIconCombat.length>0 ) {
      BoLTokenHud.addExtensionHud(app, html, tokenId);
    }
  }

  /* -------------------------------------------- */
  static async _configureSubMenu(insertionPoint, template, hudData, onMenuItem) {
    const hud = $(await renderTemplate(template, hudData))
    const list = hud.find('div.bol-hud-list')
    
    BoLTokenHud._toggleHudListActive(hud, list);
    
    hud.find('img.bol-hud-togglebutton').click(event => BoLTokenHud._toggleHudListActive(hud, list));
    list.find('.bol-hud-menu').click(onMenuItem);

    insertionPoint.after(hud);
  }

  /* -------------------------------------------- */
  static _showControlWhen(control, condition) {
    if (condition) {
      control.show()
    }
    else {
      control.hide()
    }
  }

  /* -------------------------------------------- */
  static _toggleHudListActive(hud, list) {
    hud.toggleClass('active')
    BoLTokenHud._showControlWhen(list, hud.hasClass('active'))
  }
}