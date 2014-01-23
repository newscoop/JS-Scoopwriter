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
            function finish(html) {
                service.html = html;
                $(selector).modal('show');
                service.visible = true;
            }
            this.title = opt.title; // could also be undefined
            // see also https://github.com/angular-ui/bootstrap/blob/master/src/modal/modal.js
            var html = $templateCache.get(opt.templateUrl);
            if (html) {
                // the cache returns an array
                finish(html[1]);
            } else {
                $http
                    .get(opt.templateUrl, {cache: $templateCache})
                    .success(function (html) {
                        finish(html);
                    });
            }
        };
        this.hide = function() {
            this.visible = false;
            $(selector).modal('hide');
        };
    }]);
