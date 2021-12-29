
export class BoLUtility {


  /* -------------------------------------------- */
  static async init() {
    this.attackStore = {};
    Hooks.on('renderChatLog', (log, html, data) => BoLUtility.chatListeners(html));
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
    game.socket.emit("system.fvtt-fragged-kingdom", { msg: "msg_gm_chat_message", data: chatGM });
  }

  /* -------------------------------------------- */
  static async chatListeners(html) {
    // Damage handling
    html.on("click", '.damage-handling', event => {      
      let attackId = event.currentTarget.attributes['data-attack-id'].value;
      let defenseMode = event.currentTarget.attributes['data-defense-mode'].value;
      let weaponId = (event.currentTarget.attributes['data-weapon-id']) ? event.currentTarget.attributes['data-weapon-id'].value : -1
      //console.log("DEFENSE1", event.currentTarget, attackId, defenseMode, weaponId);
      if ( game.user.isGM) {
        BoLUtility.processDamageHandling(event, attackId, defenseMode, weaponId)
      } else {
        game.socket.emit("system.bol", { msg: "msg_damage_handling", data: {event: event, attackId: attackId, defenseMode: defenseMode, weaponId: weaponId} });
      }
    });
  }

  /* -------------------------------------------- */
  static async processDamageHandling(event, attackId, defenseMode, weaponId=-1) {
    if ( !game.user.isGM) {
      return;
    }
    BoLUtility.removeChatMessageId(BoLUtility.findChatMessageId(event.currentTarget));

    // Only GM process this 
    let attackDef = this.attackStore[attackId];
    console.log("DEFENSE2", attackId, defenseMode, weaponId, attackDef);
    if (attackDef) {
      attackDef.defenseMode = defenseMode;
      if (defenseMode == 'damage-with-armor') {
        let armorFormula = attackDef.defender.getArmorFormula();
        attackDef.rollArmor = new Roll(armorFormula)
        attackDef.rollArmor.roll( {async: false} );
        attackDef.finalDamage = attackDef.damageRoll.total - attackDef.rollArmor.total;
        attackDef.finalDamage = (attackDef.finalDamage<0) ? 0 : attackDef.finalDamage;
        attackDef.defender.sufferDamage(attackDef.finalDamage);
      }
      if (defenseMode == 'damage-without-armor') {
        attackDef.finalDamage = attackDef.damageRoll.total;
        attackDef.defender.sufferDamage(attackDef.finalDamage);
      }
      if (defenseMode == 'hero-reduce-damage') {
        attackDef.rollHero = new Roll("1d6");
        attackDef.rollHero.roll( {async: false} );
        attackDef.finalDamage = attackDef.damageRoll.total - attackDef.rollHero.total;
        attackDef.finalDamage = (attackDef.finalDamage<0) ? 0 : attackDef.finalDamage;
        attackDef.defender.sufferDamage(attackDef.finalDamage);
        attackDef.defender.subHeroPoints(1);
      }
      if (defenseMode == 'hero-in-extremis') {
        attackDef.finalDamage = 0;
        attackDef.weaponHero = attackDef.defender.weapons.find(item => item._id == weaponId);
        attackDef.defender.deleteEmbeddedDocuments("Item", [ weaponId ]);
      }
      ChatMessage.create({
        alias: attackDef.defender.name,
        whisper: BoLUtility.getWhisperRecipientsAndGMs(attackDef.defender.name),
        content: await renderTemplate('systems/bol/templates/chat/rolls/defense-result-card.hbs', {
          attackId: attackDef.id,
          attacker: attackDef.attacker,
          rollArmor: attackDef.rollArmor,
          rollHero: attackDef.rollHero,
          weaponHero : attackDef.weaponHero,
          defender: attackDef.defender,
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
    if (messageId){
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
        return target;
      }
    }
    return undefined;
  }

  /* -------------------------------------------- */
  static async rollBoL(rollData) {

    // Dice bonus/malus selection
    let nbDice = 2;
    let d6BM = 0;
    let mode = "";
    if (rollData.d6Malus > rollData.d6Bonus) {
      d6BM = rollData.d6Malus - rollData.d6Bonus;
      mode = "kl2";
    }
    if (rollData.d6Bonus > rollData.d6Malus) {
      d6BM = rollData.d6Bonus - rollData.d6Malus;
      mode = "kh2";
    }
    nbDice += d6BM;

    // Final modifier 
    let modifier = Number(rollData.bonusMalus);
    if (rollData.mode == 'career') {
      modifier += Number(rollData.attributes[rollData.rollAttribute].value) + Number(rollData.career.data.rank);
    } else if (rollData.mode == 'attribute') {
      modifier += rollData.attribute.value;
    } else if (rollData.mode == 'weapon') {
      modifier += Number(rollData.attributes[rollData.rollAttribute].value) + Number(rollData.aptitude.value) + Number(rollData.rangeModifier);
      modifier -= rollData.defender.data.aptitudes.def.value;
    }

    let formula = nbDice + "d6" + mode + "+" + modifier;

    console.log("Going to roll ", formula, rollData.attributes, rollData.rollAttribute);
    let myRoll = new Roll(formula).roll({ async: false });
    await this.showDiceSoNice(myRoll, game.settings.get("core", "rollMode"));
    rollData.roll = myRoll;
    rollData.formula = formula;
    rollData.modifier = modifier;
    rollData.nbDice = nbDice;
    rollData.finalScore = myRoll.total;

    let actor = game.actors.get(rollData.actorId);
    actor.saveRollData(rollData);

    this.createChatWithRollMode(rollData.alias, {
      content: await renderTemplate(`systems/bol/templates/chat/chat-generic-result.hbs`, rollData)
    });
  }

  /* -------------------------------------------- */
  static async processAttackSuccess(attackDef) {
    if (!game.user.isGM) { // Only GM process this
      return;
    }
    // Build and send the defense message to the relevant people (ie GM + defender)
    let defenderWeapons = attackDef.defender.weapons;
    console.log("DEF WEP", attackDef)
    this.attackStore[attackDef.id] = attackDef; // Store !
    ChatMessage.create({
      alias: attackDef.defender.name,
      whisper: BoLUtility.getWhisperRecipientsAndGMs(attackDef.defender.name),
      content: await renderTemplate('systems/bol/templates/chat/rolls/defense-request-card.hbs', {
        attackId: attackDef.id,
        attacker: attackDef.attacker,
        defender: attackDef.defender,
        defenderWeapons: defenderWeapons,
        damageTotal: attackDef.damageRoll.total
      })
    });
  }

  /* -------------------------------------------- */
  static onSocketMessage(sockmsg) {
    if (sockmsg.name == "msg_attack_success") {
      BoLUtility.processAttackSuccess(sockmsg.data);
    }
    if (sockmsg.name == "msg_damage_handling") {
      BoLUtility.processDamageHandling(sockmsg.data.event, sockmsg.data.attackId, sockmsg.data.defenseMode)
    }
  }

  /* -------------------------------------------- */
  static getDamageFormula(damageString) {
    if (damageString[0] == 'd') { damageString = "1" + damageString } // Help parsing
    var myReg = new RegExp('(\\d+)[dD]([\\d]+)([MB]*)?([\\+\\d]*)?', 'g');
    let res = myReg.exec(damageString);
    let nbDice = parseInt(res[1]);
    let postForm = 'kh' + nbDice;
    let modIndex = 3;
    if (res[3]) {
      if (res[3] == 'M') {
        postForm = 'kl' + nbDice;
        nbDice++;
        modIndex = 4;
      }
      if (res[3] == 'B') {
        postForm = 'kh' + nbDice;
        nbDice++;
        modIndex = 4;
      }
    }
    let formula = nbDice + "d" + res[2] + postForm + ((res[modIndex]) ? res[modIndex] : "");
    return formula;
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
