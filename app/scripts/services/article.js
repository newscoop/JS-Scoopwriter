'use strict';

angular.module('authoringEnvironmentApp')
    .service('article', ['$resource', 'configuration', '$q', function article($resource, configuration, $q) {

        var langMap = {
            1: ['English', 'en'],
            2: ['Romanian', 'ro'],
            5: ['German', 'de'],
            7: ['Croatian', 'hr'],
            9: ['Portuguese Portugal', 'pt'],
            10: ['Serbian Cyrillic', 'sr'],
            11: ['Serbian Latin', 'sh'],
            12: ['French', 'fr'],
            13: ['Spanish', 'es'],
            15: ['Russian', 'ru'],
            16: ['Chinese Simplified', 'zh'],
            17: ['Arabic', 'ar'],
            18: ['Swedish', 'sv'],
            19: ['Korean', 'ko'],
            20: ['Dutch', 'nl'],
            22: ['Belarus', 'be'],
            23: ['Georgian', 'ka'],
            24: ['Chinese Traditional', 'zh_TW'],
            25: ['Polish', 'pl'],
            26: ['Greek', 'el'],
            27: ['Hebrew', 'he'],
            28: ['Bangla', 'bn'],
            29: ['Czech', 'cs'],
            30: ['Italian', 'it'],
            31: ['Portuguese Brazil', 'pt_BR'],
            32: ['Albanian', 'sq'],
            33: ['Turkish', 'tr'],
            34: ['Ukrainian', 'uk'],
            35: ['English Britain', 'en_GB'],
            36: ['Kurdish', 'ku'],
            37: ['German Austria', 'de_AT']
        };

        // all possible values for the commenting setting
        var commenting = Object.freeze({
            ENABLED: 0,
            DISABLED: 1,
            LOCKED: 2
        });

        var resource = $resource(
            configuration.API.full + '/articles/:articleId?language=:language', {
                articleId: '',
                language: 'en'
            }, {
                query: {
                    method: 'GET',
                    isArray: true
                },
                save: {
                    url: configuration.API.full + '/articles/:articleId/:language',
                    method: 'PATCH'
                }
            });

        var deferred = $q.defer();
        
        return {
            commenting: commenting,
            modified: false,
            resource: resource,
            promise: deferred.promise,
            init: function(par) {
                var service = this;
                resource.get(par).$promise.then(function(data) {
                    deferred.resolve(data);
                    service.init = function() {}; // ignore successive calls
                });
            }
        };
    }]);
