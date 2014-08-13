'use strict';

/**
* Module with tests for the snippets service.
*
* @module snippets service tests
*/

describe('Service: snippets', function () {
    // var mock = {
    //     "items":[
    //         {
    //             "id":1,
    //             "basename":"cms-image-000000001.jpg"
    //         },
    //         {
    //             "id":2,
    //             "basename":"cms-image-000000002.jpg"
    //         },
    //         {
    //             "id":3,
    //             "basename":"cms-image-000000003.jpg"
    //         },
    //         {
    //             "id":4,
    //             "basename":"cms-image-000000004.jpg"
    //         },
    //         {
    //             "id":5,
    //             "basename":"cms-image-000000005.jpg"
    //         },
    //         {
    //             "id":6,
    //             "basename":"cms-image-000000006.jpg"
    //         },
    //         {
    //             "id":7,
    //             "basename":"cms-image-000000007.jpg"
    //         },
    //         {
    //             "id":8,
    //             "basename":"cms-image-000000008.jpg"
    //         },
    //         {
    //             "id":9,
    //             "basename":"cms-image-000000009.jpg"
    //         },
    //         {
    //             "id":10,
    //             "basename":"cms-image-000000010.jpg"
    //         }
    //     ]
    // };
    // var mockSingle = {
    //     "id":1,
    //     "location":"local",
    //     "basename":"mock-single.jpg",
    //     "thumbnailPath":"cms-thumb-000000001.jpg",
    //     "url":"",
    //     "description":"",
    //     "width":"150",
    //     "height":"210",
    //     "photographer":"",
    //     "photographerUrl":"",
    //     "place":""
    // };

    var articleServiceMock,
        articleDeferred,
        Snippet,
        snippets,
        snippetsResponse,
        $rootScope;

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(module(function ($provide) {
        // create a fake article service to be injected around
        articleServiceMock = {};
        $provide.value('article', articleServiceMock);
    }));

    beforeEach(inject(function ($q, _$rootScope_, _Snippet_) {
        // NOTE: snippets is not injected here yet, because we first need
        // to tailor our fake article service here
        $rootScope = _$rootScope_;
        Snippet = _Snippet_;

        snippetsResponse = [{id: 5}, {id: 2}, {id: 12}];
        spyOn(Snippet, 'getAllByArticle').andReturn(snippetsResponse);

        articleDeferred = $q.defer();
        articleServiceMock.promise = articleDeferred.promise;
    }));

    beforeEach(inject(function (_snippets_) {
        snippets = _snippets_;  // article service is mocket at this point
        articleDeferred.resolve({number: 55, language: 'pl'});
        $rootScope.$apply();
    }));


    it('stores retrieved article data', function () {
        expect(snippets.article).toEqual({number: 55, language: 'pl'});
    });

    it('initializes the list of attached snippets', function () {
        expect(snippets.attached).toEqual([{id: 5}, {id: 2}, {id: 12}]);
    });

    it('initializes the list of snippets present in article body to empty',
        function () {
            expect(snippets.inArticleBody).toEqual({});
        }
    );

    xdescribe('loadAttached() method', function () {
        beforeEach(function () {
            var url = Routing.generate(
                'newscoop_gimme_snippets_getsnippetsforarticle',
                {
                    number: 64, language: 'de',
                    items_per_page: 99999, expand: true
                },
                true
            );
            $httpBackend.expectGET(url).respond(mock);
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

    xdescribe('attach() method', function () {
        var headerCheckers,
            linkHeaderSpy;

        /**
        * Generates API URL for retrieving a particular image.
        *
        * @function imageGetUrl
        * @param imageId {Number} ID of the image to retrieve
        * @return {String} generated URL
        */
        function imageGetUrl(imageId) {
            return Routing.generate(
                'newscoop_gimme_images_getimage',
                {'number': imageId}, true
            );
        }

        headerCheckers = {
            Link: function (headers) {
                return 'Link' in headers;
            }
        };

        beforeEach(function () {
            linkHeaderSpy = spyOn(headerCheckers, 'Link').andCallThrough();
            $httpBackend.expect(
                'LINK',
                Routing.generate(
                    'newscoop_gimme_articles_linkarticle',
                    {number: 64, language: 'de'}, true
                ),
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
                '<' + imageGetUrl(5) + '>'
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

            $httpBackend.expectGET(imageGetUrl(6)).respond(200, {});

            images.attach(6, true);
            $httpBackend.flush();
        });
    });

    xdescribe('detach() method', function () {
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
            var expectedHeader;

            images.attached = [mock.items[4], mock.items[7]];

            $httpBackend.expect(
                'UNLINK',
                Routing.generate(
                    'newscoop_gimme_articles_unlinkarticle',
                    {number: 64, language: 'de'}, true
                ),
                undefined,
                headerCheckers.Link
            ).respond(204, '');

            images.detach(5);
            $httpBackend.flush();

            expectedHeader = [
                '<',
                Routing.generate(
                    'newscoop_gimme_images_getimage', {number: 5}, true
                ),
                '>'
            ].join('');
            expect(linkHeaderSpy.mostRecentCall.args[0].Link)
                .toEqual(expectedHeader);
        });

        it('updates attached images list on positive server response',
            function () {
                images.attached = [mock.items[4], mock.items[7]];

                $httpBackend.expect(
                    'UNLINK',
                    Routing.generate(
                        'newscoop_gimme_articles_unlinkarticle',
                        {number: 64, language: 'de'}, true
                    ),
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

    xdescribe('addToIncluded() method', function () {
        it('adds image ID to the inArticleBody list', function () {
            images.inArticleBody = {2: true, 15: true, 99: true};
            images.addToIncluded(77);
            expect(images.inArticleBody).toEqual({
                2: true, 15: true, 77: true, 99: true
            });
        });
    });

    xdescribe('removeFromIncluded() method', function () {
        it('removes image ID from the inArticleBody list', function () {
            images.inArticleBody = {2: true, 15: true, 99: true};
            images.removeFromIncluded(15);
            expect(images.inArticleBody).toEqual({2: true, 99: true});
        });
    });

    xdescribe('findAttached() method', function () {
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

    xdescribe('byId() method', function () {
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

    xdescribe('isAttached() method', function () {
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

});
