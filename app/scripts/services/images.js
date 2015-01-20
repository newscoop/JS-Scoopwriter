'use strict';
angular.module('authoringEnvironmentApp').service('images', [
    'pageTracker',
    '$log',
    'article',
    'getFileReader',
    'formDataFactory',
    'imageFactory',
    'NcImage',
    '$rootScope',
    '$q',
    function images(
        pageTracker, $log, articleService,
        getFileReader, formDataFactory, imageFactory, NcImage,
        $rootScope, $q
    ) {
        var loadAttachedDeferred,
            self = this,
            ITEMS_PER_PAGE_DEFAULT = 50;

        /**
        * Fetches and displays the first page of results using the given search
        * filter. Search filter is remembered for subsequent fetching of
        * additional pages.
        * NOTE: for users' convenience, an additional page is fetched (if
        * available) after a successful server response.
        *
        * @method query
        * @param filter {String} search term by which to filter results.
        *     Empty string is interpreted as "no filtering".
        */
        self.query = function (filter) {
            self.searchFilter = filter;

            // not so pretty, but it's the fastest way to clear an Array
            while(self.displayed.length > 0) {
                self.displayed.pop();
            }
            while(self.loaded.length > 0) {
                self.loaded.pop();
            }
            self.tracker.reset();
            self.itemsFound = 0;
            self.canLoadMore = false;

            self.load(
                self.tracker.next(), self.searchFilter
            ).then(function (data) {
                self.displayed = data.items;

                if (data.pagination) {
                    self.itemsPerPage = data.pagination.itemsPerPage;
                    self.itemsFound = data.pagination.itemsCount;
                } else {
                    self.itemsPerPage = ITEMS_PER_PAGE_DEFAULT;
                    self.itemsFound = data.items.length;
                }

                self.canLoadMore = !pageTracker.isLastPage(data.pagination);

                if (self.canLoadMore) {
                    self.more();
                }
            });
        };

        /**
        * Displays an additional preloaded page of the media archive images
        * and, if available, asynchronously fetches next page of results
        * from the server.
        *
        * @method more
        */
        self.more = function () {
            var additional = self.loaded.splice(0, self.itemsPerPage);
            self.displayed = self.displayed.concat(additional);

            if (!self.canLoadMore) {
                return;
            }

            self.load(
                self.tracker.next(), self.searchFilter
            ).then(function (data) {
                self.loaded = self.loaded.concat(data.items);
                self.canLoadMore = !pageTracker.isLastPage(data.pagination);
            });
        };

        /**
        * Loads a single page of images from the server.
        *
        * @method load
        * @param page {Number} index of the page to load
        *     (NOTE: page indices start with 1)
        * @param searchString {String} Search term to narrow down the list of
        *     results. Empty string is interpreted by API as "no restrictions".
        * @return {Object} promise object resolved with search results array
        *   and a pagination object (if available)
        */
        self.load = function (page, searchString) {
            var promise = NcImage.query(
                page, self.itemsPerPage, searchString).$promise;

            promise.catch(function () {
                self.tracker.remove(page);
            });
            return promise;
        };

        /**
        * Loads image objects attached to the article and initializes
        * the `attached` array (NOTE: any existing items are discarded).
        * It resolves/rejects the attachedLoaded promise on success/failure.
        *
        * @method loadAttached
        * @param article {Object} article object for which to load the
        *     attached images.
        */
        self.loadAttached = function (article) {
            self.attached = NcImage.getAllByArticle(
                article.articleId, article.language);

            self.attached.$promise.then(
                loadAttachedDeferred.resolve,
                loadAttachedDeferred.reject
            );
        };

        /**
        * Adds an image (from the list of displayed images) to the basket. If
        * loadFromServer flag is set, it instead retrieves image data from the
        * server before adding it to the basket. The latter is useful for
        * adding just-uploaded images, for which we don't yet have all their
        * metadata.
        *
        * @method collect
        * @param id {Number} ID of an image to add
        * @param [loadFromServer=false] {Boolean} whether or not to retrieve
        *     image info from the server
        */
        self.collect = function (id, loadFromServer) {
            var image;

            if (self.isCollected(id)) {
                return;
            }

            if (!loadFromServer) {
                image = _.find(self.displayed, {id: id});
                if (image) {
                    self.collected.push(image);
                }
            } else {
                NcImage.getById(id).then(function (image) {
                    self.collected.push(image);
                });
            }
        };

        /**
        * Removes image from the basket.
        *
        * @method discard
        * @param id {Number} ID of an image to remove
        */
        self.discard = function (id) {
            _.remove(self.collected, {id: id});
        };

        /**
        * Empties the basket and clears the list of images to upload.
        *¸
        * @method discardAll
        */
        self.discardAll = function () {
            while (self.collected.length > 0) {
                self.collected.pop();
            }

            while (self.images2upload.length > 0) {
                self.images2upload.pop();
            }
        };

        /**
        * Attaches all images in the basket to the article.
        *¸
        * @method attachAllCollected
        */
        self.attachAllCollected = function () {
            var notYetAttached = [];

            // skip already attached images (this should generally not happen,
            // but if it does, it might be some bug in the basket logic)
            self.collected.forEach(function (image) {
                if (!_.find(self.attached, image)) {
                    notYetAttached.push(image);
                }
            });

            if (notYetAttached.length < 1) {
                return;  // nothing to do
            }

            NcImage.addAllToArticle(
                self.article.articleId, self.article.language, notYetAttached
            )
            .then(function () {
                notYetAttached.forEach(function (image) {
                    self.attached.push(image);
                });
            });
        };

        /**
        * Detaches a single image from the article. If the image is not
        * in the list of attached images, it does not do anything.
        *
        * @method detach
        * @param id {Number} ID of an image to detach
        */
        self.detach = function (id) {
            var image = _.find(self.attached, {id: id});

            if (!image) {
                return;  // image not attached, nothing to do
            }

            image.removeFromArticle(
                self.article.articleId, self.article.language
            )
            .then(function () {
                _.remove(self.attached, {id: id});
            });
        };

        /**
        * Adds a particular image to the list of images included in article
        * body.
        *
        * @method addToIncluded
        * @param imageId {Number} ID of the image
        */
        self.addToIncluded = function (imageId) {
            self.inArticleBody[imageId] = true;
        };

        /**
        * Removes a particular image from the list of images included in
        * article body.
        *
        * @method removeFromIncluded
        * @param imageId {Number} ID of the image
        */
        self.removeFromIncluded = function (imageId) {
            delete self.inArticleBody[imageId];
        };

        /**
        * Searches for an image with the given ID in the list of images
        * attached to the article. If found, it returns the image.
        *
        * @method findAttached
        * @param id {Number} ID of the image
        * @return {Object|undefined} image object (undefined if image is not
        *     found)
        */
        self.findAttached = function (id) {
            return _.find(self.attached, {id: id});
        };

        /**
        * Searches for an image with the given ID in the list of images
        * currently in the basket. If found, it returns the image.
        *
        * @method findCollected
        * @param id {Number} ID of the image
        * @return {Object|undefined} image object (undefined if image is not
        *     found)
        */
        self.findCollected = function (id) {
            return _.find(self.collected, {id: id});
        };

        /**
        * Retrieves an image from the list of images attached to the article.
        * If the image is not found, it an error is raised.
        *
        * @method byId
        * @param id {Number} ID of the image
        * @return {Object} image object
        */
        self.byId = function (id) {
            var i = self.findAttached(id);
            if (i) {
                return i;
            } else {
                throw new Error('asking details about an image which is not ' +
                    'attached to the article is not supported');
            }
        };

        /**
        * Retrieves an image from the list of images attached to the article
        * by its articleImageId. If the image is not found, it an error is
        * raised.
        *
        * @method byArticleImageId
        * @param articleImageId {Number} ID of the image
        * @return {Object} NcImage instance
        */
        self.byArticleImageId = function (articleImageId) {
            var img = _.find(self.attached, {articleImageId: articleImageId});

            if (img) {
                return img;
            } else {
                throw new Error(
                    'Could not find an image with the given ' +
                    'articleImageId in the attached images list.'
                );
            }
        };

        /**
        * Checks if image is currently attached to the article or not.
        *
        * @method isAttached
        * @param id {Number} ID of the image
        * @return {String} true if image is attached to the article,
        *     false otherwise
        */
        self.isAttached = function (id) {
            return typeof self.findAttached(id) !== 'undefined';
        };

        /**
        * Checks if image is currently in the basket or not.
        *
        * @method isCollected
        * @param id {Number} ID of the image
        * @return {String} true if image is in the basket, false otherwise
        */
        self.isCollected = function (id) {
            return typeof self.findCollected(id) !== 'undefined';
        };

        /**
        * Returns CSS class name for the toggler widget, depending on whether
        * the corresponding image is currently in the basket or not.
        *
        * @method togglerClass
        * @param id {Number} ID of the image
        * @return {String} CSS class name
        */
        self.togglerClass = function (id) {
            return self.isCollected(id) ? 'glyphicon-minus' : 'glyphicon-plus';
        };

        /**
        * Adds (removes) an image to (from) the basket, depending on the
        * image's current state (in the basket or not).
        *
        * @method toggleCollect
        * @param id {Number} ID of the image
        */
        self.toggleCollect = function (id) {
            if (self.isCollected(id)) {
                self.discard(id);
            } else {
                self.collect(id);
            }
        };

        /**
        * Adds new local image files to the list of images to upload. Before
        * adding, file objects are decorated using the `decorate` method.
        *
        * @method addToUploadList
        * @param newImages {Object} array with objects cointaining image Files
        *     that user wants to upload
        */
        self.addToUploadList = function (newImages) {
            var i,
                image;

            for (i = 0; i < newImages.length; i++) {
                image = self.decorate(newImages[i]);
                self.images2upload.push(image);
                image.readRawData();
            }
        };

        /**
        * Removes image from the list of images to upload.
        *
        * @method removeFromUploadList
        * @param image {Object} image to remove
        */
        self.removeFromUploadList = function (image) {
            _.remove(self.images2upload, image);
        };

        /**
        * Clears the images to upload list, including the images that have
        * not been uploaded.
        *
        * @method clearUploadList
        */
        self.clearUploadList = function () {
            while (self.images2upload.length > 0) {
                self.images2upload.pop();
            }
        };

        /**
        * Starts asynchronous uploads for all the images in the images2upload
        * list.
        *
        * @method uploadAll
        * @return {Object} array of upload promises objects
        */
        self.uploadAll = function () {
            var uploadPromise,
                promiseList = [];

            self.images2upload.forEach(function (image) {
                uploadPromise = NcImage.upload(image, image.progressCallback);
                promiseList.push(uploadPromise);
            });

            return promiseList;
        };

        /**
        * Decorates an image file object with various properties and methods
        * (mostly uploading-related).
        *
        * @class decorate
        * @param image {Object} image File object that user wants to upload
        * @return {Object} Decorated image object
        */
        self.decorate = function (image) {
            /**
            * @class image
            */

            /**
            * The number of bytes already sent to the server. Relevant for
            * images that are (going to be) uploaded from a computer.
            * @property progress
            * @type Number
            * @default 0
            */
            image.progress = 0;

            /**
            * The total number of bytes to send to the server (= image size).
            * Relevant for images that are (going to be) uploaded from a
            * computer.
            * @property max
            * @type Number
            * @default 0
            */
            image.max = 0;

            /**
            * Percentage of the total number of bytes already sent to the
            * server. Relevant for images that are (going to be) uploaded
            * from a computer.
            * @property percent
            * @type String
            * @default '0%'
            */
            image.percent = '0%';

            /**
            * Handler for the server's upload progress notification event. It
            * updates `progress`, `max` and `percent` properties accordingly.
            *
            * @method progressCallback
            * @param event {Object} event object
            */
            image.progressCallback = function (event) {
                image.progress = event.loaded;
                image.max = event.total;
                image.percent =
                    Math.round((event.loaded / event.total) * 100) + '%';
            };

            /**
            * Asynchronously reads raw data of the image that will be uploaded.
            * Once the data has been successfully read from computer's hard
            * drive into memory, it sets image object's width, height and src
            * attributes (the latter in data URI format).
            *
            * @method readRawData
            * @return {Object} file read promise
            */
            image.readRawData = function () {
                var deferred = $q.defer(),
                    reader = getFileReader.get();

                reader.onload = function () {
                    var img = imageFactory.makeInstance();

                    img.onload = function (event) {
                        image.width = img.width;
                        image.height = img.height;
                        image.src = img.src;

                        deferred.resolve(event.target.result);
                        // XXX: this might not be ideal, but there were
                        // problems listening to the "file read" change,
                        // thus I added $rootScope.$apply() here in the
                        // service itself
                        $rootScope.$apply();
                    };

                    img.src = reader.result;
                };

                reader.readAsDataURL(image);
                return deferred.promise;
            };

            return image;
        };

        /// service initialization code ///
        loadAttachedDeferred = $q.defer();
        self.attachedLoaded = loadAttachedDeferred.promise;

        self.article = articleService.articleInstance;
        self.loadAttached(self.article);

        self.tracker = pageTracker.getTracker({ max: 100 });
        self.loaded = [];
        self.displayed = [];
        self.collected = [];  // list of collected images (those in basket)
        self.images2upload = [];  // list of images to upload
        self.includedIndex = -1;
        self.inArticleBody = {};  // list of img IDs in article body
        self.itemsPerPage = ITEMS_PER_PAGE_DEFAULT;

        self.itemsFound = 0;
        self.searchFilter = '';
        self.canLoadMore = false;  // is there another page to fetch?
    }
]);
