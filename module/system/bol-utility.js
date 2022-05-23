import { BoLDefaultRoll } from "../controllers/bol-rolls.js";

// Spell circle to min PP cost
const __circle2minpp = { 0: 0, 1: 2, 2: 6, 3: 11 }

export class BoLUtility {


  /* -------------------------------------------- */
  static init() {
    this.attackStore = {}

    game.settings.register("bol", "rollArmor", {
      name: "Effectuer des jets pour les armures",
      hint: "Effectue un jet de dés pour les armures (valeur fixe si désactivé)",
      scope: "world",
      config: true,
      default: true,
      type: Boolean,
      onChange: lang => window.location.reload()
    });
    game.settings.register("bol", "useBougette", {
      name: "Utiliser la Bougette (règle fan-made)",
      hint: "Utilise un indicateur de Bougette, comme décrit dans l'aide de jeu Gold&Glory du RatierBretonnien (https://www.lahiette.com/leratierbretonnien/)",
      scope: "world",
      config: true,
      default: false,
      type: Boolean,
      onChange: lang => window.location.reload()
    });

    this.rollArmor = game.settings.get("bol", "rollArmor") // Roll armor or not
    this.useBougette = game.settings.get("bol", "useBougette") // Use optionnal bougette rules

  }


  /* -------------------------------------------- */
  static getRollArmor() {
    return this.rollArmor
  }
  /* -------------------------------------------- */
  static getUseBougette() {
    return this.useBougette
  }

  /* -------------------------------------------- */
  static async ready() {
  }

  /* -------------------------------------------- */
  static templateData(it) {
    return BoLUtility.data(it)?.data ?? {}
  }

  /* -------------------------------------------- */
  static data(it) {
    if (it instanceof Actor || it instanceof Item || it instanceof Combatant) {
      return it.data;
    }
    return it;
  }

  /* -------------------------------------------- */
  static storeRoll(roll) {
    this.lastRoll = roll
  }

  /* -------------------------------------------- */
  static getLastRoll() {
    return this.lastRoll
  }

  /* -------------------------------------------- */
  static createDirectOptionList(min, max) {
    let options = {};
    for (let i = min; i <= max; i++) {
      options[`${i}`] = `${i}`;
    }
    return options;
  }

  /* -------------------------------------------- */
  static buildListOptions(min, max) {
    let options = [];
    for (let i = min; i <= max; i++) {
      options.push(`<option value="${i}">${i}</option>`);
    }
    return options.join("");
  }

  /* -------------------------------------------- */
  static async showDiceSoNice(roll, rollMode) {
    if (game.modules.get("dice-so-nice")?.active) {
      if (game.dice3d) {
        let whisper = null;
        let blind = false;
        rollMode = rollMode ?? game.settings.get("core", "rollMode");
        switch (rollMode) {
          case "blindroll": //GM only
            blind = true;
          case "gmroll": //GM + rolling player
            whisper = this.getUsers(user => user.isGM);
            break;
          case "roll": //everybody
            whisper = this.getUsers(user => user.active);
            break;
          case "selfroll":
            whisper = [game.user.id];
            break;
        }
        await game.dice3d.showForRoll(roll, game.user, true, whisper, blind);
      }
    }
  }
  /* -------------------------------------------- */
  static getUsers(filter) {
    return game.users.filter(filter).map(user => user.data._id);
  }
  /* -------------------------------------------- */
  static getWhisperRecipients(rollMode, name) {
    switch (rollMode) {
      case "blindroll": return this.getUsers(user => user.isGM);
      case "gmroll": return this.getWhisperRecipientsAndGMs(name);
      case "selfroll": return [game.user.id];
    }
    return undefined;
  }
  /* -------------------------------------------- */
  static getOtherWhisperRecipients( name) {
    let users = []
    for( let user of game.users) {
      if ( !user.isGM && user.name != name) {
        users.push( user.data._id)
      }
    }
    return users
  }
    
  /* -------------------------------------------- */
  static getWhisperRecipientsAndGMs(name) {
    let recep1 = ChatMessage.getWhisperRecipients(name) || [];
    return recep1.concat(ChatMessage.getWhisperRecipients('GM'));
  }

