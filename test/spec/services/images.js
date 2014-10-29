'use strict';

/**
* Module with tests for the images service.
*
* @module Images service tests
*/

describe('Service: Images', function () {
    var mock = {
        items: [
            {
                id: 1,
                basename: 'cms-image-000000001.jpg'
            },
            {
                id: 2,
                basename: 'cms-image-000000002.jpg'
            },
            {
                id: 3,
                basename: 'cms-image-000000003.jpg'
            },
            {
                id: 4,
                basename: 'cms-image-000000004.jpg'
            },
            {
                id: 5,
                basename: 'cms-image-000000005.jpg'
            },
            {
                id: 6,
                basename: 'cms-image-000000006.jpg'
            },
            {
                id: 7,
                basename: 'cms-image-000000007.jpg'
            },
            {
                id: 8,
                basename: 'cms-image-000000008.jpg'
            },
            {
                id: 9,
                basename: 'cms-image-000000009.jpg'
            },
            {
                id: 10,
                basename: 'cms-image-000000010.jpg'
            }
        ],
        pagination: {
            'itemsPerPage': 50,
            'currentPage': 1,
            'itemsCount': 149735,
            nextPageLink: Routing.generate(
                'newscoop_gimme_images_getimages',
                {page: 2, items_per_page: 10}, true
            )
        }
    };
    var mockSingle = {
        id: 1,
        location: 'local',
        basename: 'mock-single.jpg',
        thumbnailPath: 'cms-thumb-000000001.jpg',
        url: '',
        description: '',
        width: 150,
        height: 210,
        photographer: '',
        photographerUrl: '',
        place: ''
    };

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var images,
        $httpBackend;

    beforeEach(inject(function (_article_, _images_, _$httpBackend_) {
        images = _images_;
        $httpBackend = _$httpBackend_;

        images.article = {
            number: 64,
            language: 'de'
        };
    }));

    it('sets itemsPerPage to 50 by default', function () {
        expect(images.itemsPerPage).toEqual(50);
    });

    it('sets itemsFound to 0 by default', function () {
        expect(images.itemsFound).toEqual(0);
    });

    it('sets searchFilter to empty string by default', function () {
        expect(images.searchFilter).toEqual('');
    });

    it('has canLoadMore flag cleared by default', function () {
        expect(images.canLoadMore).toEqual(false);
    });

    describe('query() method', function () {
        var deferredLoad,
            $rootScope;

        beforeEach(inject(function (_$rootScope_, $q) {
            $rootScope = _$rootScope_;
            deferredLoad = $q.defer();
            spyOn(images, 'load').andReturn(deferredLoad.promise);
        }));

        it('stores the new value of search filter', function () {
            images.searchFilter = 'fish';
            images.query('duck');
            expect(images.searchFilter).toEqual('duck');
        });

        it('clears displayed images list before invoking API', function () {
            images.displayed = [{id:1}, {id:2}, {id:3}];
            images.query('duck');
            expect(images.displayed).toEqual([]);
        });

        it('clears preloaded images list before invoking API', function () {
            images.loaded = [{id:4}, {id:5}, {id:6}];
            images.query('duck');
            expect(images.loaded).toEqual([]);
        });

        it('resets page tracker before invoking API', function () {
            spyOn(images.tracker, 'reset');
            images.query('duck');
            expect(images.tracker.reset).toHaveBeenCalled();
        });

        it('resets items found count to 0 before invoking API', function () {
            images.itemsFound = 17;
            images.query('duck');
            expect(images.itemsFound).toEqual(0);
        });

        it('clears canLoadMore flag before invoking API', function () {
            images.canLoadMore = true;
            images.query('duck');
            expect(images.canLoadMore).toEqual(false);
        });

        it('invokes load() with correct parameters', function () {
            images.searchFilter = 'fish';
            images.tracker.next();
            images.tracker.next(); // simulate previously loaded pages

            images.query('duck');
            expect(images.load).toHaveBeenCalledWith(1, 'duck');
        });

        describe('on data retrieval', function () {
            var pageTracker;

            beforeEach(inject(function (_pageTracker_) {
                pageTracker = _pageTracker_;
                spyOn(images, 'more');
                spyOn(pageTracker, 'isLastPage');
            }));

            it('sets the list of displayed images to result set', function () {
                var resultSet = [{id:12}, {id:55}, {id:167}];

                images.displayed = [{id:1}, {id:2}, {id:3}];

                images.query('duck');
                deferredLoad.resolve({items: resultSet});
                $rootScope.$apply();

                expect(images.displayed).toEqual(resultSet);
            });

            it('preloads the next page of results if available', function () {
                pageTracker.isLastPage.andReturn(false);

                images.query('duck');
                deferredLoad.resolve({items: []});
                $rootScope.$apply();

                expect(images.more).toHaveBeenCalled();
            });

            it('sets canLoadMore flag if more pages available', function () {
                pageTracker.isLastPage.andReturn(false);

                images.query('duck');
                images.canLoadMore = false;  // before server response
                deferredLoad.resolve({items: []});
                $rootScope.$apply();

                expect(images.canLoadMore).toEqual(true);
            });

            it('does not preload the next page of results if not available',
                function () {
                    pageTracker.isLastPage.andReturn(true);

                    images.query('duck');
                    deferredLoad.resolve({items: []});
                    $rootScope.$apply();

                    expect(images.more).not.toHaveBeenCalled();
                }
            );

            it('clears canLoadMore flag if no more pages applicable',
                function () {
                    pageTracker.isLastPage.andReturn(true);

                    images.query('duck');
                    images.canLoadMore = true;  // before server response
                    deferredLoad.resolve({items: []});
                    $rootScope.$apply();

                    expect(images.canLoadMore).toEqual(false);
                }
            );

            describe('pagination object available', function () {
                it('sets result page size to what server returned',
                    function () {
                        images.itemsPerPage = 20;

                        images.query('duck');
                        deferredLoad.resolve({
                            items: [{id:6}, {id:29}, {id:55}, {id:101}],
                            pagination: {
                                itemsPerPage: 4,
                                itemsCount: 419
                            }
                        });
                        $rootScope.$apply();

                        expect(images.itemsPerPage).toEqual(4);
                    }
                );
                it('sets items found count to total number of matches',
                    function () {
                        images.itemsFound = 50;

                        images.query('duck');
                        deferredLoad.resolve({
                            items: [{id:6}, {id:29}, {id:55}, {id:101}],
                            pagination: {
                                itemsPerPage: 4,
                                itemsCount: 419
                            }
                        });
                        $rootScope.$apply();

                        expect(images.itemsFound).toEqual(419);
                    }
                );
            });

            describe('pagination object not available', function () {
                it('sets page size back to default value', function () {
                    images.itemsPerPage = 30;

                    images.query('duck');
                    deferredLoad.resolve({items: []});
                    $rootScope.$apply();

                    expect(images.itemsPerPage).toEqual(50);
                });

                it('sets items found count to result set size', function () {
                    images.itemsFound = 50;

                    images.query('duck');
                    deferredLoad.resolve({
                        items: [{id:6}, {id:29}, {id:55}]
                    });
                    $rootScope.$apply();

                    expect(images.itemsFound).toEqual(3);
                });
            });
        });
    });

    describe('more() method', function () {
        var deferredLoad,
            $rootScope;

        beforeEach(inject(function (_$rootScope_, $q) {
            $rootScope = _$rootScope_;
            deferredLoad = $q.defer();
            spyOn(images, 'load').andReturn(deferredLoad.promise);
        }));

        it('moves the next page of preloaded images to displayed',
            function () {
                var i;

                images.displayed = [{id:1}, {id:2}, {id:3}];
                images.loaded = [];
                for (i = 4; i <= 13; i++) {
                    images.loaded.push({id:i});  // 10 items (IDs 4 to 13)
                }
                images.itemsPerPage = 5;

                images.more();

                expect(images.displayed.length).toEqual(8);
                for (i = 0; i < 8; i++) {
                      // IDs 1 to 8
                    expect(images.displayed[i].id).toEqual(i + 1);
                }

                expect(images.loaded.length).toEqual(5);
                for (i = 0; i < 5; i++) {
                    // IDs 9 to 13
                    expect(images.loaded[i].id).toEqual(i + 9);
                }
        });

        it('preloads another page of images if available', function () {
            var len,
                slice;
            images.displayed = [];
            images.loaded = [{id:1}, {id:2}, {id:3}, {id:4}, {id:5}];
            images.tracker.next();  // one page has been loaded before

            images.canLoadMore = true;
            images.itemsPerPage = 5;
            images.searchFilter = 'bear';

            images.more();
            deferredLoad.resolve({
                 items: [{id:6}, {id:7}, {id:8}, {id:9}, {id:10}]
            });
            $rootScope.$apply();

            expect(images.load).toHaveBeenCalledWith(2, 'bear');

            len = images.loaded.length;
            slice = images.loaded.slice(len - 5);
            expect(slice).toEqual(
                [{id:6}, {id:7}, {id:8}, {id:9}, {id:10}]
            );
        });

        it('does not try to preload another page of images if not available',
            function () {
                images.canLoadMore = false;
                images.more();
                $rootScope.$apply();
                expect(images.load).not.toHaveBeenCalled();
        });
    });

    describe('load() method', function () {
        var NcImage,
            queryDeferred,
            searchResults;

        beforeEach(inject(function ($q, _NcImage_) {
            NcImage = _NcImage_;

            searchResults = [];
            queryDeferred = $q.defer()
            searchResults.$promise = queryDeferred.promise;
            spyOn(NcImage,'query').andReturn(searchResults);

            images.itemsPerPage = 50;
        }));

        it('searches for images with correct parameters)', function () {
            images.load(2, 'lion');
            expect(NcImage.query).toHaveBeenCalledWith(2, 50, 'lion');
        });

        it('removes a page of images on API error',
            inject(function ($rootScope) {
                spyOn(images.tracker, 'remove');

                images.load(2, 'lion');
                queryDeferred.reject();
                $rootScope.$apply();

                expect(images.tracker.remove).toHaveBeenCalledWith(2);
            })
        );
    });

    describe('loadAttached() method', function () {
        var getAllResponse,
            NcImage;

        beforeEach(inject(function (_NcImage_) {
            NcImage = _NcImage_;
            getAllResponse = [{id: 2}, {id: 5}, {id: 1}];
            spyOn(NcImage, 'getAllByArticle').andReturn(getAllResponse);
        }));

        it('retrieves attached images for the right article', function () {
            images.loadAttached({number: 17, language: 'it'});
            expect(NcImage.getAllByArticle).toHaveBeenCalledWith(17, 'it');
        });

        it('initializes the list of article\'s attached images', function () {
            images.attached = [];
            images.loadAttached({number: 17, language: 'it'});
            expect(images.attached).toEqual(getAllResponse);
        });
    });

    describe('collect() method', function () {

        beforeEach(function () {
            images.displayed = [mock.items[0], mock.items[4], mock.items[7]];
            images.collected = [mock.items[4]];  // id === 5
        });

        it('does not add image again if it is already in basket', function () {
            images.collect(5);
            expect(images.collected.length).toEqual(1);
        });

        it('adds a media archive image to basket', function () {
            images.collect(8);
            expect(images.collected.length).toEqual(2);
            expect(_.contains(images.collected, mock.items[4])).toEqual(true);
            expect(_.contains(images.collected, mock.items[7])).toEqual(true);
        });

        it('does not add image to basket if it is not among ' +
           'the displayed images',
           function () {
                images.collect(42);
                expect(images.collected.length).toEqual(1);
        });

        describe('invoked with loadFromServer flag set', function () {
            var deferredGet,
                NcImage;

            beforeEach(inject(function ($q, _NcImage_) {
                deferredGet = $q.defer();
                NcImage = _NcImage_;
                spyOn(NcImage, 'getById').andReturn(deferredGet.promise);
            }));

            it('tries to retrieve data of a correct image', function () {
                images.collect(1, true);
                expect(NcImage.getById).toHaveBeenCalledWith(1);
            });

            it('adds retrieved image object to basket',
                inject(function ($rootScope) {
                    images.collect(1, true);
                    deferredGet.resolve(mockSingle);
                    $rootScope.$apply();

                    expect(images.collected.length).toEqual(2);
                    expect(_.find(images.collected, {id: 5})).toBeDefined();
                    expect(_.find(images.collected, {id: 1})).toBeDefined();
                })
            );
        });
    });

    describe('discard() method', function () {
        it('removes image from basket', function () {
            images.collected = [mock.items[0], mock.items[6], mock.items[9]];
            images.discard(7);

            expect(images.collected.length).toEqual(2);

            // test that target image was removed  - and nothing else
            expect(
                _.findIndex(images.collected, {id: 7})
            ).toEqual(-1);

            expect(
                _.findIndex(images.collected, {id: 1})
            ).toBeGreaterThan(-1);

            expect(
                _.findIndex(images.collected, {id: 10})
            ).toBeGreaterThan(-1);
        });

        it('does not do anything for images already not in basket',
            function () {
                images.collected = [mock.items[0], mock.items[4]];
                images.discard(42);

                // test that nothing was removed
                expect(images.collected.length).toEqual(2);

                expect(
                    _.findIndex(images.collected, {id: 1})
                ).toBeGreaterThan(-1);

                expect(
                    _.findIndex(images.collected, {id: 5})
                ).toBeGreaterThan(-1);
        });
    });

    describe('discardAll() method', function () {
        it('empties the basket', function () {
            images.collected = [mock.items[0], mock.items[6], mock.items[9]];
            images.discardAll();
            expect(images.collected.length).toEqual(0);
        });

        it('empties the images2upload list',
            function () {
                images.images2upload = [{}, {}, {}];
                images.discardAll();
                expect(images.images2upload.length).toEqual(0);
        });
    });

    describe('attachAllCollected() method', function () {
        var deferredAdd,
            NcImage;

        beforeEach(inject(function ($q, _NcImage_) {
            NcImage = _NcImage_;
            deferredAdd = $q.defer();
            spyOn(NcImage, 'addAllToArticle').andReturn(deferredAdd.promise);
        }));

        it('tries to attach images in basket to correct article', function () {
            images.collected = [
                mock.items[1], mock.items[4], mock.items[5]
            ];
            images.attached = [];

            images.attachAllCollected();

            expect(NcImage.addAllToArticle).toHaveBeenCalledWith(
                64, 'de', [mock.items[1], mock.items[4], mock.items[5]]
            );
        });

        it('does not try to attach already attached images', function () {
            images.collected = [
                mock.items[1], mock.items[4], mock.items[5]
            ];
            images.attached = [mock.items[4]];

            images.attachAllCollected();

            expect(NcImage.addAllToArticle).toHaveBeenCalledWith(
                64, 'de', [mock.items[1], mock.items[5]]
            );
        });

        it('does not try to attach anything if there are no images to attach',
            function () {
                images.collected = [mock.items[0], mock.items[3]];
                images.attached = [
                    mock.items[0], mock.items[3], mock.items[7]
                ];

                images.attachAllCollected();

                expect(NcImage.addAllToArticle).not.toHaveBeenCalled();
            }
        );

        it('updates attached images list on success',
            inject(function ($rootScope) {
                images.collected = [
                    mock.items[0], mock.items[4], mock.items[6]
                ];
                images.attached = [mock.items[0]];

                images.attachAllCollected();
                deferredAdd.resolve();
                $rootScope.$apply();

                expect(images.attached.length).toEqual(3);

                // existing images are not overriden
                expect(
                    _.contains(images.attached, mock.items[0])).toEqual(true);

                // all new images are added to the list
                expect(
                    _.contains(images.attached, mock.items[4])).toEqual(true);
                expect(
                    _.contains(images.attached, mock.items[6])).toEqual(true);
            })
        );
    });

    describe('detach() method', function () {
        var deferredRemove,
            image;

        beforeEach(inject(function ($q, NcImage) {
            image = Object.create(NcImage.prototype);
            image.id = 5;

            deferredRemove = $q.defer();
            spyOn(image, 'removeFromArticle')
                .andReturn(deferredRemove.promise);

            images.attached = [{id: 1}, image, {id: 8}];
        }));

        it('does not try to detach an already detached image', function () {
            images.detach(99);
            expect(image.removeFromArticle).not.toHaveBeenCalled();
        });

        it('tries to remove an image from the correct article', function () {
            images.detach(5);
            expect(image.removeFromArticle).toHaveBeenCalledWith(64, 'de');
        });

        it('remove an image from the list of attached images on success',
            inject(function ($rootScope) {
                images.detach(5);
                deferredRemove.resolve();
                $rootScope.$apply();

                expect(images.attached).toEqual([{id: 1}, {id: 8}]);
            })
        );
    });

    describe('addToIncluded() method', function () {
        it('adds image ID to the inArticleBody list', function () {
            images.inArticleBody = {2: true, 15: true, 99: true};
            images.addToIncluded(77);
            expect(images.inArticleBody).toEqual({
                2: true, 15: true, 77: true, 99: true
            });
        });
    });

    describe('removeFromIncluded() method', function () {
        it('removes image ID from the inArticleBody list', function () {
            images.inArticleBody = {2: true, 15: true, 99: true};
            images.removeFromIncluded(15);
            expect(images.inArticleBody).toEqual({2: true, 99: true});
        });
    });

    describe('findAttached() method', function () {
        it('returns correct image from the attached images list',
            function () {
                var returned = null;

                images.attached = [
                    mock.items[4],
                    mock.items[7],
                    mock.items[2],  // id === 3
                    mock.items[1]
                ];

                returned = images.findAttached(3);
                expect(returned).toEqual(mock.items[2]);
        });

        it('returns undefined if image is not in the attached images list',
            function () {
                var returned = null;

                images.attached = [
                    mock.items[4],
                    mock.items[7],
                    mock.items[2],  // id === 3
                    mock.items[1]
                ];

                returned = images.findAttached(42);
                expect(typeof returned).toEqual('undefined');
        });
    });

    describe('findCollected() method', function () {
        it('returns correct image from the images in basket',
            function () {
                var returned = null;

                images.collected = [
                    mock.items[4],
                    mock.items[7],
                    mock.items[2],  // id === 3
                    mock.items[1]
                ];

                returned = images.findCollected(3);
                expect(returned).toEqual(mock.items[2]);
        });

        it('returns undefined if image is not in the basket', function () {
                var returned = null;

                images.collected = [
                    mock.items[4],
                    mock.items[7],
                    mock.items[2],
                    mock.items[1]
                ];

                returned = images.findCollected(42);
                expect(typeof returned).toEqual('undefined');
        });
    });

    describe('byId() method', function () {
        it('returns correct image from the the attached images list',
            function () {
                var returned = null;

                images.attached = [
                    mock.items[4],
                    mock.items[7],
                    mock.items[2],  // id === 3
                    mock.items[1]
                ];

                returned = images.byId(3);
                expect(returned).toEqual(mock.items[2]);
        });

        it('raises an error if image is not in the attached images list',
            function () {
                images.attached = [
                    mock.items[4],
                    mock.items[7],
                    mock.items[2],
                    mock.items[1]
                ];
                expect(function () { images.byId(42); }).toThrow();
        });
    });

    describe('isAttached() method', function () {
        it('returns true for attached image', function () {
            images.attached = [
                mock.items[4],
                mock.items[7],
                mock.items[2],  // id === 3
                mock.items[1]
            ];
            expect(images.isAttached(3)).toBe(true);
        });

        it('returns false for image that is not attached', function () {
            images.attached = [
                mock.items[4],
                mock.items[7],
                mock.items[2],
                mock.items[1]
            ];
            expect(images.isAttached(42)).toBe(false);
        });
    });

    describe('isCollected() method', function () {
        it('returns true for image in basket', function () {
            images.collected = [
                mock.items[4],
                mock.items[7],
                mock.items[2],  // id === 3
                mock.items[1]
            ];
            expect(images.isCollected(3)).toBe(true);
        });

        it('returns false for image that is not in basket', function () {
            images.collected = [
                mock.items[4],
                mock.items[7],
                mock.items[2],
                mock.items[1]
            ];
            expect(images.isCollected(42)).toBe(false);
        });
    });

    describe('togglerClass() method', function () {
        beforeEach(function () {
            images.collected = [{id:2}, {id:7}];
        });

        it('returns correct class for images in basket', function () {
            expect(images.togglerClass(7)).toEqual('glyphicon-minus');
        });

        it('returns correct class for images *not* in basket', function () {
            expect(images.togglerClass(101)).toEqual('glyphicon-plus');
        });
    });

    describe('toggleCollect() method', function () {
        beforeEach(function () {
            spyOn(images, 'collect');
            spyOn(images, 'discard');
            spyOn(images, 'isCollected').andCallFake(function (id) {
                return (id === 7);
            });
        });

        it('removes image from basket if it is already in it', function () {
            images.toggleCollect(7);
            expect(images.discard).toHaveBeenCalledWith(7);
        });

        it('adds image to basket if it is *not* already in it', function () {
            images.toggleCollect(42);
            expect(images.collect).toHaveBeenCalledWith(42);
        });
    });

    describe('addToUploadList() method', function () {
        beforeEach(function () {
            spyOn(images, 'decorate').andCallFake(function (image) {
                image.readRawData = function () {
                    image.b64data = btoa('xyz');
                };
                return image;
            });
        });

        it('adds images to upload list', function () {
            images.images2upload = [
                mock.items[4],
            ];

            images.addToUploadList([mock.items[1], mock.items[8]]);

            expect(images.images2upload.length).toEqual(3);

            // existing images are not overriden
            expect(_.contains(images.images2upload, mock.items[4]))
                .toEqual(true);

            // new images are added to the list
            expect(_.contains(images.images2upload, mock.items[1]))
                .toEqual(true);
            expect(_.contains(images.images2upload, mock.items[8]))
                .toEqual(true);
        });

        it('decorates images', function () {
            images.images2upload = [
                mock.items[4],
            ];

            images.addToUploadList([mock.items[1], mock.items[8]]);

            expect(images.decorate.callCount).toEqual(2);
            expect(images.decorate).toHaveBeenCalledWith(mock.items[1]);
            expect(images.decorate).toHaveBeenCalledWith(mock.items[8]);
        });
    });

    describe('removeFromUploadList() method', function () {
        it('removes image from the images2upload list', function () {
            images.images2upload = [mock.items[1], mock.items[6]];
            images.removeFromUploadList(mock.items[1]);
            expect(images.images2upload).toEqual([mock.items[6]]);
        });
    });

    describe('clearUploadList() method', function () {
        it('clears the images2upload list', function () {
            images.images2upload = [mock.items[1], mock.items[6]];
            images.clearUploadList();
            expect(images.images2upload).toEqual([]);
        });
    });

    describe('uploadAll() method', function () {
        var img_1,
            img_2,
            img_3;

        beforeEach(function () {
            img_1 = angular.copy(mock.items[4]);
            img_2 = angular.copy(mock.items[6]);
            img_3 = angular.copy(mock.items[7]);

            images.images2upload = [img_1, img_2, img_3];
            images.images2upload.forEach(function (img) {
                img.startUpload = jasmine.createSpy().andCallFake(function () {
                    return {promiseOf: img.id};  // fake promise object
                });
            });
        });

        it('starts uploads for all images in images2upload list', function () {
            images.uploadAll();
            expect(img_1.startUpload).toHaveBeenCalled();
            expect(img_2.startUpload).toHaveBeenCalled();
            expect(img_3.startUpload).toHaveBeenCalled();
        });

        it('returns a list of all upload promises', function () {
            var promises = images.uploadAll();

            expect(
                _.findIndex(promises, {promiseOf: 5})
            ).toBeGreaterThan(-1);

            expect(
                _.findIndex(promises, {promiseOf: 7})
            ).toBeGreaterThan(-1);

            expect(
                _.findIndex(promises, {promiseOf: 8})
            ).toBeGreaterThan(-1);
        });
    });

    describe('image decorated with decorate() method:', function () {
        var decoratedImg;

        beforeEach(function () {
            var imgContents = [
                '\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x00\x00\x00\x21' +
                '\xF9\x04\x01\x0A\x00\x01\x00\x2C\x00\x00\x00\x00\x01\x00' +
                '\x01\x00\x00\x02\x02\x4C\x01\x00\x3B'
            ];  // a small 1x1 transparent GIF

            decoratedImg = new Blob(imgContents, {type : 'image/gif'});
            decoratedImg = images.decorate(decoratedImg);
        });

        it('has isUploaded flag cleared by default', function () {
            expect(decoratedImg.isUploaded).toEqual(false);
        });

        it('has uploaded bytes counter initialized to zero', function () {
            expect(decoratedImg.progress).toEqual(0);
        });

        it('has max bytes to upload value initialized to zero', function () {
            expect(decoratedImg.max).toEqual(0);
        });

        it('has progress meter initialized to 0%', function () {
            expect(decoratedImg.percent).toEqual('0%');
        });

        describe('progressCallback() method', function () {
            var eventObj;

            beforeEach(function () {
                eventObj = {loaded: 30, total: 90};
            });

            it('updates the uploaded bytes counter', function () {
                decoratedImg.progressCallback(eventObj);
                expect(decoratedImg.progress).toEqual(30);
            });

            it('sets the max bytes to upload property', function () {
                decoratedImg.progressCallback(eventObj);
                expect(decoratedImg.max).toEqual(90);
            });

            it('updates progress meter (to a rounded value)', function () {
                decoratedImg.progressCallback(eventObj);
                expect(decoratedImg.percent).toEqual('33%');
            });
        });

        describe('startUpload() method', function () {
            var headersCheck,
                postData,
                url;

            beforeEach(inject(function (formDataFactory) {
                spyOn(formDataFactory, 'makeInstance').andCallFake(
                    // factory should return a fake FormData object that we
                    // can actually inspect in tests (built-in FormData is not
                    // inspectable - browser security constraint)
                    function () {
                        var dict = {};
                        return {
                            append: function (key, value) {
                                dict[key] = value;
                            },
                            dict: dict
                        };
                    }
                );

                postData = formDataFactory.makeInstance();
                postData.dict = {
                    'image[image]': decoratedImg,
                    'image[photographer]': 'John Doe',
                    'image[description]': 'image description'
                };

                headersCheck = function (headers) {
                    // when uploading files we need to set Content-Type header
                    // to undefined (overriding Angular's default of
                    // application/json).
                    return typeof headers['Content-Type'] === 'undefined';
                };

                url = Routing.generate(
                    'newscoop_gimme_images_createimage', {}, true);

                $httpBackend.expectPOST(url, postData, headersCheck)
                .respond(
                    201, null,
                    {'X-Location' : 'http://foo.com/images/4321'},
                    'Created'
                );

                decoratedImg.isUploaded = false;
                decoratedImg.photographer = 'John Doe';
                decoratedImg.description = 'image description';
            }));  // end beforeEach

            afterEach(function () {
                $httpBackend.verifyNoOutstandingExpectation();
            });

            it('sends correct API request', function () {
                decoratedImg.startUpload();
                // test will fail if http expectation is not fulfilled
                // (= misformed POST request sent)
            });

            // XXX: how to test progress callbacks?

            it('converts undefined values to empty strings', function () {
                postData.dict['image[photographer]']= '';
                postData.dict['image[description]']= '';

                $httpBackend.resetExpectations();
                $httpBackend.expectPOST(url, postData, headersCheck)
                .respond(
                    201, null,
                    {'X-Location' : 'http://foo.com/images/4321'},
                    'Created'
                );

                decoratedImg.photographer = undefined;
                decoratedImg.description = undefined;
                decoratedImg.startUpload();
                // test will fail if http expectation is not fulfilled
                // (= misformed POST request sent)
            });

            it('sets isUploaded flag on success', function () {
                decoratedImg.startUpload();
                $httpBackend.flush(1);
                expect(decoratedImg.isUploaded).toEqual(true);
            });

            it('sets image\'s server ID on success', function () {
                decoratedImg.startUpload();
                $httpBackend.flush(1);
                expect(decoratedImg.id).toEqual(4321);
            });

            it('resolves upload promise with correct data', function () {
                var promise = decoratedImg.startUpload();

                promise.then(function (data) {
                    expect(data).toEqual({
                        id: 4321,
                        url: 'http://foo.com/images/4321'
                    });
                });

                $httpBackend.flush(1);
            });

            it('rejects given upload promise if API' +
               'returns no x-location header in response',
                function () {
                    var url = Routing.generate(
                        'newscoop_gimme_images_createimage', {}, true
                    );

                    $httpBackend.resetExpectations();
                    $httpBackend.expectPOST(url)
                        .respond(201, null, {}, 'Created');

                    decoratedImg.startUpload().then(function () {
                        // success should not happen, fail the test
                        expect(true).toEqual(false);
                    }, function (reason) {
                        expect(reason.indexOf('x-location header'))
                            .toBeGreaterThan(-1);
                    });

                    $httpBackend.flush(1);
            });

            it('rejects given upload promise on API error', function () {
                var url = Routing.generate(
                    'newscoop_gimme_images_createimage', {}, true
                );

                $httpBackend.resetExpectations();
                $httpBackend.expectPOST(url).respond(500);

                decoratedImg.startUpload().then(function () {
                    // success should not happen, fail the test
                    expect(true).toEqual(false);
                }, function (reason) {
                    expect(reason).toEqual('error uploading');
                });

                $httpBackend.flush(1);
            });

        });

        describe('readRawData() method', function () {
            // Currently only Firefox implements a native Object.watch()
            // method. For other browsers we need to define our own function.
            //
            // BTW, kudos to the guy who wrote it:
            // https://gist.github.com/eligrey/384583
            function watch (prop, handler) {
                var val = this[prop],
                    getter = function () {
                        return val;
                    },
                    setter = function (newVal) {
                        return val = handler.call(this, prop, val, newVal);
                    };

                if (delete this[prop]) { // can't watch constants
                    if (Object.defineProperty) { // ECMAScript 5
                        Object.defineProperty(this, prop, {
                           get: getter,
                           set: setter
                        });
                    } else if (
                        Object.prototype.__defineGetter__ &&
                        Object.prototype.__defineSetter__
                    ) {
                        //legacy
                        Object.prototype.__defineGetter__.call(
                            this, prop, getter);
                        Object.prototype.__defineSetter__.call(
                            this, prop, setter);
                    }
                }
            };

            beforeEach(inject(function (imageFactory) {
                // The readRawData() method contains an async event handler
                // inside of another async event handler (img.onload inside of
                // reader.onload). The problem is that this internal async
                // handler is never triggered in tests, but we still want to
                // test it.
                // The solution is to observe the changes of the image's 'src'
                // attribute and when the change happens, we manually trigger
                // that image's onload handler (in an async fashion).
                spyOn(imageFactory, 'makeInstance').andCallFake(function () {
                    var fakeImg = {
                        watch: this.watch || watch
                    };

                    fakeImg.watch('src', function (prop, val, newVal) {
                        fakeImg.width = 155;  // just some made-up numbers
                        fakeImg.height = 76;
                        setTimeout(function () {
                            fakeImg.onload({
                                target: {result: newVal}
                            });
                        }, 0);
                        return newVal;
                    });
                    return fakeImg;
                });
            }));

            it('asynchronously reads image data', function () {
                var expectedDataUrl,
                    readPromise,
                    promiseResolved = false;

                expectedDataUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAA' +
                    'CHDuQQBCgABACwAAAAAAQABAAACAkwBADs=';

                runs(function () {
                    readPromise = decoratedImg.readRawData();
                    readPromise.then(function () {
                        promiseResolved = true;
                    });
                    // verify that reading data is indeed asynchronous
                    expect(typeof decoratedImg.src).toEqual('undefined');
               });

                waitsFor(function () {
                    return promiseResolved;
                }, 'the image data has been read');

                runs(function () {
                    expect(decoratedImg.src).toEqual(expectedDataUrl);
                    expect(decoratedImg.width).toEqual(155);
                    expect(decoratedImg.height).toEqual(76);
                });
            });
        });
    });

});
