'use strict';
angular.module('authoringEnvironmentApp').service('images', [
    'pageTracker',
    'configuration',
    '$log',
    'article',
    'getFileReader',
    'formDataFactory',
    'imageFactory',
    'NcImage',
    '$upload',
    '$rootScope',
    '$q',
    function images(
        pageTracker, configuration, $log, article,
        getFileReader, formDataFactory, imageFactory, NcImage,
        $upload, $rootScope, $q
    ) {
        /* more info about the page tracker in its tests */
        var service = this,
            self = this,
            ITEMS_PER_PAGE_DEFAULT = 50;

        article.promise.then(function (article) {
            service.article = article;
            service.loadAttached(article);
        });

        this.tracker = pageTracker.getTracker({ max: 100 });
        this.loaded = [];
        this.displayed = [];
        this.collected = [];  // list of collected images (those in basket)
        this.attached = [];  // list of images attached to the article
        this.images2upload = [];  // list of images to upload
        this.includedIndex = -1;
        this.inArticleBody = {};  // list of img IDs in article body
        this.itemsPerPage = ITEMS_PER_PAGE_DEFAULT;

        this.itemsFound = 0;
        this.searchFilter = '';
        this.canLoadMore = false;  // is there another page to fetch?

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
            while(service.displayed.length > 0) {
                service.displayed.pop();
            }
            while(service.loaded.length > 0) {
                service.loaded.pop();
            }
            self.tracker.reset();
            self.itemsFound = 0;
            self.canLoadMore = false;

            self.load(
                self.tracker.next(), self.searchFilter
            ).then(function (data) {
                service.displayed = data.items;

                if (data.pagination) {
                    service.itemsPerPage = data.pagination.itemsPerPage;
                    service.itemsFound = data.pagination.itemsCount;
                } else {
                    service.itemsPerPage = ITEMS_PER_PAGE_DEFAULT;
                    service.itemsFound = data.items.length;
                }

                service.canLoadMore = !pageTracker.isLastPage(data.pagination);

                if (service.canLoadMore) {
                    service.more();
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

            if (!service.canLoadMore) {
                return;
            }

            self.load(
                self.tracker.next(), self.searchFilter
            ).then(function (data) {
                service.loaded = service.loaded.concat(data.items);
                service.canLoadMore = !pageTracker.isLastPage(data.pagination);
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
        *  the `attached` array (NOTE: any existing items are discarded).
        *
        * @method loadAttached
        * @param article {Object} article object for which to load the
        *     attached images.
        */
        this.loadAttached = function (article) {
            service.attached = NcImage.getAllByArticle(
                article.number, article.language);
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
        this.collect = function (id, loadFromServer) {
            var image;

            if (this.isCollected(id)) {
                return;
            }

            if (!loadFromServer) {
                image = _.find(this.displayed, {id: id});
                if (image) {
                    service.collected.push(image);
                }
            } else {
                NcImage.getById(id).then(function (image) {
                    service.collected.push(image);
                });
            }
        };

        /**
        * Removes image from the basket.
        *
        * @method discard
        * @param id {Number} ID of an image to remove
        */
        this.discard = function (id) {
            _.remove(this.collected, {id: id});
        };

        /**
        * Empties the basket and clears the list of images to upload.
        *¸
        * @method discardAll
        */
        this.discardAll = function () {
            while (service.collected.length > 0) {
                service.collected.pop();
            }

            while (service.images2upload.length > 0) {
                service.images2upload.pop();
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
            service.collected.forEach(function (image) {
                if (!_.find(service.attached, image)) {
                    notYetAttached.push(image);
                }
            });

            if (notYetAttached.length < 1) {
                return;  // nothing to do
            }

            NcImage.addAllToArticle(
                self.article.number, self.article.language, notYetAttached
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
        this.detach = function (id) {
            var image = _.find(this.attached, {id: id});

            if (!image) {
                return;  // image not attached, nothing to do
            }

            image.removeFromArticle(
                service.article.number, service.article.language
            )
            .then(function () {
                _.remove(service.attached, {id: id});
            });
        };

        /**
        * Adds a particular image to the list of images included in article
        * body.
        *
        * @method addToIncluded
        * @param imageId {Number} ID of the image
        */
        this.addToIncluded = function (imageId) {
            this.inArticleBody[imageId] = true;
        };

        /**
        * Removes a particular image from the list of images included in
        * article body.
        *
        * @method removeFromIncluded
        * @param imageId {Number} ID of the image
        */
        this.removeFromIncluded = function (imageId) {
            delete this.inArticleBody[imageId];
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
        this.findAttached = function (id) {
            return _.find(this.attached, {id: id});
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
        this.findCollected = function (id) {
            return _.find(this.collected, {id: id});
        };

        /**
        * Retrieves an image from the list of images attached to the article.
        * If the image is not found, it an error is raised.
        *
        * @method byId
        * @param id {Number} ID of the image
        * @return {Object} image object
        */
        this.byId = function (id) {
            var i = this.findAttached(id);
            if (i) {
                return i;
            } else {
                throw new Error('asking details about an image which is not ' +
                    'attached to the article is not supported');
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
        this.isAttached = function (id) {
            return typeof this.findAttached(id) !== 'undefined';
        };

        /**
        * Checks if image is currently in the basket or not.
        *
        * @method isCollected
        * @param id {Number} ID of the image
        * @return {String} true if image is in the basket, false otherwise
        */
        this.isCollected = function (id) {
            return typeof this.findCollected(id) !== 'undefined';
        };

        /**
        * Returns CSS class name for the toggler widget, depending on whether
        * the corresponding image is currently in the basket or not.
        *
        * @method togglerClass
        * @param id {Number} ID of the image
        * @return {String} CSS class name
        */
        this.togglerClass = function (id) {
            return this.isCollected(id) ? 'glyphicon-minus' : 'glyphicon-plus';
        };

        /**
        * Adds (removes) an image to (from) the basket, depending on the
        * image's current state (in the basket or not).
        *
        * @method toggleCollect
        * @param id {Number} ID of the image
        */
        this.toggleCollect = function (id) {
            if (this.isCollected(id)) {
                this.discard(id);
            } else {
                this.collect(id);
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
        this.addToUploadList = function (newImages) {
            var i,
                image;

            for (i = 0; i < newImages.length; i++) {
                image = this.decorate(newImages[i]);
                this.images2upload.push(image);
                image.readRawData();
            }
        };

        /**
        * Removes image from the list of images to upload.
        *
        * @method removeFromUploadList
        * @param image {Object} image to remove
        */
        this.removeFromUploadList = function (image) {
            _.remove(this.images2upload, image);
        };

        /**
        * Clears the images to upload list, including the images that have
        * not been uploaded.
        *
        * @method clearUploadList
        */
        this.clearUploadList = function () {
            while (this.images2upload.length > 0) {
                this.images2upload.pop();
            }
        };

        /**
        * Starts asynchronous uploads for all the images in the images2upload
        * list.
        *
        * @method uploadAll
        * @return {Object} array of upload promises objects
        */
        this.uploadAll = function () {
            var uploadPromise,
                promiseList = [];

            service.images2upload.forEach(function (image) {
                uploadPromise = image.startUpload();
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
        this.decorate = function (image) {
            /**
            * @class image
            */
            /**
            * Whether or not the image has been already uploaded to the server.
            * @property isUploaded
            * @type Boolean
            * @default false
            */
            image.isUploaded = false;

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
            * Starts an asynchronous upload of the image to the server and
            * stores the image ID once the upload has been successfully
            * completed.
            *
            * @method startUpload
            * @return {Object} file upload promise
            */
            image.startUpload = function () {
                var deferred = $q.defer(),
                    fd = formDataFactory.makeInstance(),
                    imageObj = this,
                    parts,
                    rejectMsg = 'No x-location header in API response.';

                fd.append('image[photographer]', imageObj.photographer);
                fd.append('image[description]', imageObj.description);
                fd.append('image[image]', imageObj);

                // XXX: wrap this into NcImage (e.g. NcImage.create())
                $upload.http({
                    method: 'POST',
                    url: Routing.generate(
                        'newscoop_gimme_images_createimage', {}, true),
                    data: fd,
                    headers: {'Content-Type': undefined},
                    transformRequest: angular.identity
                })
                .progress(
                    image.progressCallback
                )
                .success(function (data, status, headers, config) {
                    var imgUrl;

                    image.progressCallback({
                        loaded: 100,
                        total:  100
                    });

                    image.isUploaded = true;

                    imgUrl = headers()['x-location'];
                    if (imgUrl) {
                        parts = imgUrl.split('/');
                        image.id = parseInt(parts[parts.length - 1], 10);
                        deferred.resolve({
                            id: image.id,
                            url: imgUrl
                        });
                    } else {
                        // most likely an API bug
                        console.warn(rejectMsg);
                        deferred.reject(rejectMsg);
                    }
                })
                .error(function () {
                    deferred.reject('error uploading');
                });

                return deferred.promise;
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

    }
]);
