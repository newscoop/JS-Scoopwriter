'use strict';

/**
* Module with tests for the Author resource factory.
*
* @module Author resource factory tests
*/

describe('Factory: Author', function () {

    var Author,
        authorsResponse,
        authorsSearchResponse,
        rolesResponse,
        $httpBackend;

    rolesResponse = {
        items: [
            {id: 1, type: 'Writer'},
            {id: 4, type: 'Photographer'},
            {id: 13, type: 'Lector'},
        ]
    };

    authorsSearchResponse = {
        items: [{
            id: 22,
            firstName: 'John',
            lastName: 'Doe',
            image: 'foo.bar/image%2Fthumb_22.png'
        }, {
            id: 76,
            firstName: 'Wesley',
            lastName: 'Snipes',
            image: 'foo.bar/image%2Fthumb_76.png'
        }]
    };

    authorsResponse = {
        items: [{
            author: {
                id: 22,
                firstName: 'John',
                lastName: 'Doe',
                image: 'foo.bar/image%2Fthumb_22.png'
            },
            type: {
                id: 1,
                type: 'Writer'
            },
            order: 1
        }]
    };

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_Author_, _$httpBackend_) {
        Author = _Author_;
        $httpBackend = _$httpBackend_;
    }));

    describe('createFromApiData() method', function () {
        var data;

        beforeEach(function () {
            data = {
                author: {
                    id: 155,
                    firstName: 'Foo',
                    lastName: 'Bar',
                    image: 'baz.com%2Fimage%2Fimg_155.jpg'
                },
                type: {
                    id: 13,
                    type: 'Lector'
                },
                order: 5
            };
        });

        it('creates correct instance when data object has no missing data',
            function () {
                var instance = Author.createFromApiData(data);

                expect(instance instanceof Author).toEqual(true);
                expect(instance.id).toEqual(155);
                expect(instance.firstName).toEqual('Foo');
                expect(instance.lastName).toEqual('Bar');
                expect(instance.text).toEqual('Foo Bar');
                expect(instance.articleRole).toEqual({id: 13, name: 'Lector'});
                expect(instance.avatarUrl).toEqual(
                    'http://baz.com/image/img_155.jpg');
                expect(instance.sortOrder).toEqual(5);
            }
        );

        it('sets instance\'s articleRole to null if missing in data',
            function () {
                var instance;

                delete data.type;
                instance = Author.createFromApiData(data);
                expect(instance.articleRole).toBeNull();
            }
        );

        it('sets instance\'s avatarUrl to default image if missing in data',
            function () {
                var instance;

                delete data.author.image;
                instance = Author.createFromApiData(data);
                expect(instance.avatarUrl).toEqual(
                    '/images/authors-default-avatar.png');
            }
        );
    });

    describe('getAllByArticle() method', function () {
        beforeEach(function () {
            $httpBackend.expectGET(
                rootURI + '/articles/64/de/authors?items_per_page=99999'
            ).respond(authorsResponse);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            Author.getAllByArticle(64, 'de');
            $httpBackend.flush(1);
        });

        it('correctly transforms server response', function () {
            var authors,
                expectedItemData;

            authors = Author.getAllByArticle(64, 'de');

            // array is empty until the server responds
            expect(_.difference(authors, [])).toEqual([]);

            $httpBackend.flush(1);

            authors.forEach(function (item) {
                expect(item instanceof Author).toEqual(true);
            });

            expectedItemData = [{
                id: 22,
                firstName: 'John',
                lastName: 'Doe',
                articleRole: {
                    id: 1,
                    name: 'Writer'
                },
                avatarUrl: 'http://foo.bar/image/thumb_22.png',
                sortOrder: 1
            }];

            expectedItemData.forEach(function (data) {
                expect(_.findIndex(authors, data)).toBeGreaterThan(-1);
            });
        });

        it('rejects given promise on server error', function () {
            var errorSpy,
                authors;

            errorSpy = jasmine.createSpy();

            $httpBackend.resetExpectations();
            $httpBackend.expectGET(
                rootURI + '/articles/64/de/authors?items_per_page=99999'
            ).respond(500, 'Error :(');

            authors = Author.getAllByArticle(64, 'de');
            authors.$promise.catch(errorSpy);

            $httpBackend.flush(1);
            expect(errorSpy).toHaveBeenCalledWith('Error :(');
        });
    });

    describe('liveSearchQuery() method', function () {
        var $timeout,
            dateFactory,
            options,
            response;

        /**
        * Helper function which modifies dateFactory in a way that
        * makeInstance() returns new Date object representing the given time
        * point.
        *
        * @method setCurrentMockedTime
        * @param timestamp {Number} number of milliseconds since 1st Jan 1970
        */
        function setCurrentMockedTime(timestamp) {
            dateFactory.makeInstance = function () {
                return new Date(timestamp);
            };
        }

        beforeEach(inject(function (_$timeout_, _dateFactory_) {
            $timeout = _$timeout_;
            dateFactory = _dateFactory_;

            setCurrentMockedTime(0);

            options = {
                page: 1,
                context: null,
                term: 'hans',
                callback: function () {}
            };

            spyOn(Author, 'liveSearchQuery').andCallThrough();

            response = angular.copy(authorsSearchResponse);
        }));


        it('delays non-callback non-pagination calls for 250ms', function () {
            $httpBackend.expectGET(
                rootURI + '/search/authors?items_per_page=10&page=1&query=hans'
            ).respond(200, response);

            Author.liveSearchQuery(options);

            expect(Author.liveSearchQuery.callCount).toEqual(1);

            setCurrentMockedTime(249);
            $timeout.flush(249);
            // still not called yet
            expect(Author.liveSearchQuery.callCount).toEqual(1);

            setCurrentMockedTime(250);
            $timeout.flush(1);
            $timeout.verifyNoPendingTasks();  // only one call to $timeout

            expect(Author.liveSearchQuery.callCount).toEqual(2);
            expect(Author.liveSearchQuery.calls[1].args)
                .toEqual([options, true]);
        });

        it('executes non-callback pagination calls w/o delay', function () {
            $httpBackend.expectGET(
                rootURI + '/search/authors?items_per_page=10&page=7&query=hans'
            ).respond(200, response);

            options.page = 7;
            options.context = {
                itemsPerPage: 10,
                currentPage: 6,
                itemsCount: 72,
                nextPageLink: 'foo/bar/?page=7'
            };

            Author.liveSearchQuery(options);

            $httpBackend.verifyNoOutstandingExpectation();
        });

        it ('ignores duplicate pagination calls', function () {
            $httpBackend.expectGET(
                rootURI + '/search/authors?items_per_page=10&page=7&query=hans'
            ).respond(200, response);

            options.page = 7;
            options.context = {
                itemsPerPage: 10,
                currentPage: 6,
                itemsCount: 72,
                nextPageLink: 'foo/bar/?page=7'
            };

            Author.liveSearchQuery(options);
            Author.liveSearchQuery(options);

            $httpBackend.verifyNoOutstandingExpectation();
        });

        it ('ignores callbacks for obsolete search terms', function () {
            // simulate "not enough time elapsed since the last search term
            // change" - should ignore such callbacks
            setCurrentMockedTime(249);
            Author.liveSearchQuery(options, true);
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('correctly invokes API for up-to-date search terms', function () {
            $httpBackend.expectGET(
                rootURI + '/search/authors?items_per_page=10&page=1&query=hans'
            ).respond(200, response);

            options.page = 1;
            setCurrentMockedTime(1500);

            Author.liveSearchQuery(options, true);

            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('correctly invokes callback on successful server response',
            function () {
                var callbackArgs,
                    response = {},
                    resultItem;

                // test fixtures
                $httpBackend.expectGET(
                    rootURI + '/search/authors?items_per_page=10' +
                              '&page=1&query=hans'
                ).respond(200, response);

                response.items = [{
                    id: 66, firstName: 'Hans', lastName: 'Doe',
                    image: 'foo.bar/images/img_66.jpg'}
                ];
                response.pagination = {
                    itemsPerPage: 10,
                    currentPage: 1,
                    itemsCount: 1,
                    nextPageLink: ''
                };

                spyOn(options, 'callback');
                options.page = 1;
                setCurrentMockedTime(1500);

                // the actual test
                Author.liveSearchQuery(options, true);
                $httpBackend.flush();

                // assertions
                $httpBackend.verifyNoOutstandingExpectation();

                expect(options.callback.callCount).toEqual(1);
                callbackArgs = options.callback.calls[0].args;
                expect(callbackArgs.length).toEqual(1);

                expect(callbackArgs[0].more).toEqual(false);
                expect(callbackArgs[0].context).toEqual(response.pagination);

                resultItem = callbackArgs[0].results[0];
                expect(resultItem.id).toEqual(66);
                expect(resultItem.firstName).toEqual('Hans');
                expect(resultItem.lastName).toEqual('Doe');
                expect(resultItem.avatarUrl).toEqual(
                    'http://foo.bar/images/img_66.jpg');
            }
        );
    });

    describe('setOrderOnArticle() method', function () {
        it('sends a correct request to API', function () {
            var authors = [
                {id: 7, articleRole: {id: 11}},
                {id: 2, articleRole: {id: 6}},
                {id: 11, articleRole: {id: 7}}
            ];

            $httpBackend.expectPOST(
                rootURI + '/articles/82/it/authors/order',
                {order: '7-11,2-6,11-7'}
            ).respond(204);

            Author.setOrderOnArticle(82, 'it', authors);

            $httpBackend.verifyNoOutstandingExpectation();
        });
    });

    describe('addToArticle() method', function () {
        var author,
            expectedLinkHeader;

        beforeEach(function () {
            author = new Author();
            author.id = 22;

            expectedLinkHeader =
                '<' + apiEndpoint + '/authors/22; rel="author">,' +
                '<' + apiEndpoint + '/authors/types/7; rel="author-type">';

            $httpBackend.expect(
                'LINK',
                rootURI + '/articles/64/de',
                undefined,
                function (headers) {
                    return headers.link === expectedLinkHeader;
                }
            ).respond(201, '');
        });

        it('sends a correct request to API', function () {
            author.addToArticle(64, 'de', 7);
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('updates author\'s role ID on successful server response',
            function () {
                author.addToArticle(64, 'de', 7);
                $httpBackend.flush(1);
                expect(author.articleRole.id).toEqual(7);
            }
        );

        it('resolves given promise on successful server response',
            function () {
                var promise,
                    spyHelper = {
                        callMeOnSuccess: jasmine.createSpy()
                    };

                author.addToArticle(64, 'de', 7)
                    .then(spyHelper.callMeOnSuccess);

                $httpBackend.flush(1);

                expect(spyHelper.callMeOnSuccess).toHaveBeenCalled();
            }
        );

        it('rejects given promise on server error response', function () {
            var promise,
                spyHelper = {
                    callMeOnError: jasmine.createSpy()
                };

            $httpBackend.resetExpectations();
            $httpBackend.expect('LINK', rootURI + '/articles/64/de')
                .respond(500, 'Error :(');

            author.addToArticle(64, 'de', 7)
                .then(null, spyHelper.callMeOnError);

            $httpBackend.flush(1);

            expect(spyHelper.callMeOnError).toHaveBeenCalledWith('Error :(');
        });
    });

    describe('removeFromArticle() method', function () {
        var expectedLinkHeader;

        beforeEach(function () {
            expectedLinkHeader =
                '<' + apiEndpoint + '/authors/22; rel="author">,' +
                '<' + apiEndpoint + '/authors/types/7; rel="author-type">';

            $httpBackend.expect(
                'UNLINK',
                rootURI + '/articles/64/de',
                undefined,
                function (headers) {
                    return headers.link === expectedLinkHeader;
                }
            ).respond(204, '');
        });

        it('sends a correct request to API', function () {
            var author = new Author();
            author.id = 22;
            author.removeFromArticle(64, 'de', 7);
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('resolves given promise on successful server response',
            function () {
                var author,
                    promise,
                    spyHelper = {
                        callMeOnSuccess: jasmine.createSpy()
                    };

                author = new Author();
                author.id = 22;

                author.removeFromArticle(64, 'de', 7)
                    .then(spyHelper.callMeOnSuccess);

                $httpBackend.flush(1);

                expect(spyHelper.callMeOnSuccess).toHaveBeenCalled();
            }
        );

        it('rejects given promise on server error response', function () {
            var author = new Author({id: 22}),
                promise,
                spyHelper = {
                    callMeOnError: jasmine.createSpy()
                };

            $httpBackend.resetExpectations();
            $httpBackend.expect('UNLINK', rootURI + '/articles/64/de')
                .respond(500, 'Error :(');

            author.removeFromArticle(64, 'de', 7)
                .catch(spyHelper.callMeOnError);

            $httpBackend.flush(1);

            expect(spyHelper.callMeOnError).toHaveBeenCalledWith('Error :(');
        });
    });

    describe('getRoleList() method', function () {
        beforeEach(function () {
            $httpBackend.expectGET(
                rootURI + '/authors/types?items_per_page=99999'
            ).respond(rolesResponse);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            Author.getRoleList();
            $httpBackend.flush(1);
        });

        it('correctly transforms server response', function () {
            var expectedItemData,
                roles = Author.getRoleList();

            // array is empty until the server responds
            expect(_.difference(roles, [])).toEqual([]);

            $httpBackend.flush(1);

            expectedItemData = [
                {id: 1, name: 'Writer'},
                {id: 4, name: 'Photographer'},
                {id: 13, name: 'Lector'}
            ];
            expectedItemData.forEach(function (data) {
                expect(_.findIndex(roles, data)).toBeGreaterThan(-1);
            });
        });

        it('rejects given promise on server error', function () {
            var errorSpy,
                roles;

            errorSpy = jasmine.createSpy();

            $httpBackend.resetExpectations();
            $httpBackend.expectGET(
                rootURI + '/authors/types?items_per_page=99999'
            ).respond(500, 'Error :(');

            roles = Author.getRoleList();
            roles.$promise.catch(errorSpy);

            $httpBackend.flush(1);
            expect(errorSpy).toHaveBeenCalledWith('Error :(');
        });
    });

    describe('updateRole() method', function () {
        it('sends a correct request to API', function () {
            var author,
                expectedLinkHeader;

            author = new Author();
            author.id = 22;
            author.firstName = 'John';
            author.lastName = 'Doe';
            author.articleRole = {
                id: 4,
                name: 'Photographer'
            };

            expectedLinkHeader =
                '</content-api/authors/types/1; rel="old-author-type">,' +
                '</content-api/authors/types/4; rel="new-author-type">';

            $httpBackend.expectPOST(
                rootURI + '/articles/64/de/authors/22',
                {},
                function (headers) {
                    return headers.link === expectedLinkHeader;
                }
            ).respond(201, 'Created');

            author.updateRole(
                {number: 64, language: 'de', oldRoleId: 1, newRoleId: 4}
            );
            $httpBackend.flush(1);

            $httpBackend.verifyNoOutstandingExpectation();
        });
    });

});
