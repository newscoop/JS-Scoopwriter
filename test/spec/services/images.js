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
            describe('collected images attached', function() {
                var headerHandlers;
                beforeEach(function() {
                    headerHandlers = {
                        '3': function() { return true; },
                        '7': function() { return true; }
                    };
                    spyOn(headerHandlers, '3').andCallThrough();
                    spyOn(headerHandlers, '7').andCallThrough();
                    images.toggleCollect(7);
                    $httpBackend
                        .expect(
                            'LINK',
                            rootURI + '/articles/64/de',
                            undefined,
                            headerHandlers['3']
                        )
                        .respond({});
                    $httpBackend
                        .expect(
                            'LINK',
                            rootURI + '/articles/64/de',
                            undefined,
                            headerHandlers['7']
                        )
                        .respond({});
                    images.attachAll();
                    $httpBackend.flush();
                });
                it('sent the headers correctly', function() {
                    expect(headerHandlers['3']).toHaveBeenCalled();
                    expect(headerHandlers['3'].mostRecentCall.args[0].Link)
                        .toBe('<http://newscoop.aes.sourcefabric.net/content-api/images/3>');
                    expect(headerHandlers['7'].mostRecentCall.args[0].Link)
                        .toBe('<http://newscoop.aes.sourcefabric.net/content-api/images/7>');
                });
                it('gets an image by id', function() {
                    var image = images.byId(3);
                    expect(image).toEqual({ id : 3, basename : 'cms-image-000000003.jpg'});
                });
                it('attaches all the collected images', function() {
                    expect(images.attached.length).toBe(2);
                    expect(images.collected.length).toBe(0);
                });
                describe('image detached', function() {
                    beforeEach(function() {
                        $httpBackend
                            .expect(
                                'UNLINK',
                                rootURI + '/articles/64/de',
                                undefined,
                                headerHandlers['3']
                            )
                            .respond({});
                        images.detach(3);
                    });
                    it('sent the right header', function() {
                        expect(headerHandlers['3'].mostRecentCall.args[0].Link)
                            .toBe('<http://newscoop.aes.sourcefabric.net/content-api/images/3>');
                    });
                    it('detaches the image', function() {
                        $httpBackend.flush();
                        expect(images.attached.length).toBe(1);
                        expect(images.attached[0].id).toBe(7);
                    });
                });
                describe('image included', function() {
                    beforeEach(function() {
                        images.include(3);
                    });
                    it('sets the image as included', function() {
                        var i = images.byId(3);
                        expect(i.included).toBe(true);
                    });
                    it('puts the image in a map', function() {
                        expect(images.included[1]).toBeDefined();
                    });
                    it('gives the image default style', function() {
                        expect(images.included[1].style.container.width)
                            .toBe('100%');
                    });
                    describe('image excluded', function() {
                        beforeEach(function() {
                            images.exclude(3);
                        });
                        it('sets the image as not included', function() {
                            var i = images.byId(3);
                            expect(i.included).toBe(false);
                        });
                    });
                    describe('image excluded with a string id', function() {
                        beforeEach(function() {
                            images.exclude('3');
                        });
                        it('sets the image as not included', function() {
                            var i = images.byId(3);
                            expect(i.included).toBe(false);
                        });
                    });
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
