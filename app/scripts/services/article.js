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
            issueWfStatus,
            langMap,
            resource,
            wfStatus;

        langMap = {
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

        // all possible values for the article issue workflow status
        issueWfStatus = Object.freeze({
            NOT_PUBLISHED: 'N',
            PUBLISHED: 'Y'
        });

        resource = $resource(
            Routing.generate('newscoop_gimme_articles_getarticle', {}, true) +
                '/:articleId?language=:language',
            {articleId: '', language: 'en'},
            {
                query: {
                    method: 'GET',
                    isArray: true
                },
                save: {
                    url: Routing.generate(
                        'newscoop_gimme_articles_getarticle', {}, true
                    ) + '/:articleId/:language',
                    method: 'PATCH'
                }
            }
        );

        // helper function:
        // Convert the Snippet comments into divs so that Aloha can process them
        function snippetCommentsToDivs(text) {
            if (text === null) {
                return text;
            }
                                            // the extra backward slash (\) is because of Javascript being picky
            var snippetRex  = '<--';     // exact match
            snippetRex     += '\\s';      // single whitespace
            snippetRex     += 'Snippet';  // exact match
            snippetRex     += '\\s';      // single whitespace
            snippetRex     += '([\\d]+)'; // capture group 1, match 1 or more digits (\d)
            snippetRex     += '(';                           // capture group 2
            snippetRex     +=     '(';                       // capture group 3, 0 to unlimited
            snippetRex     +=         '[\\s]+';              // match whitespace 1 to unlimited
            snippetRex     +=         '(align';              // alternating capture group
            snippetRex     +=         '|\\w+)';              // or any word longer then 1 to unlimited, end of alternating
            snippetRex     +=         '\\s*';                // match whitespace 0 to unlimited
            snippetRex     +=         '=';                   // exact match
            snippetRex     +=         '\\s*';                // match whitespace 0 to unlimited
            snippetRex     +=         '(';                   // capture group 4
            snippetRex     +=             '"[^"]*"';         // capture anything except ", 0 to unlimited characters
            snippetRex     +=             '|[^\\s]*';        // capture anything except whitespace, 0 to unlimited
            snippetRex     +=         ')';                   // end capture group 4
            snippetRex     +=     ')*';                      // end capture group 3, 0 to unlimited
            snippetRex     += ')';                           // end capture group 2
            snippetRex     += '[\\s]*';                      // match whitespace 0 to unlimited
            snippetRex     += '-->';      // exact match
            var snippetPattern = new RegExp(snippetRex, 'ig');

            var converted = text.replace(snippetPattern, function(whole, id) {
                var output = '';
                if (id !== undefined) {
                    output += '<div class="snippet" data-id="'+parseInt(id)+'"';
                    output += '></div>';
                }
                return output;
            });
            return converted;
        }

        // helper function:
        // Convert the Image comments into divs for Aloha
        // example: <** Image 1234 float="left" size="small" **>
        function imageCommentsToDivs(text) {
            if (text === null) {
                return text;
            }
                                                           // the extra backward slash (\) is because of Javascript being picky
            var imageReg  = '<';                          // exact match
            imageReg     += '\\*\\*';                      // exact match on **
            imageReg     += '[\\s]*';                      // match whitespace 0 to unlimited
            imageReg     += 'Image';                       // exact match
            imageReg     += '[\\s]+';                      // match whitespace 1 to unlimited
            imageReg     += '([\\d]+)';                    // capture digit 1 to unlimited
            imageReg     += '(';                           // capture group 2
            imageReg     +=     '(';                       // capture group 3, 0 to unlimited
            imageReg     +=         '[\\s]+';              // match whitespace 1 to unlimited
            imageReg     +=         '(align|alt|sub';      // alternating capture group
            imageReg     +=         '|width|height|ratio';
            imageReg     +=         '|\\w+)';              // or any word longer then 1 to unlimited, end of alternating
            imageReg     +=         '\\s*';                // match whitespace 0 to unlimited
            imageReg     +=         '=';                   // exact match
            imageReg     +=         '\\s*';                // match whitespace 0 to unlimited
            imageReg     +=         '(';                   // capture group 4
            imageReg     +=             '"[^"]*"';         // capture anything except ", 0 to unlimited characters
            imageReg     +=             '|[^\\s]*';        // capture anything except whitespace, 0 to unlimited
            imageReg     +=         ')';                   // end capture group 4
            imageReg     +=     ')*';                      // end capture group 3, 0 to unlimited
            imageReg     += ')';                           // end capture group 2
            imageReg     += '[\\s]*';                      // match whitespace 0 to unlimited
            imageReg     += '\\*\\*';                      // exact match on **
            imageReg     += '>';                           // exact match
            var imagePattern = new RegExp(imageReg, 'ig');

            var converted = text.replace(
                imagePattern,
                function(whole, imageId, imageAttributes) {
                    var imageDiv = '<div class="image" dropped-image ' +
                        'data-id="' + imageId + '"';
                    var tmpElement = document.createElement('div');
                    tmpElement.innerHTML = '<div '+imageAttributes+'></div>';
                    var attributes = tmpElement.childNodes[0].attributes;

                    for (var i = 0; i < attributes.length; i++) {
                        imageDiv += ' data-' + attributes[i].name +
                            '="'+attributes[i].value + '"';
                    }

                    imageDiv += '></div>';
                    return imageDiv;
                }
            );
            return converted;
        }  // end function imageCommentsToDivs

        // TODO: tests, better comments etc.
        // deserialize placeholders in article text to snippets and images divs
        function deserializeAlohaBlocks(text) {
            return imageCommentsToDivs(snippetCommentsToDivs(text));
        }

        // converts images' and snippets' HTML in text to special
        // placeholder comments
        // TODO: tests, comments
        function serializeAlohaBlocks(type, text) {
            var content,
                matches,
                sep;

            if ((type !== 'snippet' && type !== 'image') || text === null) {
                return text;
            }

            sep = {snippet: '--', image: '**'};
            content = $('<div/>').html(text);

            matches = content.contents().filter('div.' + type);

            // replace each matching div with its serialized version
            matches.replaceWith(function() {
                var serialized,
                    $match = $(this);

                serialized = [
                    '<', sep[type], ' ',
                    type.charAt(0).toUpperCase(), type.slice(1), ' ',
                    parseInt($match.data('id'), 10)
                ];

                $.each($match.data(), function (name, value) {
                    if (name !== 'id') {
                        serialized.push(' ', name, '="', value, '"');
                    }
                });

                serialized.push(' ', sep[type], '>');
                return serialized.join('');
            });

            return content.html()
                .replace(/\&lt\;\*\*/g,'<**')   // replace &lt;** with <**
                .replace(/\*\*\&gt\;/g, '**>')  // replace **&gt; with **>
                .replace(/\&lt\;\-\-/g,'<--')   // replace &lt;-- with <--
                .replace(/\-\-\&gt\;/g, '-->'); // replace --&gt; with -->
        }

        // TODO: comments & tests
        // XXX: get rid of explicitly passing the articleObj
        function save(articleObj) {
            var deferred = $q.defer(),
                key,
                postData = angular.copy(articleObj),
                serialized;

            // serialize objects (images, snippets) in all article fields
            for (key in postData.fields) {
                if (postData.fields.hasOwnProperty(key)) {
                    serialized = serializeAlohaBlocks(
                        'image', postData.fields[key]
                    );
                    postData.fields[key] = serializeAlohaBlocks(
                        'snippet', serialized
                    );
                }
            }

            resource.save({
                articleId: articleObj.number,
                language: articleObj.language
            }, postData,
            function () {
                deferred.resolve();
            }, function () {
                deferred.reject();
            });

            return deferred.promise;
        }


        return {
            commenting: commenting,
            wfStatus: wfStatus,
            issueWfStatus: issueWfStatus,
            modified: false,
            resource: resource,
            promise: deferred.promise,
            save: save,
            // XXX: this deserialization shouldn't be public...?
            deserializeAlohaBlocks: deserializeAlohaBlocks,

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
            * @param newValue {Number} New value of the article commenting
            *   setting. Should be one of the values from article.commenting
            *   object.
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
