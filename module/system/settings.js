export const registerSystemSettings = function() {

    game.settings.register("bol", "displayDifficulty", {
        name: "Affiche la difficulté",
        hint: "Active l'affichage de la difficulté sur les jets de compétences/attributs et d'armes.",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        onChange: lang => window.location.reload()
    });
    
    game.settings.register("bol", "rollArmor", {
      name: "Effectuer des jets pour les armures",
      hint: "Effectue un jet de dés pour les armures (valeur fixe si désactivé)",
      scope: "world",
      config: true,
      default: true,
      type: Boolean,
      onChange: lang => window.location.reload()
  });

};
