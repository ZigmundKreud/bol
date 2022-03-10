/*
Init order = 
  10 - Legendary
  9 - Heroic
  8 - Success
  7 - Rivals/adversary
  6 - Coriaces/tough
  5 - Failure
  4 - Pietaille
  3 - Echec critique
*/


export class BoLCombatManager extends Combat {

  /************************************************************************************/
  async rollInitiative(ids, formula = undefined, messageOptions = {}) {
    console.log(`${game.data.system.data.title} | Combat.rollInitiative()`, ids, formula, messageOptions);
    // Structure input data
    ids = typeof ids === "string" ? [ids] : ids;
    const currentId = this.combatant._id;

    // calculate initiative
    for (let cId = 0; cId < ids.length; cId++) {
      const combatant = this.combatants.get(ids[cId]);
      let fvttInit = 5
      if (combatant.actor.type == 'character') {
        let initData = combatant.actor.getLastInitData()
        console.log("Init data !!!", initData)
        if (initData.isLegendary) {
          fvttInit = 10
        } else if (initData.isCritical) {
          fvttInit = 9
        } else if (initData.lastinit >= 9) {
          fvttInit = 8
        } else if (initData.isFumble) {
          fvttInit = 3
        }
      } else {
        fvttInit = 4 // Pietaille par defaut
        if ( combatant.actor.getSubtype == 'adversary') {
          fvttInit = 7
        } 
        if ( combatant.actor.getSubtype == 'tough') {
          fvttInit = 6
        } 
      }
      fvttInit += (cId / 100)
      await this.updateEmbeddedDocuments("Combatant", [{ _id: ids[cId], initiative: fvttInit }]);
    }
  }

  /************************************************************************************/
  nextRound() {
    let combatants = this.combatants.contents
    for (let c of combatants) {
      let actor = game.actors.get( c.data.actorId )
      //actor.clearRoundModifiers()
    }
    super.nextRound()
  }


}
  
