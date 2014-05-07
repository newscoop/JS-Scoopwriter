'use strict';
angular.module('authoringEnvironmentApp').service('images', [
    '$http',
    'pageTracker',
    'configuration',
    '$log',
    'article',
    'getFileReader',
    'formDataFactory',
    'imageFactory',
    '$upload',
    '$rootScope',
    '$q',
    function images(
        $http, pageTracker, configuration, $log, article,
        getFileReader, formDataFactory, imageFactory, $upload, $rootScope, $q
    ) {
        /* more info about the page tracker in its tests */
        var service = this;
        var apiRoot = configuration.API.full;

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
        this.included = {};
        this.itemsPerPage = 10;

        /**
        * Loads and displays the first batch of images from the media archive.
        *
        * @method init
        */
        this.init = function () {
            this.load(this.tracker.next()).success(function (data) {
                service.displayed = data.items;
                service.itemsPerPage = data.pagination.itemsPerPage;
                /* prepare the next batch, for an happy user */
                service.more();
            });
        };

        /**
        * Displays an additional preloaded page of the media archive images
        * and asynchronously fetches the next page from the server.
        *
        * @method more
        */
        this.more = function () {
            var additional = service.loaded.splice(0, this.itemsPerPage);
            this.displayed = this.displayed.concat(additional);
            this.load(this.tracker.next()).success(function (data) {
                service.loaded = service.loaded.concat(data.items);
            });
        };

        /**
        * Asynchronously loads a single page of images from the server.
        *
        * @method load
        * @param page {Number} Index of the page to load
        *     (NOTE: page indices start with 1)
        * @return {Object} promise object
        */
        this.load = function (page) {
            var url = apiRoot + '/images?items_per_page=50&page=' + page +
                '&expand=true';
            var promise = $http.get(url);
            promise.error(function () {
                service.tracker.remove(page);
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
            var url = [
                    apiRoot, 'articles',
                    article.number, article.language,
                    'images?expand=true'
                ].join('/');

            $http.get(url).then(function (result) {
                service.attached = result.data.items;
            });
        };

        /**
        * Creates and returns a comparison function. This functions accepts an
        * object with the "id" attribute as a parameter and returns true if
        * object.id is equal to the value of the "id" parameter passed to
        * the method. If not, the created comparison function returns false.
        *
        * @method matchMaker
        * @param id {Number} Value to which the object.id will be compared in
        *   the comparison function (can also be a numeric string).
        *   NOTE: before comparison the parameter is converted to integer
        *   using the built-in parseInt() function.
        *
        * @return {Function} Generated comparison function.
        */
        this.matchMaker = function (id) {
            return function (needle) {
                return parseInt(needle.id) === parseInt(id);
            };
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
            var image,
                match,
                url;

            if (this.isCollected(id)) {
                return;
            }

            if (!loadFromServer) {
                match = this.matchMaker(id);
                image = _.find(this.displayed, match);
                if (image) {
                    service.collected.push(image);
                }
            } else {
                url = apiRoot + '/images/' + id;
                $http.get(url).then(function (result) {
                    service.collected.push(result.data);
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
            var match = this.matchMaker(id);
            _.remove(this.collected, match);
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
        this.attachAllCollected = function () {
            var notYetAttached = [],
                resourceLinks = [],
                url;

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

            url = apiRoot + '/articles/' + service.article.number +
                '/' + service.article.language;

            notYetAttached.forEach(function (image) {
                resourceLinks.push(
                    '<' + apiRoot + '/images/' + image.id + '>');
            });
            resourceLinks = resourceLinks.join();

            $http({
                url: url,
                method: 'LINK',
                headers: { Link: resourceLinks }
            }).success(function () {
                notYetAttached.forEach(function (image) {
                    service.attached.push(image);
                });
            });
            // XXX: do we handle conflicts (409 errors)? For cases when
            // another user attaches the same image(s) while we are still
            // adding them to our own basket
        };

        /**
        * Attaches a single image to the article (using HTTP LINK). If the
        * image is already attached, it does not do anything.
        * If loadFromServer flag is set, it also retrieves detailed image info
        * after successfully attaching it to the article.
        *
        * @method attach
        * @param id {Number} ID of an image to attach
        * @param [loadFromServer=false] {Boolean} whether or not to retrieve
        *     image info from the server after attaching (useful if the image
        *     is uploaded from a computer)
        */
        this.attach = function (id, loadFromServer) {
            var link,
                match = this.matchMaker(id),
                url;

            if (_.find(this.attached, match)) {
                $log.debug('image already attached, ignoring attach request');
                return;
            }

            url = apiRoot + '/articles/' + service.article.number +
                '/' + service.article.language;

            link = '<' + apiRoot + '/images/' + id + '>';

            /* this could cause some trouble depending on the
             * setting of the server (OPTIONS request), thus debug
             * log may be useful to reproduce the original
             * request */
            $log.debug('sending link request');
            $log.debug(url);
            $log.debug(link);

            $http({
                url: url,
                method: 'LINK',
                headers: { Link: link }
            }).success(function () {
                if (loadFromServer) {
                    // uploaded images need to be retrieved from server
                    // to get all image metadata
                    $http.get(
                        apiRoot + '/images/' + id
                    )
                    .success(function (data) {
                        service.attached.push(data);
                    });
                } else {
                    var image = _.find(service.displayed, match);
                    service.attached.push(image);
                }
            });
        };

        /**
        * Detaches a single image from the article (using HTTP UNLINK). If the
        * image is not attached to the article, it does not do anything.
        *
        * @method detach
        * @param id {Number} ID of an image to detach
        */
        this.detach = function (id) {
            var match = this.matchMaker(id);
            if (_.find(this.attached, match)) {
                var url = apiRoot + '/articles/' + service.article.number + '/' + service.article.language;
                var link = '<' + apiRoot + '/images/' + id + '>';
                /* this could cause some troubles depending on the
                 * setting of the server (OPTIONS request), thus debug
                 * log may be useful to reproduce the original
                 * request */
                $log.debug('sending an unlink request');
                $log.debug(url);
                $log.debug(link);
                $http({
                    url: url,
                    method: 'UNLINK',
                    headers: { Link: link }
                }).success(function () {
                    _.remove(service.attached, match);
                });
            } else {
                $log.debug('image already detached, ignoring attach request');
            }
        };

        /**
        * Adds an image to the list of images included in article content and
        * returns image's index in that list. If the image is not found,
        * an error is raised.
        *
        * @method include
        * @param id {Number} ID of the image
        * @return {Number} image's index in the list of included images
        */
        this.include = function (id) {
            var match = this.matchMaker(id);
            var index = _.findIndex(this.attached, match);
            if (index < 0) {
                // this should be impossible, where is the user dragging from?
                throw new Error('trying to include a not attached image');
            } else {
                this.attached[index].included = true;
                this.includedIndex++;
                var image = _.cloneDeep(this.attached[index]);
                var defaultSize = 'big';
                image.size = defaultSize;
                image.style = {
                    container: { width: configuration.image.width[defaultSize] },
                    image: {}
                };
                this.included[this.includedIndex] = image;
                return this.includedIndex;
            }
        };

        /**
        * Removes an image from the list of images included in article
        * content. If the image is not found, an error is raised.
        *
        * @method exclude
        * @param id {Number} ID of the image
        */
        this.exclude = function (id) {
            var match = this.matchMaker(id);
            var index = _.findIndex(this.attached, match);
            if (index < 0) {
                // this should be impossible, included images should
                // always be attached
                throw new Error('trying to exclude a not attached image');
            } else {
                this.attached[index].included = false;
            }
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
            return _.find(this.attached, this.matchMaker(id));
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
            return _.find(this.collected, this.matchMaker(id));
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
                throw new Error('asking details about an image which is not attached to the article is not supported');
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

                $upload.http({
                    method: 'POST',
                    url: apiRoot + '/images',
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