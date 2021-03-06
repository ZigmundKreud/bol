export const registerHandlebarsHelpers = function () {

  Handlebars.registerHelper('isNull', function (val) {
    return val == null;
  });

  Handlebars.registerHelper('exists', function (val) {
    return val != null && val != undefined;
  });

  Handlebars.registerHelper('isEmpty', function (list) {
    if (list) return list.length == 0;
    else return 0;
  });

  Handlebars.registerHelper('notEmpty', function (list) {
    return list.length > 0;
  });

  Handlebars.registerHelper('isNegativeOrNull', function (val) {
    return val <= 0;
  });

  Handlebars.registerHelper('isNegative', function (val) {
    return val < 0;
  });

  Handlebars.registerHelper('isPositive', function (val) {
    return val > 0;
  });

  Handlebars.registerHelper('equals', function (val1, val2) {
    return val1 == val2;
  });

  Handlebars.registerHelper('neq', function (val1, val2) {
    return val1 !== val2;
  });

  Handlebars.registerHelper('gt', function (val1, val2) {
    return val1 > val2;
  })

  Handlebars.registerHelper('lt', function (val1, val2) {
    return val1 < val2;
  })

  Handlebars.registerHelper('gte', function (val1, val2) {
    return val1 >= val2;
  })

  Handlebars.registerHelper('lte', function (val1, val2) {
    return val1 <= val2;
  })
  Handlebars.registerHelper('and', function (val1, val2) {
    return val1 && val2;
  })
  Handlebars.registerHelper('or', function (val1, val2) {
    return val1 || val2;
  })

  Handlebars.registerHelper('or3', function (val1, val2, val3) {
    return val1 || val2 || val3;
  })

  Handlebars.registerHelper('for', function (from, to, incr, block) {
    var accum = '';
    for (var i = from; i < to; i += incr)
      accum += block.fn(i);
    return accum;
  })

  Handlebars.registerHelper('not', function (cond) {
    return !cond;
  })
  Handlebars.registerHelper('count', function (list) {
    return list.length;
  })
  Handlebars.registerHelper('isEnabled', function (configKey) {
    return game.settings.get("bol", configKey);
  })
  Handlebars.registerHelper('split', function (str, separator, keep) {
    return str.split(separator)[keep];
  })

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function () {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  })

  Handlebars.registerHelper('add', function (a, b) {
    return parseInt(a) + parseInt(b);
  });
  Handlebars.registerHelper('mul', function (a, b) {
    return parseInt(a) * parseInt(b);
  })
  Handlebars.registerHelper('sub', function (a, b) {
    return parseInt(a) - parseInt(b);
  })
  Handlebars.registerHelper('valueAtIndex', function (arr, idx) {
    return arr[idx];
  })
  Handlebars.registerHelper('includesKey', function (items, type, key) {
    // console.log(items);
    return items.filter(i => i.type === type).map(i => i.data.key).includes(key);
  })
  Handlebars.registerHelper('includes', function (array, val) {
    return array.includes(val);
  })
  Handlebars.registerHelper('eval', function (expr) {
    return eval(expr);
  })
  Handlebars.registerHelper('isOwnerOrGM', function (actor) {
    console.log("Testing actor", actor.isOwner, game.userId)
    if (actor.isOwner || game.isGM) {
      return true
    }
    return false
  })



}