/* -------------------------------------------- */
import { BoLUtility } from "./bol-utility.js";

/* -------------------------------------------- */
export class BoLAdventureGenerator {

  /* -------------------------------------------- */
  static async init() {
    this.adventureData = await fetchJsonWithTimeout("systems/bol/module/system/adventure_data.json")
  }

  /* -------------------------------------------- */
  static async createAdventure() {
    let roll1 = new Roll("1d" + this.adventureData.titre1.length).evaluate({ async: false })
    let roll2 = new Roll("1d" + this.adventureData.titre2.length).evaluate({ async: false })

    let p1 = this.adventureData.titre1[roll1.result - 1]
    let p2 = this.adventureData.titre2[roll2.result - 1]

    let story = {}
    story.title = "Krongar et " + p1.prefix + " " + p1.name + " " + p2.prefix + " " + p2.name

    let rollM = new Roll("1d" + this.adventureData.mission.length).evaluate({ async: false })
    story.mission = "La mission de Krongar est de " + this.adventureData.mission[rollM.result - 1].name

    if (!p1.isCarriere && !p2.isCarriere) {
      let rollC = new Roll("1d" + this.adventureData.carriere.length).evaluate({ async: false })
      story.carriere = "Une carrière : " + this.adventureData.carriere[rollC.result - 1]
    }

    if (!p1.isLieu && !p2.isLieu) {
      let rollL1 = new Roll("1d" + this.adventureData.lieux1.length).evaluate({ async: false })
      let rollL2 = new Roll("1d" + this.adventureData.lieux2.length).evaluate({ async: false })
      story.lieu = "Un lieu : " + this.adventureData.lieux1[rollL1.result - 1] + " " + this.adventureData.lieux2[rollL2.result - 1]
    }

    if (!p1.isObjet && !p2.isObjet) {
      let rollO1 = new Roll("1d" + this.adventureData.objets1.length).evaluate({ async: false })
      let rollO2 = new Roll("1d" + this.adventureData.objets2.length).evaluate({ async: false })
      story.objet = "Un objet : " + this.adventureData.objets1[rollO1.result - 1] + " " + this.adventureData.objets2[rollO2.result - 1]
    }

    let rollMOT = new Roll("1d" + this.adventureData.motivation.length).evaluate({ async: false })
    story.motivation = "Krongar entreprend cette mission parce que " + this.adventureData.motivation[rollMOT.result - 1]

    if (!p1.isEnnemi && !p2.isEnnemi) {
      let rollE = new Roll("1d" + this.adventureData.rival.length).evaluate({ async: false })
      story.rival = "Un rival : " + this.adventureData.rival[rollE.result - 1]
    }

    let rollDieu = new Roll("1d6").evaluate({ async: false })
    if (rollDieu.result == 6) {
      rollDieu = new Roll("1d" + this.adventureData.dieu.length).evaluate({ async: false })
      story.dieu = "Un Dieu est impliqué : " + this.adventureData.dieu[rollDieu.result - 1]
    }

    let rollComp = new Roll("1d6").evaluate({ async: false })
    if (rollComp.result >= 5) {
      rollComp = new Roll("1d" + this.adventureData.complique1.length).evaluate({ async: false })
      story.complication = "Une complication : " + this.adventureData.complique1[rollComp.result - 1]
    }

    let rollObs = new Roll("1d6").evaluate({ async: false })
    if (rollObs.result >= 5) {
      rollObs = new Roll("1d" + this.adventureData.obstacle.length).evaluate({ async: false })
      story.obstacle = "Un obstacle : " + this.adventureData.obstacle[rollObs.result - 1]
    }

    let rollRet = new Roll("1d6").evaluate({ async: false })
    if (rollRet.result == 6) {
      rollRet = new Roll("1d" + this.adventureData.retournement.length).evaluate({ async: false })
      story.retournement = "Un retournement : " + this.adventureData.retournement[rollRet.result - 1]
    }

    let rollRec = new Roll("1d" + this.adventureData.recompense.length).evaluate({ async: false })
    story.recompense = "Pour sa peine, Krongar reçoit " + this.adventureData.recompense[rollRec.result - 1]

    ChatMessage.create({
      alias: this.name,
      whisper: BoLUtility.getUsers(user => user.isGM),
      content: await renderTemplate('systems/bol/templates/chat/chat-adventure-result.hbs', 
      { name: "Aventure !", img: "", story : story})
    })

  }
}
