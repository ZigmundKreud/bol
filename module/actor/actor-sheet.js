/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import {BoLRoll} from "../controllers/bol-rolls.js";

export class BoLActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["bol", "sheet", "actor"],
      template: "systems/bol/templates/actor/actor-sheet.hbs",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });
    // Equip/Unequip item
    html.find('.item-equip').click(this._onToggleEquip.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")])
      li.slideUp(200, () => this.render(false));
    });

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // html.find('.roll-attribute').click(ev => {
    //   this.actor.rollAttributeAptitude( $(ev.currentTarget).data("attr-key") );
    // });
    // html.find('.roll-career').click(ev => {
    //   const li = $(ev.currentTarget).parents(".item");
    //   this.actor.rollCareer( li.data("itemId") );
    // });
    // html.find('.roll-weapon').click(ev => {
    //   const li = $(ev.currentTarget).parents(".item");
    //   this.actor.rollWeapon( li.data("itemId") );
    // });
  }

  /* -------------------------------------------- */

  /** @override */
  getData(options) {
    const actorData = super.getData(options);
    actorData.data = {
      details : this.actor.details,
      attributes : this.actor.attributes,
      aptitudes : this.actor.aptitudes,
      resources : this.actor.resources,
      equipment : this.actor.equipment,
      combat : this.actor.buildCombat(),
      features : this.actor.buildFeatures()
    };
    return actorData;
  }
  /* -------------------------------------------- */

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }


  _onToggleEquip(event) {
    event.preventDefault();
    const li = $(event.currentTarget).closest(".item");
    const item = this.actor.items.get(li.data("itemId"));
    return this.actor.toggleEquipItem(item);
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const actorData = this.getData();
    const rollType = dataset.rollType;
    switch(rollType) {
      case "attribute" :
        BoLRoll.attributeCheck(this.actor, actorData, dataset, event);
        break;
      case "aptitude" :
        BoLRoll.aptitudeCheck(this.actor, actorData, dataset, event);
        break;
      default : break;
    }
  }

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }
}
