'use strict';

/**
* A factory which creates a Newscoop image model (representing an image in
* Newscoop).
*
* NOTE: Image is the name of the built in native object, thus the "Nc" prefix.
*
* @class NcImage
*/
angular.module('authoringEnvironmentApp').factory('NcImage', [
    '$http',
    '$q',
    function ($http, $q) {
        var NcImage;

        /**
        * NcImage constructor function.
        *
        * @function NcImage
        * @param data {Object} object containing initial image data
        *   (NOTE: irrelevant keys are ignored)
        */
        NcImage = function (data) {
            var that = this,
                relevantKeys;

            relevantKeys  = [
                'id', 'basename', 'thumbnailPath', 'description',
                'photographer', 'photographerUrl'
            ];

            data = data || {};
            relevantKeys.forEach(function (key) {
                that[key] = data[key];
            });

            // API data contains the width and the height as strings
            that.width = ('width' in data) ?
                parseInt(data.width, 10) : undefined;

            that.height = ('height' in data) ?
                parseInt(data.height, 10) : undefined;
        };

        /**
        * Retrieves a specific Newscoop image from the server.
        *
        * @method getById
        * @param id {Number} image ID
        * @return {Object} promise object which is resolved with a new NcImage
        *   instance on success and rejected with server error message on
        *   failure
        */
        NcImage.getById = function (id) {
            var deferredGet = $q.defer();

            $http.get(
                Routing.generate(
                    'newscoop_gimme_images_getimage', {number: id}, true
                )
            ).success(function (response) {
                deferredGet.resolve(new NcImage(response));
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return deferredGet.promise;
        };

        /**
        * Retrieves a single page of images from the server, optionally
        * filtered by the given search string.
        * The returned array of search results has a special $promise property
        * which is resolved or rejected depending on the server response.
        *
        * @method query
        * @param page {Number} index of the results page to load
        *     (NOTE: page indices start with 1)
        * @param itemsPerPage {Number} desired page size (the number of
        *   items in a single search results page)
        * @param [searchFilter] {String} Optional search term. If not given,
        *   no images on the server are exluded from the search.
        * @return {Object} "future" array of NcImage objects - initially
        *   an empty array is returned, which is later populated with the
        *   actual data (once the http promise has been successfully resolved)
        */
        NcImage.query = function (page, itemsPerPage, searchFilter) {
            var deferredGet = $q.defer(),
                requestOptions,
                results = [],
                url;

            results.$promise = deferredGet.promise;

            requestOptions = {
                params: {
                    expand: true,
                    items_per_page: itemsPerPage,
                    page: page
                }
            };

            if (searchFilter) {
                requestOptions.params.query = searchFilter;
            }

            url = Routing.generate(
                'newscoop_gimme_images_searchimages', {}, true);

            $http.get(url, requestOptions)
            .success(function (response) {
                response = response || {};
                if (response.items) {
                    response.items.forEach(function (item) {
                        item = new NcImage(item);
                        results.push(item);
                    });
                }
                deferredGet.resolve({
                    items: results,
                    pagination: response.pagination
                });
            })
            .error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return results;
        };

        /**
        * Retrieves a list of all images attached to a specific article.
        * Returned array has a special $promise property which is resolved or
        * rejected depending on the server response.
        *
        * @method getAllByArticle
        * @param articleId {Number} article ID
        * @param language {String} article language code, e.g. 'de'
        * @return {Object} "future" array of NcImage objects - initially
        *   an empty array is returned, which is later populated with the
        *   actual data (once the http promise has been successfully resolved)
        */
        NcImage.getAllByArticle = function (articleId, language) {
            var deferredGet = $q.defer(),
                requestOptions,
                images = [];

            images.$promise = deferredGet.promise;

            requestOptions = {
                params: {
                    expand: true,
                    items_per_page: 99999  // de facto "all"
                }
            };

            $http.get(
                Routing.generate(
                    'newscoop_gimme_images_getimagesforarticle',
                    {number: articleId, language: language},
                    true
                ),
                requestOptions
            ).success(function (response) {
                if (response.items) {
                    response.items.forEach(function (item) {
                        item = new NcImage(item);
                        images.push(item);
                    });
                }
                deferredGet.resolve(images);
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return images;
        };

        /**
        * Attaches one or more images to an article.
        *
        * @method addAllToArticle
        * @param articleId {Number} article ID
        * @param articleLang {String} article language code (e.g. 'de')
        * @param images {Array} list of images (NcImage instances) to attach
        * @return {Object} promise object that is resolved on successful server
        *   response and rejected on server error response
        */
        NcImage.addAllToArticle = function (articleId, articleLang, images) {
            var deferred = $q.defer(),
                linkHeader = [];

            images.forEach(function (item) {
                linkHeader.push(
                    '<' +
                    Routing.generate(
                        'newscoop_gimme_images_getimage',
                        {'number': item.id},
                        false
                    ) +
                    '; rel="image">'
                );
            });
            linkHeader = linkHeader.join(',');

            $http({
                url: Routing.generate(
                    'newscoop_gimme_articles_linkarticle',
                    {number: articleId, language: articleLang},
                    true
                ),
                method: 'LINK',
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

        /**
        * Updates image's description.
        *
        * @method updateDescription
        * @param newDesc {String} new description of the image
        * @return {Object} promise object which is resolved on success and
        *   rejected with server error message on failure
        */
        NcImage.prototype.updateDescription = function (newDesc) {
            var deferredPatch = $q.defer(),
                params,
                self = this,
                url;

            url = Routing.generate(
                'newscoop_gimme_images_updateimage',
                {number: self.id},
                true
            );

            params = {
                number: self.id,
                image: {
                    description: newDesc
                }
            };

            $http({
                method: 'PATCH',
                url: url,
                data: params
            })
            .success(function (response) {
                self.description = newDesc;
                deferredPatch.resolve();
            }).error(function (responseBody) {
                deferredPatch.reject(responseBody);
            });

            return deferredPatch.promise;
        };

        /**
        * Detaches the image from an article.
        *
        * @method removeFromArticle
        * @param articleId {Number} article ID
        * @param language {String} article language code (e.g. 'de')
        * @return {Object} promise object that is resolved on successful server
        *   response and rejected on server error response
        */
        NcImage.prototype.removeFromArticle = function(articleId, language) {
            var self = this,
                deferred = $q.defer(),
                linkHeader;

            linkHeader = '<' +
                Routing.generate(
                    'newscoop_gimme_images_getimage',
                    {number: self.id},
                    false
                ) +
                '; rel="image">';

            $http({
                url: Routing.generate(
                    'newscoop_gimme_articles_unlinkarticle',
                    {number: articleId, language: language},
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

        return NcImage;
    }
]);
