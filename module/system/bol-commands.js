/* -------------------------------------------- */
import { BoLAdventureGenerator } from "./bol-adventure-generator.js"

/* -------------------------------------------- */
export class BoLCommands {

  static init() {
    if (!game.bol.commands) {
      const bolCommands = new BoLCommands()
      bolCommands.registerCommand({ path: ["/adventure"], func: (content, msg, params) => BoLAdventureGenerator.createAdventure(), descr: "Nouvelle idée d'aventure!" });
      game.bol.commands = bolCommands
    }

    Hooks.on("chatMessage", (html, content, msg) => {
      if (content[0] == '/') {
        let regExp = /(\S+)/g;
        let commands = content.match(regExp);
        if (game.bol.commands.processChatCommand(commands, content, msg)) {
          return false;
        }
      }
      return true
    })
    
  }
  constructor() {
    this.commandsTable = {}
  }

  /* -------------------------------------------- */
  registerCommand(command) {
    this._addCommand(this.commandsTable, command.path, '', command);
  }

  /* -------------------------------------------- */
  _addCommand(targetTable, path, fullPath, command) {
    if (!this._validateCommand(targetTable, path, command)) {
      return;
    }
    const term = path[0];
    fullPath = fullPath + term + ' '
    if (path.length == 1) {
      command.descr = `<strong>${fullPath}</strong>: ${command.descr}`;
      targetTable[term] = command;
    }
    else {
      if (!targetTable[term]) {
        targetTable[term] = { subTable: {} };
      }
      this._addCommand(targetTable[term].subTable, path.slice(1), fullPath, command)
    }
  }

  /* -------------------------------------------- */
  _validateCommand(targetTable, path, command) {
    if (path.length > 0 && path[0] && command.descr && (path.length != 1 || targetTable[path[0]] == undefined)) {
      return true;
    }
    console.warn("bolCommands._validateCommand failed ", targetTable, path, command);
    return false;
  }


  /* -------------------------------------------- */
  /* Manage chat commands */
  processChatCommand(commandLine, content = '', msg = {}) {
    // Setup new message's visibility
    let rollMode = game.settings.get("core", "rollMode");
    if (["gmroll", "blindroll"].includes(rollMode)) msg["whisper"] = ChatMessage.getWhisperRecipients("GM");
    if (rollMode === "blindroll") msg["blind"] = true;
    msg["type"] = 0;

    let command = commandLine[0].toLowerCase();
    let params = commandLine.slice(1);

    return this.process(command, params, content, msg);
  }

  /* -------------------------------------------- */
  process(command, params, content, msg) {
    return this._processCommand(this.commandsTable, command, params, content, msg);
  }

  /* -------------------------------------------- */
  _processCommand(commandsTable, name, params, content = '', msg = {}, path = "") {
    console.log("===> Processing command")
    let command = commandsTable[name];
    path = path + name + " ";
    if (command && command.subTable) {
      if (params[0]) {
        return this._processCommand(command.subTable, params[0], params.slice(1), content, msg, path)
      }
      else {
        this.help(msg, command.subTable);
        return true;
      }
    }
    if (command && command.func) {
      const result = command.func(content, msg, params);
      if (result == false) {
        BoLCommands._chatAnswer(msg, command.descr);
      }
      return true;
    }
    return false;
  }

}