  /* -------------------------------------------- */
  static blindMessageToGM(chatOptions) {
    let chatGM = duplicate(chatOptions);
    chatGM.whisper = this.getUsers(user => user.isGM);
    chatGM.content = "Blind message of " + game.user.name + "<br>" + chatOptions.content;
    console.log("blindMessageToGM", chatGM);
    game.socket.emit("system.bol", { name: "msg_gm_chat_message", data: chatGM });
  }

  /* -------------------------------------------- */
  static sendAttackSuccess(attackDef) {
    if (attackDef.targetId) {
      // Broadcast to GM or process it directly in case of GM defense
      if (!game.user.isGM) {
        game.socket.emit("system.bol", { name: "msg_attack_success", data: duplicate(attackDef) })
      } else {
        BoLUtility.processAttackSuccess(attackDef)
      }
    }
  }

  /* -------------------------------------------- */
  static async chatMessageHandler(message, html, data) {
    const chatCard = html.find('.flavor-text')
    if (chatCard.length > 0) {
      // If the user is the message author or the actor owner, proceed
      const actor = game.actors.get(data.message.speaker.actor)
      //console.log("FOUND 1!!! ", actor)
      if (actor && actor.isOwner) return
      else if (game.user.isGM || data.author.id === game.user.id) return
  
      const divButtons = chatCard.find('.actions-section')
      console.log("FOUND 2!! ", divButtons)
      divButtons.hide()
    }
  }
  
  /* -------------------------------------------- */
  static async chatListeners(html) {
    
    // Damage handling
    html.on("click", '.chat-damage-apply', event => {
      let rollData = BoLUtility.getLastRoll()
      $(`#${rollData.applyId}`).hide()
      BoLUtility.sendAttackSuccess(rollData)
    });

    html.on("click", '.chat-damage-roll', event => {
      event.preventDefault();
      let rollData = BoLUtility.getLastRoll()
      rollData.damageMode = event.currentTarget.attributes['data-damage-mode'].value;
      let bolRoll = new BoLDefaultRoll(rollData)
      bolRoll.rollDamage()
    });

    html.on("click", '.transform-legendary-roll', event => {
      event.preventDefault();
      let rollData = BoLUtility.getLastRoll()
      let actor = game.actors.get( rollData.actorId)
      actor.subHeroPoints(1)
      let r = new BoLDefaultRoll(rollData)
      r.upgradeToLegendary()
    })

    html.on("click", '.transform-heroic-roll', event => {
      event.preventDefault();
      let rollData = BoLUtility.getLastRoll()
      let actor = game.actors.get( rollData.actorId)
      actor.subHeroPoints(1)
      let r = new BoLDefaultRoll(rollData)
      r.upgradeToHeroic()
    })

    html.on("click", '.hero-reroll', event => {
      event.preventDefault();
      let rollData = BoLUtility.getLastRoll()
      let actor = game.actors.get( rollData.actorId)
      actor.subHeroPoints(1)
      rollData.reroll = false // Disable reroll option for second roll
      let r = new BoLDefaultRoll(rollData)
      r.roll();
    });

    html.on("click", '.damage-handling', event => {
      event.preventDefault()
      let attackId = event.currentTarget.attributes['data-attack-id'].value
      let defenseMode = event.currentTarget.attributes['data-defense-mode'].value
      let weaponId = (event.currentTarget.attributes['data-weapon-id']) ? event.currentTarget.attributes['data-weapon-id'].value : -1
      if (game.user.isGM) {
        console.log("Process handling !!! -> GM direct damage handling")
        BoLUtility.processDamageHandling(event, attackId, defenseMode, weaponId)
      } else {
        console.log("Process handling !!! -> socket emit")
        game.socket.emit("system.bol", { name: "msg_damage_handling", data: { event: event, attackId: attackId, defenseMode: defenseMode, weaponId: weaponId } });
      }
    });
  }

