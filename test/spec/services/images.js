'use strict';

/**
* Module with tests for the images service.
*
* @module Images service tests
*/

describe('Service: Images', function () {
    var e = rootURI;
    var mock = {
        "items":[
            {
                "id":1,
                "basename":"cms-image-000000001.jpg"
            },
            {
                "id":2,
                "basename":"cms-image-000000002.jpg"
            },
            {
                "id":3,
                "basename":"cms-image-000000003.jpg"
            },
            {
                "id":4,
                "basename":"cms-image-000000004.jpg"
            },
            {
                "id":5,
                "basename":"cms-image-000000005.jpg"
            },
            {
                "id":6,
                "basename":"cms-image-000000006.jpg"
            },
            {
                "id":7,
                "basename":"cms-image-000000007.jpg"
            },
            {
                "id":8,
                "basename":"cms-image-000000008.jpg"
            },
            {
                "id":9,
                "basename":"cms-image-000000009.jpg"
            },
            {
                "id":10,
                "basename":"cms-image-000000010.jpg"
            }
        ],
        "pagination":{
            "itemsPerPage":50,
            "currentPage":1,
            "itemsCount":149735,
            "nextPageLink":"https:\/\/newscoop.aes.sourcefabric.net\/content-api\/images?page=2&items_per_page=10"
        }
    };
    var mockSingle = {
        "id":1,
        "location":"local",
        "basename":"mock-single.jpg",
        "thumbnailPath":"cms-thumb-000000001.jpg",
        "url":"",
        "description":"",
        "width":"150",
        "height":"210",
        "photographer":"",
        "photographerUrl":"",
        "place":""
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

    describe('load() method', function () {
        it('issues a correct API call', function () {
            $httpBackend.expectGET(
                e + '/images?items_per_page=50&page=4&expand=true'
            ).respond(mock);

            images.load(4);
            $httpBackend.flush(1);
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('removes a page of images on API error', function () {
            spyOn(images.tracker, 'remove');

            $httpBackend.expectGET(
                e + '/images?items_per_page=50&page=4&expand=true'
            ).respond(500, 'Internal Server Error');

            images.load(4);
            $httpBackend.flush(1);

            expect(images.tracker.remove).toHaveBeenCalledWith(4);
        });
    });

    describe('loadAttached() method', function () {
        beforeEach(function () {
            $httpBackend
                .expect('GET', e + '/articles/64/de/images?expand=true')
                .respond(mock);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('initializes the list of article\'s attached images', function () {
            images.attached = [];

            images.loadAttached({number: 64, language: 'de'});
            $httpBackend.flush(1);

            expect(images.attached).toEqual(mock.items);
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
            var httpBackend;

            beforeEach(inject(function (_$httpBackend_) {
                httpBackend = _$httpBackend_;
                httpBackend
                    .expectGET(rootURI + '/images/1')
                    .respond(200, mockSingle);
            }));

            afterEach(function () {
                httpBackend.verifyNoOutstandingExpectation();
            });

            it('retrieves image data from server', function () {
                images.collect(1, true);
            });

            it('add retrieved image object to basket', function () {
                images.collect(1, true);
                httpBackend.flush(1);

                expect(images.collected.length).toEqual(2);

                expect(
                    _.findIndex(images.collected, {id: 5})
                ).toBeGreaterThan(-1);

                expect(
                    _.findIndex(images.collected, {id: 1})
                ).toBeGreaterThan(-1);
            });
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
        var headerCheckers,
            linkHeaderSpy;

        headerCheckers = {
            Link: function (headers) {
                return 'Link' in headers;
            }
        };

        beforeEach(function () {
            linkHeaderSpy = spyOn(headerCheckers, 'Link').andCallThrough();
            $httpBackend.expect(
                'LINK',
                rootURI + '/articles/64/de',
                undefined,
                headerCheckers.Link
            ).respond(201, '');
        });

        afterEach(function () {
            // the following also raises an error in cases when unexpected
            // requests have been made (even if all other expectations
            // have been fulfilled)
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('correctly invokes backend API', function () {
            images.collected = [
                mock.items[1], mock.items[4], mock.items[5]
            ];
            images.attached = [];

            images.attachAllCollected();
            $httpBackend.flush();

            expect(linkHeaderSpy.mostRecentCall.args[0].Link).toEqual(
                ['<', rootURI, '/images/2>,',
                 '<', rootURI, '/images/5>,',
                 '<', rootURI, '/images/6>'].join('')
            );
        });

        it('does not try to attach already attached images', function () {
            images.collected = [
                mock.items[1], mock.items[4], mock.items[5]
            ];
            images.attached = [mock.items[4]];

            images.attachAllCollected();
            $httpBackend.flush();

            expect(linkHeaderSpy.mostRecentCall.args[0].Link).toEqual(
                ['<', rootURI, '/images/2>,',
                 '<', rootURI, '/images/6>'].join('')
            );
        });

        it('does not invoke API if there is nothing to attach', function () {
            images.attached = [mock.items[0], mock.items[3], mock.items[7]];
            images.collected = [mock.items[0], mock.items[3]];
            $httpBackend.resetExpectations();
            images.attachAllCollected();
        });

        it('updates attached images list on positive server response',
            function () {
                images.collected = [
                    mock.items[0], mock.items[4], mock.items[6]
                ];
                images.attached = [mock.items[0]];

                images.attachAllCollected();
                $httpBackend.flush();

                expect(images.attached.length).toEqual(3);

                // existing images are not overriden
                expect(
                    _.contains(images.attached, mock.items[0])).toEqual(true);

                // all new images are added to the list
                expect(
                    _.contains(images.attached, mock.items[4])).toEqual(true);
                expect(
                    _.contains(images.attached, mock.items[6])).toEqual(true);
        });
    });


    describe('attach() method', function () {
        var headerCheckers,
            linkHeaderSpy;

        headerCheckers = {
            Link: function (headers) {
                return 'Link' in headers;
            }
        };

        beforeEach(function () {
            linkHeaderSpy = spyOn(headerCheckers, 'Link').andCallThrough();
            $httpBackend.expect(
                'LINK',
                rootURI + '/articles/64/de',
                undefined,
                headerCheckers.Link
            ).respond(201, '');
        });

        afterEach(function () {
            // the following also raises an error in cases when unexpected
            // requests have been made (even if all other expectations
            // have been fulfilled)
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('correctly invokes backend API', function () {
            images.attached = [];

            images.attach(5);
            $httpBackend.flush();

            expect(linkHeaderSpy.mostRecentCall.args[0].Link).toEqual(
                '<' + rootURI + '/images/5>'
            );
        });

        it('does not try to attach an already attached image', function () {
            images.attached = [mock.items[4]];  // id === 5
            $httpBackend.resetExpectations();
            images.attach(5);
        });

        it('updates attached images list on positive server response',
            function () {
                images.displayed = [
                    mock.items[0], mock.items[4], mock.items[6]
                ];
                images.attached = [mock.items[0]];

                images.attach(5);
                $httpBackend.flush();

                expect(images.attached.length).toEqual(2);

                // existing images are not overriden
                expect(
                    _.contains(images.attached, mock.items[0])).toEqual(true);

                // new image is added to the list
                expect(
                    _.contains(images.attached, mock.items[4])).toEqual(true);
        });

        it('retrieves uploaded image\'s info if necessary', function () {
            images.attached = [];

            $httpBackend.expectGET(rootURI + '/images/6').respond(200, {});

            images.attach(6, true);
            $httpBackend.flush();
        });
    });

    describe('detach() method', function () {
        var headerCheckers,
            linkHeaderSpy;

        headerCheckers = {
            Link: function (headers) {
                return 'Link' in headers;
            }
        };

        beforeEach(function () {
            linkHeaderSpy = spyOn(headerCheckers, 'Link').andCallThrough();
        });

        afterEach(function () {
            // the following also raises an error in cases when unexpected
            // requests have been made (even if all other expectations
            // have been fulfilled)
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('correctly invokes backend API', function () {
            images.attached = [mock.items[4], mock.items[7]];

            $httpBackend.expect(
                'UNLINK',
                rootURI + '/articles/64/de',
                undefined,
                headerCheckers.Link
            ).respond(204, '');

            images.detach(5);
            $httpBackend.flush();

            expect(linkHeaderSpy.mostRecentCall.args[0].Link).toEqual(
                '<' + rootURI + '/images/5>'
            );
        });

        it('updates attached images list on positive server response',
            function () {
                images.attached = [mock.items[4], mock.items[7]];

                $httpBackend.expect(
                    'UNLINK',
                    rootURI + '/articles/64/de',
                    undefined,
                    headerCheckers.Link
                ).respond(204, '');

                images.detach(5);
                $httpBackend.flush();

                // check that correct image was removed
                expect(images.attached.length).toEqual(1);
                expect(images.attached[0]).toEqual(mock.items[7]);
        });

        it('does not try to detach an already detached image', function () {
            images.attached = [];
            images.detach(5);
            // there should be no "unexpected request" error
        });
    });

    describe('include() method', function () {
        beforeEach(function () {
            images.attached = [
                angular.copy(mock.items[4]),
                angular.copy(mock.items[7]),  // id === 8
                angular.copy(mock.items[1])
            ];
            images.attached.forEach(function (item) {
                item.included = false;
            });
        });

        it('sets included flag for the given image ID', function () {
            images.include(8);
            expect(images.attached[0].included).toEqual(false);
            expect(images.attached[1].included).toEqual(true);
            expect(images.attached[2].included).toEqual(false);
        });

        it('retuns image\'s index in the included list', function () {
            var index;
            images.included = [mock.items[4], mock.items[1]];
            images.included[0].included = true;
            images.included[1].included = true;
            images.includedIndex = 1;

            index = images.include(8);
            expect(index).toEqual(2);
        });

        it('updates included images list', function () {
            var index;
            images.included = [mock.items[4], mock.items[1]];
            images.included[0].included = true;
            images.included[1].included = true;
            images.includedIndex = 1;

            index = images.include(8);
            expect(images.included.length).toEqual(3);
            expect(images.included[index].id).toEqual(8);
        });

        it('raises an error if given image ID is not found', function () {
            expect(function () { images.include(42); }).toThrow();
        });
    });

    describe('exclude() method', function () {
        beforeEach(function () {
            images.attached = [
                angular.copy(mock.items[4]),
                angular.copy(mock.items[7]),  // id === 8
                angular.copy(mock.items[1])
            ];
            images.attached.forEach(function (item) {
                item.included = true;
            });
        });

        it('clears included flag for the given image ID', function () {
            images.exclude(8);
            expect(images.attached[0].included).toEqual(true);
            expect(images.attached[1].included).toEqual(false);
            expect(images.attached[2].included).toEqual(true);
        });

        it('raises an error if given image ID is not found', function () {
            expect(function () { images.exclude(42); }).toThrow();
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

            beforeEach(inject(function (formDataFactory) {
                var headersCheck,
                    postData;

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

                $httpBackend.expectPOST(
                    rootURI + '/images',
                    postData,
                    headersCheck
                )
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
                    $httpBackend.resetExpectations();
                    $httpBackend.expectPOST(rootURI + '/images')
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
                $httpBackend.resetExpectations();
                $httpBackend.expectPOST(rootURI + '/images')
                    .respond(500);

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

    describe('after initialization', function() {
        beforeEach(function() {
            $httpBackend
                .expect('GET', e+'/images?items_per_page=50&page=1&expand=true')
                .respond(mock);
            $httpBackend
                .expect('GET', e+'/images?items_per_page=50&page=2&expand=true')
                .respond(mock);
            images.init();
            $httpBackend.flush(1);
        });
        it('shows the first batch of images immediately', function () {
            expect(images.loaded.length).toBe(0);
            expect(images.displayed.length).toBe(10);
            $httpBackend.flush();
        });
        it('loads the second batch of images but does not show them', function () {
            $httpBackend.flush();
            expect(images.loaded.length).toBe(10);
            expect(images.displayed.length).toBe(10);
        });
        it('handles the loaded buffer properly', function() {
            $httpBackend.flush();
            $httpBackend
                .expect('GET', e+'/images?items_per_page=50&page=3&expand=true')
                .respond(mock);
            expect(images.loaded.length).toBe(10);
            expect(images.displayed.length).toBe(10);
            images.more();
            expect(images.loaded.length).toBe(0);
            expect(images.displayed.length).toBe(20);
            $httpBackend.flush();
            expect(images.loaded.length).toBe(10);
            expect(images.displayed.length).toBe(20);
            $httpBackend
                .expectGET(e+'/images?items_per_page=50&page=4&expand=true')
                .respond({});
            images.more();
            expect(images.loaded.length).toBe(0);
            expect(images.displayed.length).toBe(30);
            $httpBackend.flush();
        });
    });
    describe('after loading pages successively', function() {
        beforeEach(function() {
            $httpBackend
                .expect('GET', e+'/images?items_per_page=50&page=1&expand=true')
                .respond(mock);
            $httpBackend
                .expect('GET', e+'/images?items_per_page=50&page=2&expand=true')
                .respond(mock);
            $httpBackend
                .expect('GET', e+'/images?items_per_page=50&page=3&expand=true')
                .respond(mock);
            $httpBackend
                .expect('GET', e+'/images?items_per_page=50&page=4&expand=true')
                .respond(mock);
            images.init();
            images.more();
            images.more();
            $httpBackend.flush();
        });
        it('does not overlap the requests', function() {
            expect(images.loaded.length).toBe(30);
            expect(images.displayed.length).toBe(10);
            /* the most important part of this test is not visible
             * here, it depends on the http request expectations and
             * `afterEach` controls */
        });
    });
});
