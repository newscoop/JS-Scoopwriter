'use strict';
angular.module('authoringEnvironmentApp').service('images', [
    '$http',
    'pageTracker',
    'configuration',
    '$log',
    'article',
    'modal',
    'getFileReader',
    '$upload',
    function images(
        $http, pageTracker, configuration, $log, article, modal,
        getFileReader, $upload
    ) {
        /* more info about the page tracker in its tests */
        // AngularJS will instantiate a singleton by calling "new" on this function
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
        this.attached = [];
        this.images2upload = [];  // queue for images to upload
        //XXX: this thing below needed? "uploaded"
        this.uploaded = [];  // images uploaded in one "modal session"
        this.includedIndex = 0;
        this.included = {};
        this.itemsPerPage = 10;

        /* at the beginning we want do display the results immediately */
        this.init = function () {
            this.load(this.tracker.next()).success(function (data) {
                service.displayed = data.items;
                service.itemsPerPage = data.pagination.itemsPerPage;
                /* prepare the next batch, for an happy user */
                service.more();
            });
        };
        /* synchronously show more items and asynchronously ask for loading */
        this.more = function () {
            var additional = service.loaded.splice(0, this.itemsPerPage);
            this.displayed = this.displayed.concat(additional);
            this.load(this.tracker.next()).success(function (data) {
                service.loaded = service.loaded.concat(data.items);
            });
        };
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

        // produce a matching function suitable for finding. find it
        // confusing? hey that's functional programming dude!
        this.matchMaker = function (id) {
            return function (needle) {
                return parseInt(needle.id) === parseInt(id);
            };
        };
        this.collect = function (id) {
            var match = this.matchMaker(id);
            if (!this.isCollected(id)) {
                this.collected.push(_.find(this.displayed, match));
            }
        };
        this.discard = function (id) {
            var match = this.matchMaker(id);
            _.remove(this.collected, match);
        };
        this.discardAll = function () {
            service.collected = [];
            modal.hide();
        };

        /**
        * Attaches all images in the basket to the article and closes
        * the modal at the end.
        *¸
        * @method attachAll
        */
        this.attachAll = function () {
            service.collected.forEach(function (image) {
                service.attach(image.id);
            });
            service.collected = [];
            modal.hide();
        };

        /**
        * Attaches an image to the article (using HTTP LINK). If image is
        * already attached, it does not do anything.
        *
        * @method attach
        * @param id {Number} ID of an image to attach
        */
        this.attach = function (id) {
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
                var image = _.find(service.displayed, match);
                service.attached.push(image);
            });
        };

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
        this.findAttached = function (id) {
            return _.find(this.attached, this.matchMaker(id));
        };
        this.findCollected = function (id) {
            return _.find(this.collected, this.matchMaker(id));
        };
        this.byId = function (id) {
            var i = this.findAttached(id);
            if (i) {
                return i;
            } else {
                throw new Error('asking details about an image which is not attached to the article is not supported');
            }
        };
        this.isAttached = function (id) {
            return typeof this.findAttached(id) !== 'undefined';
        };
        this.isCollected = function (id) {
            return typeof this.findCollected(id) !== 'undefined';
        };
        this.togglerClass = function (id) {
            return this.isCollected(id) ? 'glyphicon-minus' : 'glyphicon-plus';
        };
        this.toggleCollect = function (id) {
            if (this.isCollected(id)) {
                this.discard(id);
            } else {
                this.collect(id);
            }
        };

        // retrieve uploded image's data and add it to collected
        // TODO: dosctring and tests
        this.collectUploaded = function (imgUrl) {
            $http.get(imgUrl).success(function (data) {
                service.displayed.push(data);
                service.toggleCollect(data.id);
            });
        };

        // add new images to the list of images to upload
        // TODO: docstring and tests
        this.addToUploadList = function (newImages) {
            var i,
                image;

            for(i = 0; i < newImages.length; i++) {
                image = this.decorate(newImages[i]);
                this.images2upload.push(image);
                image.startUpload();
            }
        };

        // TODO: docstring and tests
        this.decorate = function (image) {

            image.progressCallback = function (event) {
                image.progress = event.loaded;
                image.max = event.total;
                image.percent =
                    Math.round((event.loaded / event.total) * 100) + '%';
            };

            image.startUpload = function () {
                var fd = new FormData(),
                    imageObj = this,
                    reader = getFileReader.get();

                // TODO: remove image description, it will be edited elsewhere
                fd.append('image[description]', 'this is image description');
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

                    imgUrl = headers()['x-location'];
                    if (imgUrl) {
                        service.collectUploaded(imgUrl);  // TODO: should change
                    } else {
                        // XXX: bug in API? how should we handle this?
                        console.warn('No x-location header in API response.');
                    }
                });  // XXX: add onerror handler?

                // extract image data to show preview immediately
                reader.onload = function (ev) {
                    imageObj.b64data = btoa(this.result);
                };
                reader.readAsBinaryString(imageObj);
            };

            return image;
        }

    }
]);