/* -------------------------------------------- */
import { BolCalendarEditor } from "./bol-calendar-editor.js";
import { BoLUtility } from "./bol-utility.js";

/* -------------------------------------------- */
const monthDef = [
  { label: "Vishka", saison: "Saison du Renouveau" },
  { label: "Istha", saison: "Saison du Renouveau" },
  { label: "Sadha", saison: "Saison du Renouveau" },
  { label: "Vana", saison: "Saison du Renouveau" },
  { label: "Pada", saison: "Saison Sèche" },
  { label: "Vina", saison: "Saison Sèche" },
  { label: "Tika", saison: "Saison Sèche" },
  { label: "Sha", saison: "Saison Sèche" },
  { label: "Pausa", saison: "Saison Sèche" },
  { label: "Magha", saison: "Saison des Pluies" },
  { label: "Phal", saison: "Saison des Pluies" },
  { label: "Chatra", saison: "Saison des Pluies" }
]
const BOL_DAY_PER_MONTH = 30

/* -------------------------------------------- */
export class BoLCalendar extends Application {

  static createCalendarPos() {
    return { top: 200, left: 200 };
  }

  static getCalendar(index) {
    let calendar = {
      heure: 0,
      minutes: 0,
      day: 0,
      year: 900,
      month: 0,
    }
    return calendar
  }

  constructor() {
    super();
    // position
    this.calendarPos = duplicate(game.settings.get(SYSTEM_RDD, "calendar-pos"));
    if (this.calendarPos == undefined || this.calendarPos.top == undefined) {
      this.calendrierPos = BoLCalendar.createCalendarPos()
      game.settings.set("bol", "calendar-pos", this.calendarPos)
    }

    // Calendar
    this.calendar = duplicate(game.settings.get("bol", "calendar") ?? BoLCalendar.getCalendar(0));
    this.calendar.year = this.calendar.year || 900
    this.calendar.month = 0

    if (game.isGM()) { // Uniquement si GM
      game.settings.set("bol", "calendar", this.calendar)
    }
  }

