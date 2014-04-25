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
    var images, $httpBackend;

    beforeEach(inject(function (_images_, _$httpBackend_) {
        images = _images_;
        images.article = { number: 64, language: 'de'};
        $httpBackend = _$httpBackend_;
    }));

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

    describe('attachAll() method', function () {
        var modal;

        beforeEach(inject(function (_modal_) {
            modal = _modal_;
            spyOn(images, 'attachBulk');
            spyOn(modal, 'hide');
        }));

        it('attaches all images currently in basket', function () {
            images.collected = [mock.items[4], mock.items[6]];
            images.attachAll();
            expect(images.attachBulk).toHaveBeenCalledWith(
                [mock.items[4].id, mock.items[6].id]
            );
        });

        it('does not attach anything if basket is empty', function () {
            images.collected = [];
            images.attachAll();
            expect(images.attachBulk).not.toHaveBeenCalled();
        });

        it('empties the basket', function () {
            images.collected = [mock.items[4], mock.items[6]];
            images.attachAll();
            expect(images.collected.length).toEqual(0);
        });

        it('hides the modal', function () {
            images.attachAll();
            expect(modal.hide).toHaveBeenCalled();
        });
    });

    describe('attachAllUploaded() method', function () {
        beforeEach(function () {
            spyOn(images, 'attachBulk');
        });

        it('only attaches uploaded images to the article', function () {
            images.images2upload = [
                {id: 12, isUploaded: true},
                {id: 27, isUploaded: false}
            ];
            images.attachAllUploaded();
            expect(images.attachBulk).toHaveBeenCalledWith([12], true);
        });

        it('does not do anything if there are no uploaded images',
            function () {
                images.images2upload = [
                    {id: 12, isUploaded: false},
                    {id: 27, isUploaded: false}
                ];
                images.attachAllUploaded();
                expect(images.attachBulk).not.toHaveBeenCalled();
        });
    });

    describe('attachBulk() method', function () {
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

            images.attachBulk([2, 5, 6]);
            $httpBackend.flush();

            expect(linkHeaderSpy.mostRecentCall.args[0].Link).toEqual(
                ['<', rootURI, '/images/2>,',
                 '<', rootURI, '/images/5>,',
                 '<', rootURI, '/images/6>'].join('')
            );
        });

        it('does not try to attach already attached images', function () {
            images.attached = [mock.items[4]];  // id === 5

            images.attachBulk([2, 5, 6]);
            $httpBackend.flush();

            expect(linkHeaderSpy.mostRecentCall.args[0].Link).toEqual(
                ['<', rootURI, '/images/2>,',
                 '<', rootURI, '/images/6>'].join('')
            );
        });

        it('does not invoke API if there is nothing to attach', function () {
            images.attached = [mock.items[0], mock.items[3], mock.items[7]];
            $httpBackend.resetExpectations();
            images.attachBulk([4, 8]);
        });

        it('updates attached images list on positive server response',
            function () {
                images.displayed = [
                    mock.items[0], mock.items[4], mock.items[6], mock.items[8]
                ];
                images.attached = [mock.items[0]];

                images.attachBulk([5, 9]);
                $httpBackend.flush();

                expect(images.attached.length).toEqual(3);

                // existing images are not overriden
                expect(
                    _.contains(images.attached, mock.items[0])).toEqual(true);

                // all new images are added to the list
                expect(
                    _.contains(images.attached, mock.items[4])).toEqual(true);
                expect(
                    _.contains(images.attached, mock.items[8])).toEqual(true);
        });

        it('retrieves uploaded images\' info if necessary', function () {
            images.attached = [];

            $httpBackend.expectGET(rootURI + '/images/2').respond(200, {});
            $httpBackend.expectGET(rootURI + '/images/6').respond(200, {});

            images.attachBulk([2, 6], true);
            $httpBackend.flush();
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
        describe('image collected', function() {
            beforeEach(function() {
                $httpBackend.flush();
                images.toggleCollect(3);
            });
            it('updates the basket', function() {
                expect(images.collected.length).toBe(1);
                expect(images.collected[0].basename).toBe('cms-image-000000003.jpg');
            });
            it('does not collect duplicates', function() {
                images.collect(3);
                expect(images.collected.length).toBe(1);
            });
            it('collects others', function() {
                images.toggleCollect(4);
                expect(images.collected.length).toBe(2);
            });
            it('provides the correct toggler class', function() {
                expect(images.togglerClass(3)).toBe('glyphicon-minus');
                expect(images.togglerClass(4)).toBe('glyphicon-plus');
            });
            it('can discard all', function() {
                expect(images.collected.length).toBe(1);
                images.discardAll();
                expect(images.collected.length).toBe(0);
            });
            describe('same image discarded', function() {
                beforeEach(function() {
                    images.toggleCollect(3);
                });
                it('detaches the image', function() {
                    expect(images.isCollected(3)).toBe(false);
                });
            });
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
