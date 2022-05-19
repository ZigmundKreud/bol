/* -------------------------------------------- */
import { BoLRoll } from "../controllers/bol-rolls.js";

/* -------------------------------------------- */
export class BoLAdventureGenerator {

  static async init() {
    this.adventureData = await fetchJsonWithTimeout("systems/bol/module/system/adventure_data.json")

    let roll1 = new Roll("1d"+this.adventureData.titre1.length).evaluate( {async: false})
    let roll2 = new Roll("1d"+this.adventureData.titre2.length).evaluate( {async: false})

    let p1 = this.adventureData.titre1[roll1.result-1]
    let p2 = this.adventureData.titre2[roll2.result-1]

    let str = "Krongar et " +  p1.prefix + " " + p1.name + " " + p2.prefix + " " + p2.name 
    //ui.notifications.info("Titre :" + str)
  }
}
