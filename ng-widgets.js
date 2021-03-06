(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var
  angular = require('angular'),
  ngWidgets = angular.module('ng-widgets', []),

  jQuery = global.jQuery
;

module.exports = ngWidgets;

//TODO: test
//quick and dirty
if ( ! jQuery){
  angular.element.prototype.find = require('./src/utils/qsa.js');
}

ngWidgets
  .value('ngWidget', require('./src/utils/ng-widget.js'))
  .filter('markdown', require('./src/utils/markdown.js'))
  .directive('content', require('./src/utils/content'))
  .directive('nwLipsum', require('./src/utils/nw-lipsum'))


  .directive('nwBtn', require('./src/basics/nw-btn'))
  .directive('nwNavbar', require('./src/basics/nw-navbar'))
  .directive('nwList', require('./src/basics/nw-list'))
  .directive('nwItem', require('./src/basics/nw-item'))
  .directive('nwPanel', require('./src/basics/nw-panel'))
  .directive('nwModal', require('./src/basics/nw-modal'))
  .directive('nwGrid', require('./src/basics/nw-grid'))
  .directive('nwGridCol', require('./src/basics/nw-grid-col'))
  .directive('nwTabs', require('./src/basics/nw-tabs'))
  .directive('nwTab', require('./src/basics/nw-tab'))

  .directive('nwField', require('./src/forms/nw-field'))
  .directive('nwSaveBtn', require('./src/forms/nw-save-btn'))
  .directive('nwDeleteBtn', require('./src/forms/nw-delete-btn'))
;
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./src/basics/nw-btn":4,"./src/basics/nw-grid":6,"./src/basics/nw-grid-col":5,"./src/basics/nw-item":7,"./src/basics/nw-list":8,"./src/basics/nw-modal":9,"./src/basics/nw-navbar":10,"./src/basics/nw-panel":11,"./src/basics/nw-tab":12,"./src/basics/nw-tabs":13,"./src/forms/nw-delete-btn":14,"./src/forms/nw-field":15,"./src/forms/nw-save-btn":16,"./src/utils/content":17,"./src/utils/markdown.js":18,"./src/utils/ng-widget.js":19,"./src/utils/nw-lipsum":20,"./src/utils/qsa.js":21,"angular":2}],2:[function(require,module,exports){
'use strict';

module.exports = window.angular;
},{}],3:[function(require,module,exports){
'use strict';

module.exports = window.Showdown;
},{}],4:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    template:
      '<a class="btn btn-{{ type }}" ng-class=" {disabled: ngDisabled} ">' +
      '  <i class="fa fa-{{ icon }}" ng-show=" icon "></i>' +
      '  {{ name }}' +
      '</a>',

    defaults: {
      name: '',
      icon: '',
      type: 'default',
      ngDisabled: false
    },

    link: function($scope, $element){
      $element.on('click', function($event){
        if ($scope.ngDisabled){
          $event.stopImmediatePropagation();
        }
      });
    }
  });
};
},{}],5:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    require: ['^nwGrid'],

    template: '<content></content>',

    defaults: {
      name: '',
      index: ''
    },

    controller: function($scope){
      $scope.template = function(){
        return this.html || ('{{ it["' + this.index + '"] }}');
      };
    },

    link: function($scope, $element, $attrs, ctrls){
      var
        gridCtrl = ctrls[0]
      ;

      gridCtrl.addCol($scope);

      $scope.$on('$destroy', gridCtrl.removeCol.bind(gridCtrl, $scope));

      $scope.html = $element.find('template').html();
    }
  });
};
},{}],6:[function(require,module,exports){
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
},{"../utils/utils":22,"angular":2}],7:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    require: ['^nwList'],

    defaults: {
      name: '',
      href: ''
    },

    link: function($scope, $element, $attrs, ctrls){
      var
        listCtrl = ctrls[0]
      ;

      listCtrl.addItem($scope);

      $scope.$on('$destroy', listCtrl.removeItem.bind(listCtrl, $scope));
    }
  });
};
},{}],8:[function(require,module,exports){
'use strict';

var
  _ = require('../utils/utils')
;

module.exports = function(ngWidget){
  return ngWidget({
    template:
      '<content></content>' +
      '<ul ng-show=" items " class="{{ listClass }}">' +
      '  <li ng-repeat=" it in items " ng-class="{ {{ activeClass }}: it == ngModel.$modelValue }">' +
      '    <a href="" ng-click=" ngModel.$setViewValue(it) ">{{ it.name }}</a>' +
      '  </li>' +
      '</ul>' +
      '<p ng-hide=" items ">{{ emptyText }}</p>',

    defaults: {
      items: [],
      emptyText: 'No items found',
      activeClass: 'active',
      listClass: '',
      autoselect: false
    },

    controller: function($scope){
      var
        listCtrl = this
      ;

      listCtrl.addItem = function(item){
        $scope.items.push(item);
      };

      listCtrl.removeItem = function(item){
        _.pull($scope.items, item);
      };
    },

    link: function($scope, $element){
      $scope.ngModel = $element.controller('ngModel');

      $scope.$watch('ngModel && ( ! ngModel.$modelValue) && autoselect && items', function(items){
        if (items){
          $scope.ngModel.$setViewValue(items[Object.keys(items)[0]]);
        }
      });
    }
  });
};
},{"../utils/utils":22}],9:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    style: 'nw-modal .modal{display: block}',

    //optional full-height styles
    //TODO: consider introducing new element
    //TODO: consider relation to overlay
    //
    // nw-modal .modal-content{border-radius: 0; border: 0; height: 100%}
    // nw-modal .modal-dialog{position: fixed; width: 100%; height: 100%; margin: 0; top: 0; left: 0}

    template:
      '<div class="modal" role="dialog"><div class="modal-dialog"><div class="modal-content">' +
      '  <div class="modal-header" ng-show=" name "><h3 class="modal-title">{{ name }}</h3></div>' +
      '  <div class="modal-body">' +
      '    <content></content>' +
      '  </div>' +
      '  <div class="modal-footer" ng-show=" footer ">{{ footer }}</div>' +
      '</div></div></div>',

    defaults: {
      name: '',
      footer: ''
    }
  });
};
},{}],10:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    template:
      '<nav class="navbar navbar-{{ type }} {{ navbarClass }}" role="navigation">' +
      '  <a href="" class="navbar-brand" ng-show=" name ">{{ name }}</a>' +
      '  <content></content>' +
      '</nav>',

    defaults: {
      name: '',
      type: 'default',
      navbarClass: ''
    }
  });
};
},{}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
'use strict';

