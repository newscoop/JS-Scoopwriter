'use strict';

/**
* AngularJS service implementing the article model.
*
* @class article
*/
angular.module('authoringEnvironmentApp').service('article', [
    '$resource',
    '$q',
    '$http',
    'configuration',
    function article($resource, $q, $http, configuration) {

        var commenting,
            deferred = $q.defer(),
            issueWfStatus,
            langMap,
            resource,
            unicodeWords = new XRegExp('(\\p{Letter}|\\d)+', 'g'),
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
                    // XXX: should be the patcharticle path, but there is a bug
                    // in Routing object, thus we use another path that
                    // gives us the same result
                        'newscoop_gimme_articles_getarticle', {}, true
                    ) + '/:articleId/:language',
                    method: 'PATCH'
                }
            }
        );

        /**
        * Finds snippets placeholders in text and converts them to
        * snippets HTML (this can be later converted to Aloha blocks).
        *
        * An example of such placeholder:
        *     <-- Snippet 1234 -->
        *
        * @function snippetCommentsToDivs
        * @param text {String} text to convert
        * @return {String} converted text
        */
        function snippetCommentsToDivs(text) {
            if (text === null) {
                return text;
            }
            // the extra backslash (\) is because of Javascript being picky
            var snippetRex  = '<--';     // exact match
            snippetRex     += '\\s';      // single whitespace
            snippetRex     += 'Snippet';  // exact match
            snippetRex     += '\\s';      // single whitespace
            snippetRex     += '([\\d]+)'; // capture group 1, 1 or more digits
            snippetRex     += '(';               // capture group 2
            snippetRex     +=     '(';           // capture group 3
            snippetRex     +=         '[\\s]+';  // at least 1 whitespace
            snippetRex     +=         '(align';  // alternating capture group
            snippetRex     +=         '|\\w+)';  // or any other word
            snippetRex     +=         '\\s*';    // optional whitespace
            snippetRex     +=         '=';       // exact match
            snippetRex     +=         '\\s*';    // optional whitespace
            snippetRex     +=         '(';          // capture group 4
            snippetRex     +=             '"[^"]*"';  // anything except "
            snippetRex     +=             '|[^\\s]*'; // anything but whitesp.
            snippetRex     +=         ')';         // end capture group 4
            snippetRex     +=     ')*';    // end capture group 3 (0 or more)
            snippetRex     += ')';       // end capture group 2
            snippetRex     += '[\\s]*';  // optional whitespace
            snippetRex     += '-->';      // exact match
            var snippetPattern = new RegExp(snippetRex, 'ig');

            var converted = text.replace(snippetPattern, function(whole, id) {
                var output = '<div class="snippet" data-id="';
                output += parseInt(id);
                output += '"></div>';
                return output;
            });
            return converted;
        }

        /**
        * Finds images placeholders in text and converts them to
        * images HTML (thiscan be later converted to Aloha blocks).
        *
        * An example of such placeholder:
        *     <** Image 1234 float="left" size="small" **>
        *
        * @function imageCommentsToDivs
        * @param text {String} text to convert
        * @return {String} converted text
        */
        function imageCommentsToDivs(text) {
            if (text === null) {
                return text;
            }
            // the extra backslash (\) is because of Javascript being picky
            var imageReg  = '<';         // exact match
            imageReg     += '\\*\\*';    // exact match on **
            imageReg     += '[\\s]*';    // optional whitespace
            imageReg     += 'Image';     // exact match
            imageReg     += '[\\s]+';    // whitespace
            imageReg     += '([\\d]+)';  // capture group 1, number
            imageReg     += '(';         // capture group 2
            imageReg     +=     '(';       // capture group 3, 0 to unlimited
            imageReg     +=         '[\\s]+';  // optional whitespace
            imageReg     +=         '(align|alt|sub';  // alternating capt. gr.
            imageReg     +=         '|width|height|ratio';
            imageReg     +=         '|\\w+)';  // or any word, end of group
            imageReg     +=         '\\s*';    // optional whitespace
            imageReg     +=         '=';       // exact match
            imageReg     +=         '\\s*';    // optional whitespace
            imageReg     +=         '(';       // capture group 4
            imageReg     +=             '"[^"]*"';  // anything except "
            imageReg     +=             '|[^\\s]*'; // anything but whitespace
            imageReg     +=         ')';       // end capture group 4
            imageReg     +=     ')*';        //end capture group 3 (0 or more)
            imageReg     += ')';           // end capture group 2
            imageReg     += '[\\s]*';      // optional whitespace
            imageReg     += '\\*\\*';      // exact match on **
            imageReg     += '>';           // exact match
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
        }

        /**
        * Converts placeholders in text to images and snippets HTML.
        *
        * @method deserializeAlohaBlocks
        * @param text {String} text to convert
        * @return {String} converted text
        */
        function deserializeAlohaBlocks(text) {
            return imageCommentsToDivs(snippetCommentsToDivs(text));
        }

        /**
        * Converts images' and snippets' HTML in article text (Aloha blocks) to
        * special placeholders, allowing to later convert those placeholders
        * back to original content.
        *
        * @method serializeAlohaBlocks
        * @param type {String} the type of Aloha blocks to search for and
        *   convert ('snippet' or 'image')
        * @param text {String} text to convert
        * @return {String} converted text
        */
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

        /**
        * Saves all changes in article content to the server.
        *
        * @method save
        * @param articleObj {Object} object with all article data
        * @return {Object} promise object.
        */
        // XXX: get rid of explicitly passing the articleObj
        function save(articleObj) {
            var deferred = $q.defer(),
                postData = angular.copy(articleObj),
                serialized;

            // serialize objects (images, snippets) in all article fields
            Object.keys(postData.fields).forEach(function (key) {
                serialized = serializeAlohaBlocks(
                    'image', postData.fields[key]
                );
                postData.fields[key] = serializeAlohaBlocks(
                    'snippet', serialized
                );
            });

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

        /**
        * Saves current values of article's switches to the server.
        *
        * @method saveSwitches
        * @param articleObj {Object} object with article data
        * @param switchNames {Array} list of article field names of type switch
        * @return {Object} promise object
        */
        // XXX: get rid of explicitly passing articleObj and switchNames
        function saveSwitches(articleObj, switchNames) {
            var deferred = $q.defer(),
                postData = {
                    fields: {}
                };

            switchNames.forEach(function (name) {
                postData.fields[name] = articleObj.fields[name];
            });

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
            saveSwitches: saveSwitches,
            // XXX: this deserialization shouldn't be public...?
            // Should be hidden here in this service to simplify ArticleCtrl
            deserializeAlohaBlocks: deserializeAlohaBlocks,

            /**
            * Retrieves article from the server and initializes the service
            * with article data.
            * NOTE: any successive calls to the method after initialization
            * have no effect.
            *
            * @method init
            * @param articleQuery {Object} which article to retrieve
            *   @param articleQuery.articleId {Number} article's ID
            *   @param articleQuery.number {String} article's language code
            */
            init: function (articleQuery) {
                var service = this;
                resource.get(articleQuery).$promise.then(function (data) {
                    service.articleId = parseInt(data.number);
                    service.language = data.language;
                    service.init = function () {
                        // ignore successive calls (by not doing anything)
                    };
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

                url = Routing.generate(
                    'newscoop_gimme_articles_changearticlestatus',
                    {
                        number: this.articleId,
                        language: this.language,
                        status: status
                    },
                    true
                );

                promise = $http({
                    method: 'PATCH',
                    url: url
                });
                return promise;
            },

            /**
            * Returns the number of characters and the number of
            * words in a string.
            *
            * @method textStats
            * @param text {String} text for which to calculate the stats
            * @return {Object} text statistics (e.g. {chars: 15, words:4})
            */
            textStats: function (text) {
                var match,
                    stats = {};

                if (text) {
                    text = $('<div/>').html(text).text();  // strip HTML
                    stats.chars = text.length;

                    match = text.match(unicodeWords);
                    stats.words = match ? match.length : 0;
                } else {
                    stats.chars = 0;
                    stats.words = 0;
                }
                return stats;
            }
        };
    }
]);
