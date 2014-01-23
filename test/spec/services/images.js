'use strict';

describe('Service: Images', function () {

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var Images, $httpBackend;
    beforeEach(inject(function (_images_, _$httpBackend_) {
        Images = _images_;
        $httpBackend = _$httpBackend_;
        $httpBackend.expect('GET', '/api/images?page=1').respond({
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
        });
        Images.more();
        $httpBackend.flush();
    }));
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('loads the first batch of images', function () {
        expect(Images.pagination.currentPage).toBe(1);
        expect(Images.loaded.length).toBe(10);
        expect(Images.displayed.length).toBe(0);
    });
    it('can attach images to the article', function() {
        expect(Images.attached.length).toBe(0);
        Images.attach(3);
        expect(Images.attached.length).toBe(1);
    });
    it('handles a display buffer for pagination', function() {
        $httpBackend
            .expect('GET', '/api/images?page=2')
            .respond({
                "items":[
                    {
                        "id":11,
                        "basename":"cms-image-000000011.jpg"
                    },
                    {
                        "id":12,
                        "basename":"cms-image-000000012.jpg"
                    },
                    {
                        "id":13,
                        "basename":"cms-image-000000013.jpg"
                    },
                    {
                        "id":14,
                        "basename":"cms-image-000000014.jpg"
                    },
                    {
                        "id":15,
                        "basename":"cms-image-000000015.jpg"
                    },
                    {
                        "id":16,
                        "basename":"cms-image-000000016.jpg"
                    },
                    {
                        "id":17,
                        "basename":"cms-image-000000017.jpg"
                    },
                    {
                        "id":18,
                        "basename":"cms-image-000000018.jpg"
                    },
                    {
                        "id":19,
                        "basename":"cms-image-000000019.jpg"
                    },
                    {
                        "id":20,
                        "basename":"cms-image-000000020.jpg"
                    }
                ],
                "pagination":{
                    "itemsPerPage":10,
                    "currentPage":"2",
                    "itemsCount":149735,
                    "nextPageLink":"https:\/\/tw-merge.lab.sourcefabric.org\/api\/images?page=3&items_per_page=10",
                    "previousPageLink":"https:\/\/tw-merge.lab.sourcefabric.org\/api\/images?page=1&items_per_page=10"
                }
            });
        expect(Images.loaded.length).toBe(10);
        expect(Images.displayed.length).toBe(0);
        Images.more();
        expect(Images.loaded.length).toBe(0);
        expect(Images.displayed.length).toBe(10);
        $httpBackend.flush();
        expect(Images.loaded.length).toBe(10);
        expect(Images.displayed.length).toBe(10);
        $httpBackend.expectGET('/api/images?page=3').respond({});
        Images.more();
        expect(Images.loaded.length).toBe(0);
        expect(Images.displayed.length).toBe(20);
        $httpBackend.flush();
    });
});
