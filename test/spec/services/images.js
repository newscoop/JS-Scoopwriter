'use strict';

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
            "itemsPerPage":500,
            "currentPage":1,
            "itemsCount":149735,
            "nextPageLink":"https:\/\/tw-merge.lab.sourcefabric.org\/content-api\/images?page=2&items_per_page=10"
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
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('after initialization', function() {
        beforeEach(function() {
            $httpBackend
                .expect('GET', e+'/images?items_per_page=500&page=1')
                .respond(mock);
            $httpBackend
                .expect('GET', e+'/images?items_per_page=500&page=2')
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
        describe('image attached to the article', function() {
            beforeEach(function() {
                $httpBackend
                    .expect('LINK', e+'/articles/64/de')
                    .respond({});
                $httpBackend
                    .expect('GET', e+'/images/3')
                    .respond(mockSingle);
                expect(images.attached.length).toBe(0);
                images.toggleAttach(3);
                $httpBackend.flush();
            });
            it('updates the attached', function() {
                expect(images.attached.length).toBe(1);
                expect(images.attached[0].width).toBe('150');
            });
            it('does not attach duplicates', function() {
                images.attach(3);
                expect(images.attached.length).toBe(1);
            });
            it('attaches others', function() {
                $httpBackend
                    .expect('LINK', e+'/articles/64/de')
                    .respond({});
                $httpBackend
                    .expect('GET', e+'/images/4')
                    .respond(mockSingle);
                images.toggleAttach(4);
                $httpBackend.flush();
                expect(images.attached.length).toBe(2);
            });
            it('gets an image by id', function() {
                var image = images.byId(3);
                expect(image).toEqual({ id : 3, basename : 'cms-image-000000003.jpg', incomplete : false, location : 'local', thumbnailPath : 'cms-thumb-000000001.jpg', url : '', description : '', width : '150', height : '210', photographer : '', photographerUrl : '', place : '' });
            });
            it('provides the correct toggler class', function() {
                expect(images.togglerClass(3)).toBe('glyphicon-minus');
                expect(images.togglerClass(4)).toBe('glyphicon-plus');
            });
            describe('same image detached', function() {
                beforeEach(function() {
                    $httpBackend
                        .expect('UNLINK', e+'/articles/64/de')
                        .respond({});
                    images.toggleAttach(3);
                    $httpBackend.flush();
                });
                it('detaches the image', function() {
                    expect(images.isAttached(3)).toBe(false);
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
        it('handles the loaded buffer properly', function() {
            $httpBackend.flush();
            $httpBackend
                .expect('GET', e+'/images?items_per_page=500&page=3')
                .respond(mock);
            expect(images.loaded.length).toBe(10);
            expect(images.displayed.length).toBe(10);
            images.more();
            expect(images.loaded.length).toBe(0);
            expect(images.displayed.length).toBe(20);
            $httpBackend.flush();
            expect(images.loaded.length).toBe(10);
            expect(images.displayed.length).toBe(20);
            $httpBackend.expectGET(e+'/images?items_per_page=500&page=4').respond({});
            images.more();
            expect(images.loaded.length).toBe(0);
            expect(images.displayed.length).toBe(30);
            $httpBackend.flush();
        });
    });
    describe('after loading pages successively', function() {
        beforeEach(function() {
            $httpBackend
                .expect('GET', e+'/images?items_per_page=500&page=1')
                .respond(mock);
            $httpBackend
                .expect('GET', e+'/images?items_per_page=500&page=2')
                .respond(mock);
            $httpBackend
                .expect('GET', e+'/images?items_per_page=500&page=3')
                .respond(mock);
            $httpBackend
                .expect('GET', e+'/images?items_per_page=500&page=4')
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
