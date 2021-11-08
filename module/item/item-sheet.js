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
      width: 520,
      height: 480,
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
  getData() {
    const objectData = BoLUtility.data(this.item);
    // const objectData = BoLUtility.data(this.object);
    
    let itemData = foundry.utils.deepClone(BoLUtility.templateData(this.item));
    let formData = {
      title: this.title,
      id: this.id,
      config: game.bol.config,
      type: objectData.type,
      img: objectData.img,
      name: objectData.name,
      editable: this.isEditable,
      cssClass: this.isEditable ? "editable" : "locked",
      data: itemData, 
      limited: this.object.limited,
      options: this.options,
      owner: this.document.isOwner,
      isGM: game.user.isGM,
      itemProperties : this.item.itemProperties

    }
    console.log("ITEMDATA", formData);
    this.options.editable = !(this.object.data.origin == "embeddedItem");
    return formData;
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
  }

}
