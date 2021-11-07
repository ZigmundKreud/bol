/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
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
      console.log(item);
      item.sheet.render(true);
    });
    html.find('.roll-attribute').click(ev => {
      this.actor.rollAttributeAptitude( $(ev.currentTarget).data("attr-key") );
    });
    html.find('.roll-career').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.rollCareer( li.data("itemId") );
    });
    html.find('.roll-weapon').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.rollWeapon( li.data("itemId") );
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
  }

  /* -------------------------------------------- */

  /** @override */
  getData(options) {
    console.debug("getData");
    const actor = super.getData(options);
    console.log(actor.data);
    actor.data.details = actor.data.data.details;
    actor.data.attributes = Object.values(actor.data.data.attributes);
    actor.data.aptitudes = Object.values(actor.data.data.aptitudes);
    actor.data.resources = Object.values(actor.data.data.resources);
    actor.data.equipment = actor.data.items.filter(i => i.type === "item" || i.type == 'weapon' || i.type == 'armor');
    actor.data.weapons = duplicate(actor.data.items.filter(i => i.type == 'weapon' ));
    actor.data.armors = duplicate(actor.data.items.filter(i => i.type == 'armor' ));

    actor.data.features = {
      "careers" : {
        "label" : "BOL.featureCategory.careers",
        "ranked" : true,
        "items" : actor.data.items.filter(i => i.type === "feature" && i.data.subtype === "career")
      },
      "origins" : {
        "label" : "BOL.featureCategory.origins",
        "ranked" : false,
        "items" : actor.data.items.filter(i => i.type === "feature" && i.data.subtype === "origin")
      },
      "races" : {
        "label" : "BOL.featureCategory.races",
        "ranked" : false,
        "items" : actor.data.items.filter(i => i.type === "feature" && i.data.subtype === "race")
      },
      "boons" : {
        "label" : "BOL.featureCategory.boons",
        "ranked" : false,
        "items" : actor.data.items.filter(i => i.type === "feature" && i.data.subtype === "boon")
      },
      "flaws" : {
        "label" : "BOL.featureCategory.flaws",
        "ranked" : false,
        "items" : actor.data.items.filter(i => i.type === "feature" && i.data.subtype === "flaw")
      },
      "languages" : {
        "label" : "BOL.featureCategory.languages",
        "ranked" : false,
        "items" : actor.data.items.filter(i => i.type === "feature" && i.data.subtype === "language")
      }
    };

    return actor;
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

    if (dataset.roll) {
      let roll = new Roll(dataset.roll, this.actor.data.data);
      let label = dataset.label ? `Rolling ${dataset.label}` : '';
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
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
