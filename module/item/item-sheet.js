import { BoLUtility } from "../system/bol-utility.js";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class BoLItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["bol", "sheet", "item"],
      template: "systems/bol/templates/item/item-sheet.hbs",
      width: 650,
      height: 750,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  // /** @override */
  // get template() {
  //   const path = "systems/bol/templates/item";
  //   // Return a single sheet for all item types.
  //   //return `${path}/item-sheet.hbs`;
  //   // Alternatively, you could use the following return statement to do a
  //   // unique item sheet by type, like `weapon-sheet.html`.
  //   return `${path}/item-${this.item.data.type}-sheet.hbs`;
  // }

  /* -------------------------------------------- */

  /** @override */
  getData(options) {
    const data = super.getData(options);
    const itemData = data.data;
    data.config = game.bol.config;
    data.item = itemData;
    data.data = itemData.data;
    data.category = itemData.category;
    data.itemProperties = this.item.itemProperties;
    data.isGM = game.user.isGM;
    console.log("ITEMDATA", data);
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;
    // Roll handlers, click handlers, etc. would go here.

    html.find('.armorQuality').change(ev => {
      const li = $(ev.currentTarget);
      console.log(game.bol.config.soakFormulas[li.val()]);
      $('.soakFormula').val(game.bol.config.soakFormulas[li.val()]);
    });

  }

}
