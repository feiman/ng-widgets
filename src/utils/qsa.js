'use strict';

var angular = require('angular');

module.exports = function(selector){
  var res = [];

  [].forEach.call(this, function(el){
    res.push.apply(res, [].slice.call(el.querySelectorAll(selector)));
  });

  return angular.element(res);
};