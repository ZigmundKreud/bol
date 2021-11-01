export class BoLUtility  {
  

  /* -------------------------------------------- */
  static async init() {
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
  static createDirectOptionList( min, max) {
    let options = {};
    for(let i=min; i<=max; i++) {
      options[`${i}`] = `${i}`;
    }
    return options;
  }

  /* -------------------------------------------- */
  static buildListOptions(min, max) {
    let options = ""
    for (let i = min; i <= max; i++) {
      options += `<option value="${i}">${i}</option>`
    }
    return options;
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
      chatGM.content = "Blinde message of " + game.user.name + "<br>" + chatOptions.content;
      console.log("blindMessageToGM", chatGM);
      game.socket.emit("system.fvtt-fragged-kingdom", { msg: "msg_gm_chat_message", data: chatGM });
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
  static getTarget() {
    if (game.user.targets && game.user.targets.size == 1) {
      for (let target of game.user.targets) {
        return target;
      }
    }
    return undefined;
  }
  
  /* -------------------------------------------- */
  static async rollBoL( rollData ) {

    // Dice bonus/malus selection
    let nbDice = 2;
    let d6BM = 0;
    let mode = "";
    if ( rollData.d6Malus > rollData.d6Bonus){
      d6BM = rollData.d6Malus - rollData.d6Bonus;
      mode = "kl2";
    }
    if ( rollData.d6Bonus > rollData.d6Malus){
      d6BM = rollData.d6Bonus - rollData.d6Malus;
      mode = "kh2";
    }
    nbDice +=  d6BM;

    // Final modifier 
    let modifier = Number(rollData.bonusMalus);
    if ( rollData.mode == 'career') {
      modifier += Number(rollData.attributes[rollData.rollAttribute].value) + Number(rollData.career.data.rank);
    } else if ( rollData.mode == 'attribute' ) {
      modifier += rollData.attribute.value;
    } else if ( rollData.mode == 'weapon') {
      modifier += Number(rollData.attributes[rollData.rollAttribute].value) + Number(rollData.aptitude.value) + Number(rollData.rangeModifier);
      modifier -= rollData.defender.aptitudes.def.value;
    }

    let formula = nbDice+"d6"+mode+"+"+modifier;

    console.log("Going to roll ", formula, rollData.attributes, rollData.rollAttribute);
    let myRoll = new Roll(formula).roll( { async: false});
    await this.showDiceSoNice(myRoll, game.settings.get("core", "rollMode") );
    rollData.roll = myRoll;
    rollData.formula = formula;
    rollData.modifier = modifier; 
    rollData.finalScore = myRoll.total;

    let actor = game.actors.get(rollData.actorId);
    actor.saveRollData( rollData );
  
    this.createChatWithRollMode( rollData.alias, {
      content: await renderTemplate(`systems/bol/templates/roll/chat-generic-result.hbs`, rollData)
    });
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
            actorSheet.actor.deleteEmbeddedDocuments( "Item", [itemId] );
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
