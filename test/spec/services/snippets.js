'use strict';

/**
* Module with tests for the snippets service.
*
* @module snippets service tests
*/

describe('Service: snippets', function () {
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

    describe('addToIncluded() method', function () {
        it('adds snippet ID to the list of snippets in article body',
            function () {
                snippets.inArticleBody = {19: true};
                snippets.addToIncluded(7);
                expect(snippets.inArticleBody).toEqual({7: true, 19: true});
            }
        );
    });

    describe('removeFromIncluded() method', function () {
        it('removes snippet ID from the list of snippets in article body',
            function () {
                snippets.inArticleBody = {19: true, 6: true, 8: true};
                snippets.removeFromIncluded(6);
                expect(snippets.inArticleBody).toEqual({8: true, 19: true});
            }
        );
    });

    describe('addToArticle() method', function () {
        var articleInfo,
            deferredAdd,
            snippetObj;

        beforeEach(inject(function ($q) {
            articleInfo = {number: 35, language: 'pl'};
            snippetObj = {
                id: 7,
                addToArticle: function () {}
            };
            deferredAdd = $q.defer();
            spyOn(snippetObj, 'addToArticle').andReturn(deferredAdd.promise);
        }));

        it('does not try to attach an already attached snippet', function () {
            snippets.attached = [{id: 5}, {id: 7}, {id: 2}];
            snippets.addToArticle(snippetObj, articleInfo);
            expect(snippetObj.addToArticle).not.toHaveBeenCalled();
        });

        it('invokes snippet\'s addToArticle method with correct parameters',
            function () {
                snippets.attached = [{id: 5}, {id: 2}];
                snippets.addToArticle(snippetObj, articleInfo);
                expect(snippetObj.addToArticle).toHaveBeenCalledWith(35, 'pl');
            }
        );

        it('updates the list of attached snippets on success', function () {
            snippets.attached = [{id: 5}, {id: 2}];

            snippets.addToArticle(snippetObj, articleInfo);
            deferredAdd.resolve();
            $rootScope.$apply();

            expect(snippets.attached).toEqual([{id: 5}, {id: 2}, snippetObj]);
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