  /* -------------------------------------------- */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/bol/templates/calendar-template.html",
      popOut: false,
      resizable: false
    })
  }

  /* -------------------------------------------- */
  getCurrentHeure() {
    return this.calendar.hour
  }

  /* -------------------------------------------- */
  async onCalendarButton(ev) {
    ev.preventDefault();
    const calendarAvance = ev.currentTarget.attributes['data-calendar-avance']
    const calendarSet = ev.currentTarget.attributes['data-calendar-set']
    if (calendarAvance) {
      await this.incrementTime(Number(calendarAvance.value))
    }
    else if (calendarSet) {
      this.setHour(Number(calendarSet.value))
    }
    this.updateDisplay()
  }

  /* -------------------------------------------- */
  async incrementTime(minutes = 0) {
    this.calendar.minutes += minutes
    if (this.calendar.minutes >= 60) {
      this.calendar.minutes -= 60
      this.calendar.hour += 1;
      }
    if (this.calendar.hour >= 24) {
      this.calendar.hour -= 24
      await this.incrementDay()
    }
    game.settings.set("bol", "calendar", duplicate(this.calendar));
    // Notification aux joueurs // TODO: replace with Hook on game settings update
    game.socket.emit(SYSTEM_SOCKET_ID, {
      msg: "msg_sync_time",
      data: duplicate(this.calendrier)
    });
  }

  /* -------------------------------------------- */
  async incrementerJour() {
    const index = this.getCurrentDayIndex() + 1;
    this.calendrier = RdDCalendrier.getCalendrier(index);
    await this.rebuildListeNombreAstral();
  }

  /* -------------------------------------------- */
  syncPlayerTime(calendrier) {
    this.calendrier = duplicate(calendrier); // Local copy update
    this.updateDisplay();
  }

  /* -------------------------------------------- */
  async positionnerHeure(indexHeure) {
    if (indexHeure <= this.calendrier.heureRdD) {
      await this.incrementerJour();
    }
    this.calendrier.heureRdD = indexHeure;
    this.calendrier.minutesRelative = 0;
    game.settings.set(SYSTEM_RDD, "calendrier", duplicate(this.calendrier));
  }

  /* -------------------------------------------- */
  fillCalendrierData(formData = {}) {
    console.log(this.calendrier);
    let moisKey = heuresList[this.calendrier.moisRdD];
    let heureKey = heuresList[this.calendrier.heureRdD];
    console.log(moisKey, heureKey);

    const mois = heuresDef[moisKey];
    const heure = heuresDef[heureKey];

    formData.heureKey = heureKey;
    formData.moisKey = moisKey;
    formData.jourMois = this.calendrier.jour + 1;
    formData.nomMois = mois.label; // heures et mois nommés identiques
    formData.iconMois = dossierIconesHeures + mois.icon;
    formData.nomHeure = heure.label;
    formData.iconHeure = dossierIconesHeures + heure.icon;
    formData.nomSaison = saisonsDef[mois.saison].label;
    formData.heureRdD = this.calendrier.heureRdD;
    formData.minutesRelative = this.calendrier.minutesRelative;
    formData.isGM = game.user.isGM;
    return formData;
  }

  /* -------------------------------------------- */
  getLectureAstrologieDifficulte(dateIndex) {
    let indexNow = this.getCurrentDayIndex();
    let diffDay = dateIndex - indexNow;
    return - Math.floor(diffDay / 2);
  }

  /* -------------------------------------------- */
  async requestNombreAstral(request) {
    if (Misc.isUniqueConnectedGM()) { // Only once
      console.log(request);
      let jourDiff = this.getLectureAstrologieDifficulte(request.date);
      let niveau = Number(request.astrologie.data.niveau) + Number(request.conditions) + Number(jourDiff) + Number(request.etat);
      let rollData = {
        caracValue: request.carac_vue,
        finalLevel: niveau,
        showDice: HIDE_DICE,
        rollMode: "blindroll"
      };
      await RdDResolutionTable.rollData(rollData);
      let nbAstral = this.getNombreAstral(request.date);
      request.rolled = rollData.rolled;
      request.isValid = true;
      if (!request.rolled.isSuccess) {
        request.isValid = false;
        nbAstral = await RdDDice.rollTotal("1dhr" + nbAstral, { rollMode: "selfroll" });
        // Mise à jour des nombres astraux du joueur
        let astralData = this.listeNombreAstral.find((nombreAstral, i) => nombreAstral.index == request.date);
        astralData.valeursFausses.push({ actorId: request.id, nombreAstral: nbAstral });
        game.settings.set(SYSTEM_RDD, "liste-nombre-astral", this.listeNombreAstral);
      }
      request.nbAstral = nbAstral;
      if (Misc.getActiveUser(request.userId)?.isGM) {
        RdDUtility.responseNombreAstral(request);
      } else {
        game.socket.emit(SYSTEM_SOCKET_ID, {
          msg: "msg_response_nombre_astral",
          data: request
        });
      }
    }
  }

  /* -------------------------------------------- */
  findHeure(heure) {
    heure = Grammar.toLowerCaseNoAccentNoSpace(heure);
    let parHeureOuLabel = Object.values(heuresDef).filter(it => (it.heure + 1) == parseInt(heure) || Grammar.toLowerCaseNoAccentNoSpace(it.label) == heure);
    if (parHeureOuLabel.length == 1) {
      return parHeureOuLabel[0];
    }
    let parLabelPartiel = Object.values(heuresDef).filter(it => Grammar.toLowerCaseNoAccentNoSpace(it.label).includes(heure));
    if (parLabelPartiel.length > 0) {
      parLabelPartiel.sort(Misc.ascending(h => h.label.length));
      return parLabelPartiel[0];
    }
    return undefined;
  }
  /* -------------------------------------------- */
  getHeureNumber( hNum) {
    let heure = Object.values(heuresDef).find(it => (it.heure) == hNum);
    return heure
  }

  /* -------------------------------------------- */
  getHeuresChanceMalchance(heureNaissance) {
    let heuresChancesMalchances = [];
    let defHeure = this.findHeure(heureNaissance);
    if (defHeure) {
      let hn = defHeure.heure;
      let chiffreAstral = this.getCurrentNombreAstral() ?? 0;
      heuresChancesMalchances[0] = { value : "+4", heures: [this.getHeureNumber((hn + chiffreAstral) % RDD_HEURES_PAR_JOUR).label]};
      heuresChancesMalchances[1] = { value : "+2", heures: [this.getHeureNumber((hn + chiffreAstral+4) % RDD_HEURES_PAR_JOUR).label, 
        this.getHeureNumber((hn + chiffreAstral + 8) % RDD_HEURES_PAR_JOUR).label ] };
      heuresChancesMalchances[2] = { value : "-4", heures: [this.getHeureNumber((hn + chiffreAstral+6) % RDD_HEURES_PAR_JOUR).label]};
      heuresChancesMalchances[3] = { value : "-2", heures: [this.getHeureNumber((hn + chiffreAstral+3) % RDD_HEURES_PAR_JOUR).label, 
          this.getHeureNumber((hn + chiffreAstral + 9) % RDD_HEURES_PAR_JOUR).label ]};
    }
    return heuresChancesMalchances;
  }

  /* -------------------------------------------- */
  getAjustementAstrologique(heureNaissance, name = undefined) {
    let defHeure = this.findHeure(heureNaissance);
    if (defHeure) {
      let hn = defHeure.heure;
      let chiffreAstral = this.getCurrentNombreAstral() ?? 0;
      let heureCourante = this.calendrier.heureRdD;
      let ecartChance = (hn + chiffreAstral - heureCourante) % RDD_HEURES_PAR_JOUR;
      switch (ecartChance) {
        case 0: return 4;
        case 4: case 8: return 2;
        case 6: return -4;
        case 3: case 9: return -2;
      }
    }
    else if (name) {
      ui.notifications.warn(name + " n'a pas d'heure de naissance, ou elle est incorrecte : " + heureNaissance);
    }
    else {
      ui.notifications.warn(heureNaissance + " ne correspond pas à une heure de naissance");
    }
    return 0;
  }

  /* -------------------------------------------- */
  getData() {
    let formData = super.getData();

    this.fillCalendrierData(formData);

    this.setPos(this.calendrierPos);
    return formData;
  }

  /* -------------------------------------------- */
  setPos(pos) {
    return new Promise(resolve => {
      function check() {
        let elmnt = document.getElementById("calendar-time-container");
        if (elmnt) {
          elmnt.style.bottom = null;
          let xPos = (pos.left) > window.innerWidth ? window.innerWidth - 200 : pos.left;
          let yPos = (pos.top) > window.innerHeight - 20 ? window.innerHeight - 100 : pos.top;
          elmnt.style.top = (yPos) + "px";
          elmnt.style.left = (xPos) + "px";
          resolve();
        } else {
          setTimeout(check, 30);
        }
      }
      check();
    });
  }

  /* -------------------------------------------- */
  updateDisplay() {
    let data = this.fillCalendrierData();
    // Rebuild data
    let dateHTML = `Jour ${data.jourMois} de ${data.nomMois} (${data.nomSaison})`
    if (game.user.isGM) {
      dateHTML = dateHTML + " - NA: " + (this.getCurrentNombreAstral() ?? "indéterminé");
    }
    for (let handle of document.getElementsByClassName("calendar-date-rdd")) {
      handle.innerHTML = dateHTML;
    }
    for (let heure of document.getElementsByClassName("calendar-heure-texte")) {
      heure.innerHTML = data.nomHeure;
    }
    for (const minute of document.getElementsByClassName("calendar-time-disp")) {
      minute.innerHTML = `${data.minutesRelative} minutes`;
    }
    for (const heureImg of document.getElementsByClassName("calendar-heure-img")) {
      heureImg.src = data.iconHeure;
    }
  }

  /* -------------------------------------------- */
  async saveEditeur(calendrierData) {
    this.calendrier.minutesRelative = Number(calendrierData.minutesRelative);
    this.calendrier.jour = Number(calendrierData.jourMois) - 1;
    this.calendrier.moisRdD = RdDCalendrier.getChiffreFromSigne(calendrierData.moisKey);
    this.calendrier.heureRdD = RdDCalendrier.getChiffreFromSigne(calendrierData.heureKey);
    game.settings.set(SYSTEM_RDD, "calendrier", duplicate(this.calendrier));

    await this.rebuildListeNombreAstral();

    game.socket.emit(SYSTEM_SOCKET_ID, {
      msg: "msg_sync_time",
      data: duplicate(this.calendrier)
    });

    this.updateDisplay();
  }

  /* -------------------------------------------- */
  async showCalendarEditor() {
    let calendrierData = duplicate(this.fillCalendrierData());
    if (this.editeur == undefined) {
      calendrierData.jourMoisOptions = RdDCalendrier.buildJoursMois();
      calendrierData.heuresOptions = [0, 1];
      calendrierData.minutesOptions = Array(RDD_MINUTES_PAR_HEURES).fill().map((item, index) => 0 + index);
      let html = await renderTemplate('systems/foundryvtt-reve-de-dragon/templates/calendar-editor-template.html', calendrierData);
      this.editeur = new RdDCalendrierEditeur(html, this, calendrierData)
    }
    this.editeur.updateData(calendrierData);
    this.editeur.render(true);
  }

  static buildJoursMois() {
    return Array(RDD_JOUR_PAR_MOIS).fill().map((item, index) => 1 + index);
  }

  /* -------------------------------------------- */
  async showAstrologieEditor() {
    let calendrierData = duplicate(this.fillCalendrierData());
    let astrologieArray = [];
    this.listeNombreAstral = this.listeNombreAstral || [];
    for (let astralData of this.listeNombreAstral) {
      astralData.humanDate = this.getDateFromIndex(astralData.index);
      for (let vf of astralData.valeursFausses) {
        let actor = game.actors.get(vf.actorId);
        vf.actorName = (actor) ? actor.name : "Inconnu";
      }
      astrologieArray.push(duplicate(astralData));
    }
    let heuresParActeur = {};
    for (let actor of game.actors) {
      let heureNaissance = actor.getHeureNaissance();
      if ( heureNaissance) {
        heuresParActeur[actor.name] = this.getHeuresChanceMalchance(heureNaissance);
      }      
    }
    //console.log("ASTRO", astrologieArray);
    calendrierData.astrologieData = astrologieArray;
    calendrierData.heuresParActeur = heuresParActeur;
    let html = await renderTemplate('systems/foundryvtt-reve-de-dragon/templates/calendar-astrologie-template.html', calendrierData);
    let astrologieEditeur = new RdDAstrologieEditeur(html, this, calendrierData)
    astrologieEditeur.updateData(calendrierData);
    astrologieEditeur.render(true);
  }

  /* -------------------------------------------- */
  /** @override */
  async activateListeners(html) {
    super.activateListeners(html);

    HtmlUtility._showControlWhen($(".gm-only"), game.user.isGM);

    await this.updateDisplay();

    html.find('.calendar-btn').click(ev => this.onCalendarButton(ev));

    html.find('.calendar-btn-edit').click(ev => {
      ev.preventDefault();
      this.showCalendarEditor();
    });

    html.find('.astrologie-btn-edit').click(ev => {
      ev.preventDefault();
      this.showAstrologieEditor();
    });

    html.find('#calendar-move-handle').mousedown(ev => {
      ev.preventDefault();
      ev = ev || window.event;
      let isRightMB = false;
      if ("which" in ev) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = ev.which == 3;
      } else if ("button" in ev) { // IE, Opera 
        isRightMB = ev.button == 2;
      }

      if (!isRightMB) {
        dragElement(document.getElementById("calendar-time-container"));
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        function dragElement(elmnt) {
          elmnt.onmousedown = dragMouseDown;
          function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;

            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
          }

          function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.bottom = null
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
          }

          function closeDragElement() {
            // stop moving when mouse button is released:
            elmnt.onmousedown = null;
            document.onmouseup = null;
            document.onmousemove = null;
            let xPos = (elmnt.offsetLeft - pos1) > window.innerWidth ? window.innerWidth - 200 : (elmnt.offsetLeft - pos1);
            let yPos = (elmnt.offsetTop - pos2) > window.innerHeight - 20 ? window.innerHeight - 100 : (elmnt.offsetTop - pos2)
            xPos = xPos < 0 ? 0 : xPos;
            yPos = yPos < 0 ? 0 : yPos;
            if (xPos != (elmnt.offsetLeft - pos1) || yPos != (elmnt.offsetTop - pos2)) {
              elmnt.style.top = (yPos) + "px";
              elmnt.style.left = (xPos) + "px";
            }
            game.system.rdd.calendrier.calendrierPos.top = yPos;
            game.system.rdd.calendrier.calendrierPos.left = xPos;
            if (game.user.isGM) {
              game.settings.set(SYSTEM_RDD, "calendrier-pos", duplicate(game.system.rdd.calendrier.calendrierPos));
            }
          }
        }
      } else if (isRightMB) {
        game.system.rdd.calendrier.calendrierPos.top = 200;
        game.system.rdd.calendrier.calendrierPos.left = 200;
        if (game.user.isGM) {
          game.settings.set(SYSTEM_RDD, "calendrier-pos", duplicate(game.system.rdd.calendrier.calendrierPos));
        }
        this.setPos(game.system.rdd.calendrier.calendrierPos);
      }
    });
  }

}