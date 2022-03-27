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
      height: 780,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

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

    // Dynamic default data fix/adapt
    if (itemData.type == "item") {
      if (!itemData.data.category) {
        itemData.data.category = "equipment"
      }
      if ( itemData.data.category == "equipment" && itemData.data.properties.equipable) {
        if (!itemData.data.properties.slot) {
          itemData.data.properties.slot = "-"
        }
      }
      if (itemData.data.category == 'spell') {
        if(!itemData.data.properties.mandatoryconditions) {
          itemData.data.properties.mandatoryconditions = []
        }
        if(!itemData.data.properties.optionnalconditions) {
          itemData.data.properties.optionnalconditions = []
        }
        for (let i = 0; i < 4; i++) {
          itemData.data.properties.mandatoryconditions[i] = itemData.data.properties.mandatoryconditions[i] ?? ""
        }
        for (let i = 0; i < 8; i++) {
          itemData.data.properties.optionnalconditions[i] = itemData.data.properties.optionnalconditions[i] ?? ""
        }
      }
    } else {
      if (!itemData.data.subtype) {
        itemData.data.category = "origin"
      }
    }

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
