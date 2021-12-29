
export class RdDCombatManager extends Combat {

  /************************************************************************************/
  async rollInitiative(ids, formula = undefined, messageOptions = {}) {
    console.log(`${game.data.system.data.title} | Combat.rollInitiative()`, ids, formula, messageOptions);
    // Structure input data
    ids = typeof ids === "string" ? [ids] : ids;
    const currentId = this.combatant._id;
    
    // calculate initiative
    if ( game.combat.current.round == 1) {
      for (let cId = 0; cId < ids.length; cId++) {
        const combatant = this.combatants.get(ids[cId]);
        // TODO 
        console.log("TODO : Compute init for actor");
      }
    }
  }
  
}