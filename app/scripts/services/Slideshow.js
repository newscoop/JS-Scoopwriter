'use strict';

/**
* A factory which creates an article slideshow model.
*
* @class Slideshow
*/
angular.module('authoringEnvironmentApp').factory('Slideshow', [
    '$http',
    '$q',
    function (
        $http,
        $q
    ) {
        // slideshow constructor
        var Slideshow = function () {};

        /**
        * Converts raw data object to a Slideshow instance.
        *
        * @method createFromApiData
        * @param data {Object} raw object containing slideshow data
        * @return {Object} created Slideshow instance
        */
        Slideshow.createFromApiData = function (data) {
            var slideshow = new Slideshow();

            slideshow.id = parseInt(data.id);
            slideshow.title = data.title;
            slideshow.itemsCount = parseInt(data.itemsCount);
            if (data.items !== undefined && data.items.length > 0) {
                slideshow.cover = data.items[0].link;
                slideshow.type = data.items[0].type;
            }

            return slideshow;
        };

        /**
        * Retrieves a list of all slideshows assigned to a specific article.
        *
        * Initially, an empty array is returned, which is later filled with
        * data on successful server response. At that point the given promise
        * is resolved (exposed as a $promise property of the returned array).
        *
        * @method getAllByArticle
        * @param number {Number} article ID
        * @param language {String} article language code, e.g. 'de'
        * @return {Object} array of article slideshows
        */
        Slideshow.getAllByArticle = function (number, language) {
            var slideshows = [],
                deferredGet = $q.defer(),
                url;

            slideshows.$promise = deferredGet.promise;

            url = Routing.generate(
                'newscoop_gimme_articles_slideshows',
                {number: number, language: language},
                true
            );

            $http.get(url)
            .success(function (response) {
                response.items.forEach(function (item) {
                    item = Slideshow.createFromApiData(item);
                    slideshows.push(item);
                });
                deferredGet.resolve();
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return slideshows;
        };

        /**
        * Unassignes sldieshow from article.
        *
        * @method removeFromArticle
        * @param number {Number} article ID
        * @param language {String} article language code (e.g. 'de')
        * @return {Object} promise object that is resolved on successful server
        *   response and rejected on server error response
        */
        Slideshow.prototype.removeFromArticle = function(number, language) {
            var slideshow = this,
                deferred = $q.defer(),
                linkHeader;

            linkHeader = [
                '<',
                Routing.generate(
                    'newscoop_gimme_slideshows_getslideshowitems',
                    {id: slideshow.id},
                    false
                ),
                '; rel="slideshow">'
            ].join('');

            $http({
                url: Routing.generate(
                    'newscoop_gimme_articles_unlinkarticle',
                    {number: number, language:language},
                    true
                ),
                method: 'UNLINK',
                headers: {link: linkHeader}
            })
            .success(function () {
                deferred.resolve();
            })
            .error(function (responseBody) {
                deferred.reject(responseBody);
            });

            return deferred.promise;
        };

        return Slideshow;
    }
]);
