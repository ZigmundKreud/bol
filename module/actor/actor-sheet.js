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

    // Incr./Decr. career ranks
    html.find(".inc-dec-btns").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      if(li){
        const item = this.actor.items.get(li.data("itemId"));
        if(item){
          const dataset = ev.currentTarget.dataset;
          const operator = dataset.operator;
          const target = dataset.target;
          const incr = parseInt(dataset.incr);
          const min = parseInt(dataset.min);
          const max = parseInt(dataset.max);
          const itemData = item.data;
          let value = eval("itemData."+target);
          if(operator === "minus"){
            if(value >= min + incr) value -= incr;
            else value = min;
          }
          if(operator === "plus"){
            if(value <= max - incr) value += incr;
            else value = max;
          }
          let update = {};
          update[target] = value;
          item.update(update);
        }
      }
      // const input = html.find("#" + type);
      // let value = parseInt(input.val(), 10) || 0;
      // value += operator === "plus" ? 1 : -1;
      // input.val(value > 0 ? value : 0);
    });


    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      Dialog.confirm({
        title: "Suppression",
        content: `Vous êtes sûr de vouloir supprimer cet item ?`,
        yes: () => {
          const li = $(ev.currentTarget).parents(".item");
          this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")])
          li.slideUp(200, () => this.render(false));
        },
        no: () => {},
        defaultYes: false,
      });
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
    const data = super.getData(options);
    const actorData = data.data;
    data.config = game.bol.config;
    data.data = actorData.data;
    data.details = this.actor.details;
    data.attributes = this.actor.attributes;
    data.aptitudes = this.actor.aptitudes;
    data.resources = this.actor.resources;
    data.equipment = this.actor.equipment;
    data.weapons = this.actor.weapons;
    data.protections = this.actor.protections;
    data.containers = this.actor.containers;
    data.treasure = this.actor.treasure;
    data.vehicles = this.actor.vehicles;
    data.ammos = this.actor.ammos;
    data.misc = this.actor.misc;
    data.combat = this.actor.buildCombat();
    data.features = this.actor.buildFeatures();
    data.isGM = game.user.isGM;

    console.log("ACTORDATA", data);
    return data;
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
      case "weapon": 
        console.log("ROLL WEAPON !!!"); // TODO
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
