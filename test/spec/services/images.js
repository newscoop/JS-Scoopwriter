'use strict';

describe('Service: Images', function () {
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
            "itemsPerPage":10,
            "currentPage":1,
            "itemsCount":149735,
            "nextPageLink":"https:\/\/tw-merge.lab.sourcefabric.org\/api\/images?page=2&items_per_page=10"
        }
    };
    var mockSingle = {
        "id":1,
        "location":"local",
        "basename":"cms-image-000000001.jpg",
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
    var Images, $httpBackend;
    beforeEach(inject(function (_images_, _$httpBackend_) {
        Images = _images_;
        $httpBackend = _$httpBackend_;
    }));
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('after initialization', function() {
        beforeEach(function() {
            $httpBackend
                .expect('GET', '/api/images?page=1')
                .respond(mock);
            $httpBackend
                .expect('GET', '/api/images?page=2')
                .respond(mock);
            Images.init();
            $httpBackend.flush(1);
        });
        it('shows the first batch of images immediately', function () {
            expect(Images.loaded.length).toBe(0);
            expect(Images.displayed.length).toBe(10);
            $httpBackend.flush();
        });
        it('loads the second batch of images but does not show them', function () {
            $httpBackend.flush();
            expect(Images.loaded.length).toBe(10);
            expect(Images.displayed.length).toBe(10);
        });
        describe('image attached to the article', function() {
            beforeEach(function() {
                $httpBackend
                    .expect('GET', '/api/images/3')
                    .respond(mockSingle);
                expect(Images.attached.length).toBe(0);
                Images.attach(3);
                $httpBackend.flush();
            });
            it('updates the attached', function() {
                expect(Images.attached.length).toBe(1);
                expect(Images.attached[0].width).toBe('150');
            });
            it('does not attach duplicates', function() {
                Images.attach(3);
                expect(Images.attached.length).toBe(1);
            });
            it('attaches others', function() {
                $httpBackend
                    .expect('GET', '/api/images/4')
                    .respond(mockSingle);
                Images.attach(4);
                expect(Images.attached.length).toBe(2);
                $httpBackend.flush();
            });
            afterEach(function() {
            });
        });
        it('handles the loaded buffer properly', function() {
            $httpBackend.flush();
            $httpBackend
                .expect('GET', '/api/images?page=3')
                .respond(mock);
            expect(Images.loaded.length).toBe(10);
            expect(Images.displayed.length).toBe(10);
            Images.more();
            expect(Images.loaded.length).toBe(0);
            expect(Images.displayed.length).toBe(20);
            $httpBackend.flush();
            expect(Images.loaded.length).toBe(10);
            expect(Images.displayed.length).toBe(20);
            $httpBackend.expectGET('/api/images?page=4').respond({});
            Images.more();
            expect(Images.loaded.length).toBe(0);
            expect(Images.displayed.length).toBe(30);
            $httpBackend.flush();
        });
    });
    describe('after loading pages successively', function() {
        beforeEach(function() {
            $httpBackend
                .expect('GET', '/api/images?page=1')
                .respond(mock);
            $httpBackend
                .expect('GET', '/api/images?page=2')
                .respond(mock);
            $httpBackend
                .expect('GET', '/api/images?page=3')
                .respond(mock);
            $httpBackend
                .expect('GET', '/api/images?page=4')
                .respond(mock);
            Images.init();
            Images.more();
            Images.more();
            $httpBackend.flush();
        });
        it('does not overlap the requests', function() {
            expect(Images.loaded.length).toBe(30);
            expect(Images.displayed.length).toBe(10);
            /* the most important part of this test is not visible
             * here, it depends on the http request expectations and
             * `afterEach` controls */
        });
    });
});
