/* -------------------------------------------- */
import { BoLRoll } from "../controllers/bol-rolls.js";

/* -------------------------------------------- */
export class BoLAdventureGenerator {

  static init() {
    this.adventureData = await fetchJsonWithTimeout("systems/bol/module/system/adventure_data.json")

    let roll1 = new Roll("1d"+this.adventureData.titre1.length).evaluate( {async: false})
    let roll2 = new Roll("1d"+this.adventureData.titre2.length).evaluate( {async: false})

    let str = "Krongar et " +  this.adventureData.titre1[roll1.result-1] + " " + this.adventureData.titre2[roll2.result-1]
    ui.notifications.info("Titre" + str)
  }
}
