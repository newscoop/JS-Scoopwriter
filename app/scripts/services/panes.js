'use strict';

angular.module('authoringEnvironmentApp')
  .factory('panes', function () {
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
        panes.forEach(function (p) {
          if (p.position == pane.position) {
            if (p == pane) {
              pane.active = !pane.active;
            } else {
              p.active = false;
            }
          }
        });
        panes.layout = this.layout();
      },
      layout: function () {
        var l = false, r = false, res = [];
        panes.forEach(function(p) {
          if (p.active) {
            switch (p.position) {
            case 'right':
              r = true;
              break;
            case 'left':
              l = true;
              break;
            default:
              $log.debug('pane has unkonw position: '+p.position);
            };
          }});
        if (l) {
          res.push('shrink-left');
        }
        if (r) {
          res.push('shrink-right');
        }
        return res.join(' ');
      }
    };
  });
