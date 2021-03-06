'use strict';

var
  angular = require('angular'),
  _ = require('../utils/utils')
;

module.exports = function(ngWidget){
  return ngWidget({
    style:
      //hand + unselectable
      'nw-grid thead th{cursor: pointer; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none}' +
      'nw-grid[ng-model] tbody tr{cursor: pointer}' +

      //carret visibility
      'nw-grid th i.fa{visibility: hidden}' +
      'nw-grid th.active i.fa{visibility: visible}' +

      //bootstrap bug? striped + hover + active
      'nw-grid tr.active td{background: #68c !important; color: #fff !important}',

    template:
      '<content></content>' +
      '<table class="table table-striped table-hover table-bordered" ng-show=" cols ">' +
      '  <thead>' +
      '    <tr>' +
      '    <th' +
      '      ng-repeat=" col in cols " ' +
      '      ng-class=" {active: $index == $parent.sortIndex} " ' +
      '      ng-click=" $parent.reverse = (($parent.sortIndex == $index) && !reverse); $parent.sortIndex = $index " ' +
      '    >' +
      '      {{ col.name }} ' +
      '      <i class="fa fa-caret-{{ reverse ?\'down\' :\'up\' }} pull-right"></i>' +
      '    </th>' +
      '    </tr>' +
      '  </thead>' +
      '  <tbody></tbody>' +
      '</table>',

    defaults: {
      items: [],
      cols: [],
      sortIndex: 0,
      reverse: false,
      limit: 0,
      offset: 0
    },

    controller: function($scope, $element, $compile, orderByFilter){
      var
        gridCtrl = this
      ;

      gridCtrl.addCol = function(col){
        $scope.cols.push(col);
      };

      gridCtrl.removeCol = function(col){
        _.pull($scope.cols, col);
      };

      $scope.visibleItems = function(){
        return (
          orderByFilter(this.items || [], this.cols[this.sortIndex].index, this.reverse)
            .slice(this.offset)
            .slice(0, this.limit || undefined)
        );
      };

      $scope.$watchCollection('cols', updateCols);


      function updateCols(){
        var
          tbody = $element.find('tbody'),
          tr = angular.element('<tr></tr>'),
          trHtml = ''
        ;

        //init repeater
        tr.attr('ng-repeat', ' it in visibleItems() ');

        $scope.cols.forEach(function(col){
          trHtml += '<td>' + col.template() + '</td>';
        });

        tbody.html('');
        tbody.append(tr.html(trHtml));
        $compile(tr)($scope);
      }
    }
  });
};