  /* -------------------------------------------- */
  static async processDamageHandling(event, attackId, defenseMode, weaponId = -1) {
    if (!game.user.isGM) {
      return;
    }
    BoLUtility.removeChatMessageId(BoLUtility.findChatMessageId(event.currentTarget));

    console.log("Damage Handling", event, attackId, defenseMode, weaponId)
    // Only GM process this 
    let attackDef = this.attackStore[attackId]
    if (attackDef && attackDef.defenderId) {
      if (attackDef.defenseDone) {
        return
      } // ?? Why ???
      attackDef.defenseDone = true
      attackDef.defenseMode = defenseMode
      let token = game.scenes.current.tokens.get(attackDef.targetId)
      let defender = token.actor

      if (defenseMode == 'damage-with-armor') {
        let armorFormula = defender.getArmorFormula()
        attackDef.rollArmor = new Roll(armorFormula)
        attackDef.rollArmor.roll( { async: false } )
        console.log("Armor roll ", attackDef.rollArmor)
        attackDef.armorProtect = (attackDef.rollArmor.total < 0) ? 0 : attackDef.rollArmor.total;
        attackDef.finalDamage = attackDef.damageRoll.total - attackDef.armorProtect;
        attackDef.finalDamage = (attackDef.finalDamage < 0) ? 0 : attackDef.finalDamage;
        defender.sufferDamage(attackDef.finalDamage);
      }
      if (defenseMode == 'damage-without-armor') {
        attackDef.finalDamage = attackDef.damageRoll.total;
        defender.sufferDamage(attackDef.finalDamage);
      }
      if (defenseMode == 'hero-reduce-damage') {
        let armorFormula = defender.getArmorFormula()
        attackDef.rollArmor = new Roll(armorFormula)
        attackDef.rollArmor.roll({ async: false })
        attackDef.armorProtect = (attackDef.rollArmor.total < 0) ? 0 : attackDef.rollArmor.total
        attackDef.rollHero = new Roll("1d6")
        attackDef.rollHero.roll({ async: false })
        attackDef.finalDamage = attackDef.damageRoll.total - attackDef.rollHero.total - attackDef.armorProtect
        attackDef.finalDamage = (attackDef.finalDamage < 0) ? 0 : attackDef.finalDamage
        defender.sufferDamage(attackDef.finalDamage)
        defender.subHeroPoints(1)
      }
      if (defenseMode == 'hero-in-extremis') {
        attackDef.finalDamage = 0;
        attackDef.weaponHero = defender.weapons.find(item => item._id == weaponId);
        defender.deleteEmbeddedDocuments("Item", [weaponId]);
      }
      ChatMessage.create({
        alias: defender.name,
        whisper: BoLUtility.getWhisperRecipientsAndGMs(defender.name),
        content: await renderTemplate('systems/bol/templates/chat/rolls/defense-result-card.hbs', {
          attackId: attackDef.id,
          attacker: attackDef.attacker,
          rollArmor: attackDef.rollArmor,
          rollHero: attackDef.rollHero,
          weaponHero: attackDef.weaponHero,
          armorProtect: attackDef.armorProtect,
          name: defender.name,
          defender: defender,
          defenseMode: attackDef.defenseMode,
          finalDamage: attackDef.finalDamage
        })
      })
    }
  }

  /* -------------------------------------------- */
  static createChatMessage(name, rollMode, chatOptions) {
    switch (rollMode) {
      case "blindroll": // GM only
        if (!game.user.isGM) {
          this.blindMessageToGM(chatOptions);

          chatOptions.whisper = [game.user.id];
          chatOptions.content = "Message only to the GM";
        }
        else {
          chatOptions.whisper = this.getUsers(user => user.isGM);
        }
        break;
      default:
        chatOptions.whisper = this.getWhisperRecipients(rollMode, name);
        break;
    }
    chatOptions.alias = chatOptions.alias || name;
    ChatMessage.create(chatOptions);
  }

  /* -------------------------------------------- */
  static createChatWithRollMode(name, chatOptions) {
    this.createChatMessage(name, game.settings.get("core", "rollMode"), chatOptions);
  }
  /* -------------------------------------------- */
  static isRangedWeapon(weapon) {
    return weapon.data.type == 'ranged' || weapon.data.thrown;
  }

  /* -------------------------------------------- */
  static removeChatMessageId(messageId) {
    if (messageId) {
      game.messages.get(messageId)?.delete();
    }
  }

  static findChatMessageId(current) {
    return BoLUtility.getChatMessageId(BoLUtility.findChatMessage(current));
  }

  static getChatMessageId(node) {
    return node?.attributes.getNamedItem('data-message-id')?.value;
  }

  static findChatMessage(current) {
    return BoLUtility.findNodeMatching(current, it => it.classList.contains('chat-message') && it.attributes.getNamedItem('data-message-id'));
  }

  static findNodeMatching(current, predicate) {
    if (current) {
      if (predicate(current)) {
        return current;
      }
      return BoLUtility.findNodeMatching(current.parentElement, predicate);
    }
    return undefined;
  }

