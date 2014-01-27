'use strict';

angular.module('authoringEnvironmentApp')
    .service('modal',
             ['$templateCache', '$log', '$http',
              function modal($templateCache, $log, $http) {
        // AngularJS will instantiate a singleton by calling "new" on this function
        var selector = '#myModal';
        var service = this;
        this.html = '';
        this.visible = false;
        this.show = function(opt) {
            this.title = opt.title; // could also be undefined
            this.url = opt.templateUrl;
            $(selector).modal('show');
            service.visible = true;
        };
        this.hide = function() {
            this.visible = false;
            $(selector).modal('hide');
        };
    }]);
