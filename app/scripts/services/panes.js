'use strict';

angular.module('authoringEnvironmentApp')
  .factory('panes', function ($filter) {
    // Service logic
    // ...

    var panes = [{
        name: "Topics",
        icon:'chat',
        template: 'views/pane-topics.html',
        position: 'left',
        active: false,
        selected: true
    }, {
        name: "Draggable",
        icon:'chat',
        template: 'views/pane-draggable.html',
        position: 'left',
        active: false,
        selected: true
    }, {
        name: "Draggable",
        icon:'chat',
        template: 'views/pane-draggable.html',
        position: 'right',
        active: false,
        selected: true
    }];

    panes.layout = [];

    // Public API here
    return {
      query: function () {
        return panes;
      },
      active: function (pane) {
        $filter('filter')(panes, {
          position: pane.position
        }).forEach(function (p) {
          if (p == pane) {
            pane.active = !pane.active;
          } else {
            p.active = false;
          }
        });
        panes.layout = this.layout();
      },
      layout: function () {
        var l = $filter('filter')(panes, {
          position:'left',
          active: true
        }).length;
        var r = $filter('filter')(panes, {
          position:'right',
          active: true
        }).length;
        var res = [];
        if (l > 0) {
          res.push('shrink-left');
        }
        if (r > 0) {
          res.push('shrink-right');
        }
        return res.join(' ');
      }
    };
  });
