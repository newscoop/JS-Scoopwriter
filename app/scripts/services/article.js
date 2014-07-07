'use strict';
angular.module('authoringEnvironmentApp').service('article', [
    '$resource',
    '$q',
    '$http',
    'configuration',
    function article($resource, $q, $http, configuration) {

        var API_ROOT = configuration.API.full,
            commenting,
            deferred = $q.defer(),
            langMap,
            resource,
            wfStatus;

        langMap = {
            1: [
                'English',
                'en'
            ],
            2: [
                'Romanian',
                'ro'
            ],
            5: [
                'German',
                'de'
            ],
            7: [
                'Croatian',
                'hr'
            ],
            9: [
                'Portuguese Portugal',
                'pt'
            ],
            10: [
                'Serbian Cyrillic',
                'sr'
            ],
            11: [
                'Serbian Latin',
                'sh'
            ],
            12: [
                'French',
                'fr'
            ],
            13: [
                'Spanish',
                'es'
            ],
            15: [
                'Russian',
                'ru'
            ],
            16: [
                'Chinese Simplified',
                'zh'
            ],
            17: [
                'Arabic',
                'ar'
            ],
            18: [
                'Swedish',
                'sv'
            ],
            19: [
                'Korean',
                'ko'
            ],
            20: [
                'Dutch',
                'nl'
            ],
            22: [
                'Belarus',
                'be'
            ],
            23: [
                'Georgian',
                'ka'
            ],
            24: [
                'Chinese Traditional',
                'zh_TW'
            ],
            25: [
                'Polish',
                'pl'
            ],
            26: [
                'Greek',
                'el'
            ],
            27: [
                'Hebrew',
                'he'
            ],
            28: [
                'Bangla',
                'bn'
            ],
            29: [
                'Czech',
                'cs'
            ],
            30: [
                'Italian',
                'it'
            ],
            31: [
                'Portuguese Brazil',
                'pt_BR'
            ],
            32: [
                'Albanian',
                'sq'
            ],
            33: [
                'Turkish',
                'tr'
            ],
            34: [
                'Ukrainian',
                'uk'
            ],
            35: [
                'English Britain',
                'en_GB'
            ],
            36: [
                'Kurdish',
                'ku'
            ],
            37: [
                'German Austria',
                'de_AT'
            ]
        };

        // all possible values for the commenting setting
        commenting = Object.freeze({
            ENABLED: 0,
            DISABLED: 1,
            LOCKED: 2
        });

        // all possible values for the article workflow status
        wfStatus = Object.freeze({
            NEW: 'N',
            SUBMITTED: 'S',
            PUBLISHED: 'Y',
            PUBLISHED_W_ISS: 'M'
        });

        resource = $resource(Routing.generate('newscoop_gimme_articles_getarticle', {}, true) + '/:articleId?language=:language', {
            articleId: '',
            language: 'en'
        }, {
            query: {
                method: 'GET',
                isArray: true
            },
            save: {
                url: Routing.generate('newscoop_gimme_articles_getarticle', {}, true) + '/:articleId/:language',
                method: 'PATCH'
            }
        });

        return {
            commenting: commenting,
            wfStatus: wfStatus,
            modified: false,
            resource: resource,
            promise: deferred.promise,
            init: function (par) {
                var service = this;
                resource.get(par).$promise.then(function (data) {
                    service.articleId = data.number;
                    service.language = data.language;
                    service.init = function () {
                    };
                    // ignore successive calls
                    deferred.resolve(data);
                });
            },

            /**
            * Changes the value of the article's commenting setting and updates
            * it on the server.
            *
            * @method changeCommentingSetting
            * @param newValue {Number} New value of the article commenting setting.
            *       Should be one of the values from article.commenting object.
            * @return {Object} promise object.
            */
            changeCommentingSetting: function (newValue) {
                var apiParams, service = this;
                apiParams = {
                    comments_enabled: newValue === commenting.ENABLED ? 1 : 0,
                    comments_locked: newValue === commenting.LOCKED ? 1 : 0
                };
                return resource.save({
                    articleId: service.articleId,
                    language: service.language
                }, apiParams).$promise;
            },

            /**
            * Updates article's workflow status on the server.
            *
            * @method setWorkflowStatus
            * @param status {String} article's new workflow status
            * @return {Object} the underlying $http object's promise
            */
            setWorkflowStatus: function (status) {
                var promise,
                    url;

                url = [
                    API_ROOT, 'articles', this.articleId, this.language, status
                ].join('/');

                promise = $http({
                    method: 'PATCH',
                    url: url
                });
                return promise;
            }
        };
    }
]);