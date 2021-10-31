import { BoLUtility } from "../system/bol-utility.js";

export class BoLRollDialog extends Dialog {

  /* -------------------------------------------- */
  static async create(actor, rollData ) {

    let options = { classes: ["BoL"], width: 600, height: 320, 'z-index': 99999 };
    let html = await renderTemplate(`systems/bol/templates/roll/roll-dialog-${rollData.mode}.hbs`, rollData);
    return new BoLRollDialog(actor, rollData, html, options );
  }

  /* -------------------------------------------- */
  constructor(actor, rollData, html, options, close = undefined) {
    let conf = {
      title: rollData.title,
      content: html,
      buttons: { 
        roll: {
            icon: '<i class="fas fa-check"></i>',
            label: "Roll !",
            callback: () => { this.roll() } 
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            callback: () => { this.close() }
        } },
      default: "roll",
      close: close
    }

    super(conf, options);

    console.log("ROLLDATA ", rollData);
    this.actor = actor;
    this.rollData = rollData;
  }

  /* -------------------------------------------- */
  roll () {
    BoLUtility.rollBoL( this.rollData )
  }

  /* -------------------------------------------- */
  activateListeners(html) {
    super.activateListeners(html);

    var dialog = this;
    function onLoad() {
    }
    $(function () { onLoad(); });

    html.find('#bonusMalus').change((event) => {
      this.rollData.bonusMalus = Number(event.currentTarget.value);
    });
    html.find('#d6Bonus').change((event) => {
      this.rollData.d6Bonus = Number(event.currentTarget.value);
    });
    html.find('#d6Malus').change((event) => {
      this.rollData.d6Malus = Number(event.currentTarget.value);
    });
  }
}
