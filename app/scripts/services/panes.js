'use strict';

angular.module('authoringEnvironmentApp')
  .factory('panes', function ($filter) {
    // Service logic
    // ...

    var panes = [{
        name: "Topics",
        icon:'chat',
        template: 'views/pane-topics.html',
        position: 'right',
        active: false,
        selected: true
    }, {
        name: "Images",
        icon:'media',
        template: 'views/pane-draggable.html',
        position: 'left',
        active: false,
        selected: true
    }, {
        name: "Snippets",
        icon:'embeds',
        template: 'views/pane-embed.html',
        position: 'left',
        active: false,
        selected: true
    }, {
        name: 'Comments',
        icon:'comments',
        template: 'views/pane-comments.html',
        position: 'left',
        active: false,
        selected: true
    }];

    panes.layout = {
      right: false,
      left: false
    };

    panes.articleClass = '';
      
    function classFromLayout(layout) {
        var c = '';
        angular.forEach(layout, function(value, key) {
            if (value) {
                c += 'shrink-'+key+' ';
            }
        });
        return c;
    };

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
        panes.articleClass = classFromLayout(panes.layout);
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
        return {
          left: l>0 ? true : false,
          right: r>0 ? true : false
        };
      }
    };
  });