  /* -------------------------------------------- */
  static getTarget() {
    if (game.user.targets && game.user.targets.size == 1) {
      for (let target of game.user.targets) {
        return target
      }
    }
    return undefined;
  }

  /* -------------------------------------------- */
  static async processAttackSuccess(attackDef) {
    console.log("Attack success processing", attackDef)
    if (!game.user.isGM || !attackDef.defenderId) { // Only GM process this
      return
    }
    // Build and send the defense message to the relevant people (ie GM + defender)
    let defender = game.actors.get(attackDef.defenderId)
    let defenderWeapons = defender.weapons
    console.log("DEF WEP", attackDef)
    this.attackStore[attackDef.id] = attackDef // Store !
    ChatMessage.create({
      alias: defender.name,
      whisper: BoLUtility.getWhisperRecipientsAndGMs(defender.name),
      content: await renderTemplate('systems/bol/templates/chat/rolls/defense-request-card.hbs', {
        attackId: attackDef.id,
        attacker: attackDef.attacker,
        defender: defender,
        defenderWeapons: defenderWeapons,
        damageTotal: attackDef.damageRoll.total,
        damagesIgnoresArmor: attackDef.damagesIgnoresArmor,
      })
    })
  }

  /* -------------------------------------------- */
  static onSocketMessage(sockmsg) {
    if (sockmsg.name == "msg_attack_success") {
      BoLUtility.processAttackSuccess(sockmsg.data)
    }
    if (sockmsg.name == "msg_damage_handling") {
      BoLUtility.processDamageHandling(sockmsg.data.event, sockmsg.data.attackId, sockmsg.data.defenseMode)
    }
  }

  /* -------------------------------------------- */
  static computeSpellCost(spell, nbOptCond = 0) {
    let pp = spell.data.data.properties.ppcost
    let minpp = __circle2minpp[spell.data.data.properties.circle]
    pp = (pp - nbOptCond < minpp) ? minpp : pp - nbOptCond
    return pp
  }

  /* -------------------------------------------- */
  static getDamageFormula(weaponData, fightOption) {
    let upgradeDamage = (fightOption && fightOption.data.properties.fightoptiontype == "twoweaponsatt")
    let damageString = weaponData.properties.damage
    let modifier = weaponData.properties.damageModifiers ?? 0
    let multiplier = weaponData.properties.damageMultiplier ?? 1

    if (damageString[0] == 'd') { damageString = "1" + damageString } // Help parsing
    if (modifier == null) modifier = 0;

    let reroll = (weaponData.properties.damageReroll1) ? "r1" : "" // Reroll 1 option

    let formula = damageString
    if (damageString.includes("d") || damageString.includes("D")) {
      var myReg = new RegExp('(\\d+)[dD]([\\d]+)([MB]*)?([\\+\\d]*)?', 'g')
      let res = myReg.exec(damageString)
      let nbDice = parseInt(res[1])
      let postForm = 'kh' + nbDice
      let modIndex = 3
      // Upgrade damage if needed
      if ( upgradeDamage && ( !res[3] || res[3]=="") ) {
        res[3] = "B"  // Upgrade to bonus
      }
      if (res[3]) {
        if ( upgradeDamage && res[3] == 'M') {
          res[3] = "" // Disable lamlus for upgradeDamage
        }
        if (res[3] == 'M') {
          postForm = 'kl' + nbDice
          nbDice++
          modIndex = 4
        }
        if (res[3] == 'B') {
          postForm = 'kh' + nbDice
          nbDice++
          modIndex = 4
        }
      }
      formula = "(" + nbDice + "d" + res[2] + reroll + postForm + "+" + modifier + ") *" + multiplier
    }
    return formula
  }

  /* -------------------------------------------- */
  static async confirmDelete(actorSheet, li) {
    let itemId = li.data("item-id");
    let msgTxt = "<p>Are you sure to remove this Item ?";
    let buttons = {
      delete: {
        icon: '<i class="fas fa-check"></i>',
        label: "Yes, remove it",
        callback: () => {
          actorSheet.actor.deleteEmbeddedDocuments("Item", [itemId]);
          li.slideUp(200, () => actorSheet.render(false));
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel"
      }
    }
    msgTxt += "</p>";
    let d = new Dialog({
      title: "Confirm removal",
      content: msgTxt,
      buttons: buttons,
      default: "cancel"
    });
    d.render(true);
  }

}
