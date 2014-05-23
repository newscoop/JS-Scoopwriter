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

    describe('getAll() method', function () {
        beforeEach(function () {
            $httpBackend.expectGET(
                rootURI + '/articles/64/de/authors?items_per_page=99999'
            ).respond(JSON.stringify(authorsResponse));
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            Author.getAll({number: 64, language: 'de'});
            $httpBackend.flush(1);
        });

        it('correctly transforms server response', function () {
            var authors,
                expectedItemData;

            authors = Author.getAll({number: 64, language: 'de'})

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

    describe('getRoleList() method', function () {
        beforeEach(function () {
            $httpBackend.expectGET(
                rootURI + '/authors/types?items_per_page=99999'
            ).respond(JSON.stringify(rolesResponse));
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

            roles.forEach(function (item) {
                expect(item instanceof Author).toEqual(true);
            });

            expectedItemData = [
                {id: 1, name: 'Writer'},
                {id: 4, name: 'Photographer'},
                {id: 13, name: 'Lector'}
            ];
            expectedItemData.forEach(function (data) {
                expect(_.findIndex(roles, data)).toBeGreaterThan(-1);
            });
        });
    });

    describe('updateRole() method', function () {
        it('sends a correct request to API', function () {
            var author,
                expectedLinkHeader;

            author = new Author({
                id: 22,
                firstName: 'John',
                lastName: 'Doe',
                articleRole: {
                    id: 4,
                    name: 'Photographer'
                }
            });
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