//TODO: consider renaming to <nw-section
//  (introduce & support accordion)
module.exports = function(ngWidget){
  return ngWidget({
    require: ['^nwTabs'],

    template: '<content ng-show=" active "></content>',

    defaults: {
      name: ''
    },

    link: function($scope, $element, $attrs, ctrls){
      var
        tabsCtrl = ctrls[0]
      ;

      tabsCtrl.addTab($scope);

      $scope.$on('$destroy', tabsCtrl.removeTab.bind(tabsCtrl, $scope));
    }
  });
};
},{}],13:[function(require,module,exports){
'use strict';

var
  _ = require('../utils/utils')
;

module.exports = function(ngWidget){
  return ngWidget({
    style: 'nw-tabs nw-list{display: block; margin-bottom: 1em}',

    template:
      '<nw-list items=" tabs " list-class="nav nav-tabs" ng-model=" activeTab "></nw-list>' +
      '<content></content>',

    defaults: {
      tabs: [],
      activeTab: null
    },

    controller: function($scope){
      var
        tabsCtrl = this
      ;

      tabsCtrl.addTab = function(tab){
        $scope.tabs.push(tab);
      };

      tabsCtrl.removeTab = function(tab){
        _.pull($scope.tabs, tab);
      };

      //TODO: autoselect
      $scope.$watchCollection('tabs', function(tabs){
        $scope.activeTab = $scope.activeTab || tabs[0];
      });

      $scope.$watch('activeTab', function(activeTab){
        $scope.tabs.forEach(function(tab){
          tab.active = (tab === activeTab);
        });
      });
    }
  });
};
},{"../utils/utils":22}],14:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    template: '<nw-btn icon="trash-o" ng-click=" record.$delete() "></nw-btn>',

    defaults: {
      record: {}
    }
  });
};
},{}],15:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    template:
      '<div class="form-group" ng-class=" {\'has-error\': ngModel.$dirty && ngModel.$invalid} ">' +
      '  <label ng-show=" label " class="control-label">{{ label }}</label>' +
      '  <content></content>' +
      '</div>',

    link: function($scope, $element){
      var control = $element.find('textarea, select, input:not([type="radio"]):not([type="checkbox"])');

      $scope.ngModel = control.controller('ngModel');

      control.addClass('form-control');
    }
  });
};
},{}],16:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    template: '<nw-btn icon="save" ng-click=" record.$save() "></nw-btn>',

    defaults: {
      record: {}
    }
  });
};
},{}],17:[function(require,module,exports){
'use strict';

module.exports = function(){
  return {
    restrict: 'E',
    controller: function($scope, $element, $transclude){
      $transclude($scope.$host, $element.append.bind($element));
    }
  };
};
},{}],18:[function(require,module,exports){
'use strict';

//TODO: test
try{
  var
    angular = require('angular'),
    showdown = require('showdown'),
    converter = new showdown.converter(),
    makeHtml = converter.makeHtml.bind(converter)
  ;
} catch(e){
  makeHtml = angular.identity;
}

module.exports = function($sce, $log){
  if ( ! showdown){
    $log.error('Showdown library not available.');
  }

  return function(source){
    return source && $sce.trustAsHtml(makeHtml(fixEmail(source)));
  };
};

function fixEmail(markdown){
  return markdown.replace(/<(\w+\@\w+\.\w+)>/g, '<a href="mailto:$1">$1</a>');
}
},{"angular":2,"showdown":3}],19:[function(require,module,exports){
(function (global){
'use strict';

var
  angular = require('angular')
;

module.exports = WidgetDefinition;

function WidgetDefinition(cfg){
  if ((this === global) || (this === undefined)){
    return new WidgetDefinition(cfg);
  }

  angular.extend(this, cfg);
}

WidgetDefinition.prototype = {
  restrict: 'E',
  template: '',
  transclude: true,
  scope: {},
  defaults: {},

  //actual stuff
  compile: function(){
    return {
      pre: this.prelink.bind(this),
      post: this.link && this.link.bind(this)
    };
  },

  prelink: function($scope, $element, $attrs){
    $scope.$host = $scope.$parent;
    angular.extend($scope, angular.copy(this.defaults));

    bindAttributes($scope, $attrs, this.defaults);
  }
};

function bindAttributes($scope, $attrs, defaults){
  for (var k in $attrs.$attr){
    $scope[k] = $attrs[k];

    //TODO: test (partially covered by nw-* widgets)
    //most wanted
    if (defaults[k] instanceof Object){
      $scope[k] = $scope.$parent.$eval($attrs[k]);
      $scope.$parent.$watchCollection($attrs[k], dotSet($scope, k));
      continue;
    }

    //boolean expressions
    if (typeof defaults[k] === 'boolean'){
      $scope[k] = $scope.$parent.$eval($attrs[k]);
      $scope.$parent.$watch($attrs[k], dotSet($scope, k));
      continue;
    }

    //string interpolation
    if ($attrs.$$observers && $attrs.$$observers[k]){
      $attrs.$observe(k, dotSet($scope, k));
    }
  }
}

function dotSet(obj, prop){
  return function(val){
    obj[prop] = val;
  };
}
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"angular":2}],20:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    template: '<p>{{ lipsum }}</p>',

    defaults: {
      lipsum: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    }
  });
};
},{}],21:[function(require,module,exports){
'use strict';

var angular = require('angular');

module.exports = function(selector){
  var res = [];

  [].forEach.call(this, function(el){
    res.push.apply(res, [].slice.call(el.querySelectorAll(selector)));
  });

  return angular.element(res);
};
},{"angular":2}],22:[function(require,module,exports){
'use strict';

module.exports = {
  pull: function(arr, item){
    var idx = arr.indexOf(item);

    return (~idx) && arr.splice(idx, 1);
  }
};
},{}]},{},[1])