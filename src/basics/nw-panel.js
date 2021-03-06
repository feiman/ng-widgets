'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    template:
      '<div class="panel panel-{{ type }}">' +
      '  <div class="panel-heading" ng-show=" name ">{{ name }}</div>' +
      '  <div class="panel-body">' +
      '    <content></content>' +
      '  </div>' +
      '</div>',

    defaults: {
      name: '',
      type: 'default'
    }
  });
};