/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class BoLItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
    // console.debug("Item prepareData");
    // Get the Item's data
    const itemData = this.data;
    // console.log(itemData);
    const actorData = this.actor ? this.actor.data : {};
    const data = itemData.data;
  }

  get properties() {
    return this.data.properties;
  }

  /* -------------------------------------------- */

  /**
   * Get the Array of item properties which are used in the small sidebar of the description tab
   * @return {Array}
   * @private
   */
  get itemProperties() {
    const props = [];
    if ( this.data.type === "item" ) {
      const entries = Object.entries(this.data.data.properties);
      props.push(...entries.filter(e => e[1] === true).map(e => { return game.bol.config.itemProperties[e[0]] }));
    }
    return props.filter(p => !!p);
  }


}
