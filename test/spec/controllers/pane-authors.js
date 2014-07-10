'use strict';

/**
* Module with tests for the authors pane controller.
*
* @module PaneAuthorsCtrl controller tests
*/

describe('Controller: PaneAuthorsCtrl', function () {

    beforeEach(module('authoringEnvironmentApp'));

    var article,
        articleDeferred,
        Author,
        authors,
        ctrl,
        roles,
        scope,
        $q;

    roles = [
        {id: 1, name: 'Writer'},
        {id: 4, name: 'Photographer'},
        {id: 6, name: 'Comments moderator'},
        {id: 13, name: 'Lector'},
    ];

    authors = [{
            id: 22,
            firstName: 'John',
            lastName: 'Doe',
            articleRole: {
                id: 1,
                name: 'Writer'
            },
            avatarUrl: 'http://foo.bar/image/thumb_22.png',
            sortOrder: 1,
            updateRole: function () {},
            removeFromArticle: function () {}
        }, {
            id: 162,
            firstName: 'Jack',
            lastName: 'Black',
            articleRole: {
                id: 4,
                name: 'Photographer'
            },
            avatarUrl: 'http://foo.bar/image/thumb_162.png',
            sortOrder: 5,
            updateRole: function () {},
            removeFromArticle: function () {}
        }
    ];

    beforeEach(inject(
        function ($controller, $rootScope, _$q_, _article_, _Author_) {
            $q = _$q_;
            article = _article_;
            Author = _Author_;

            articleDeferred = $q.defer();
            article.promise = articleDeferred.promise;

            spyOn(Author, 'getRoleList').andCallFake(function () {
                return roles;
            });

            scope = $rootScope.$new();
            ctrl = $controller('PaneAuthorsCtrl', {
                $scope: scope,
                article: article,
                Author: Author
            });
        }
    ));

    it('initializes a list of author roles in scope', function () {
        expect(Author.getRoleList).toHaveBeenCalled();
        expect(scope.authorRoles).toEqual(roles);
    });

    it('initializes a list of article authors in scope', function () {
        var authorsDeferred = $q.defer(),
            result = angular.copy(authors);

        spyOn(Author, 'getAllByArticle').andCallFake(function () {
            result.$promise = authorsDeferred.promise;
            return result;
        });

        // authors list is empty until the server responds
        expect(_.difference(scope.authors, [])).toEqual([]);

        articleDeferred.resolve({number: 64, language: 'de'});
        authorsDeferred.resolve();
        scope.$apply();

        expect(Author.getAllByArticle).toHaveBeenCalledWith(64, 'de');
        expect(scope.authors).toEqual(result);
    });

    it('initializes new author to null', function () {
        expect(scope.newAuthor).toBe(null);
    });

    it('initializes new author role ID to null', function () {
        expect(scope.newAuthorRoleId).toBe(null);
    });

    it('initializes addingNewAuthor flag to false', function () {
        expect(scope.addingNewAuthor).toBe(false);
    });

    it('initializes showAddAuthor flag to true', function () {
        expect(scope.showAddAuthor).toBe(true);
    });

    it('sets correct configuration options for select2 widget', function () {
        expect(scope.select2Options).toEqual({
            minimumInputLength: 3,
            query: Author.liveSearchQuery
        });
    });

    it('watches authors for artcile role changes', function () {
        var authorsDeferred = $q.defer();

        // first we need some to have some authors in scope
        spyOn(Author, 'getAllByArticle').andCallFake(function () {
            var result = angular.copy(authors);
            result.$promise = authorsDeferred.promise;
            return result;
        });

        articleDeferred.resolve({number: 64, language: 'de'});
        authorsDeferred.resolve(authors);
        scope.$apply();

        // now change author role and see what happens
        spyOn(ctrl, 'authorRoleChanged');
        spyOn(scope.authors[0], 'updateRole').andCallFake(function () {
            return $q.defer().promise;
        });

        scope.authors[0].articleRole = roles[1];  // 4, Photograhper
        scope.$apply();

        expect(ctrl.authorRoleChanged).toHaveBeenCalledWith(
            roles[1], roles[0], scope.authors[0]);
    });

    it('adds stopRoleChangeWatch method to author objects', function () {
        var authorsDeferred = $q.defer();

        // first we need some to have some authors in scope
        spyOn(Author, 'getAllByArticle').andCallFake(function () {
            var result = angular.copy(authors);
            result.$promise = authorsDeferred.promise;
            return result;
        });

        articleDeferred.resolve({number: 64, language: 'de'});
        authorsDeferred.resolve(authors);
        scope.$apply();

        scope.authors.forEach(function (author) {
            expect(typeof author.stopRoleChangeWatch).toEqual('function');
        });

        scope.authors[0].stopRoleChangeWatch();

        // now change author role and see what happens
        spyOn(ctrl, 'authorRoleChanged');
        spyOn(scope.authors[0], 'updateRole').andCallFake(function () {
            return $q.defer().promise;
        });

        scope.authors[0].articleRole = roles[2];  // 6, Comments moderator
        scope.$apply();

        expect(ctrl.authorRoleChanged).not.toHaveBeenCalled();
    });

    describe('authorRoleChanged() method', function () {
        var author,
            deferredUpdate;

        beforeEach(inject(function ($q) {
            author = {
                updateRole: function () {},
                articleRole: roles[3]  // 13, Lector
            };

            deferredUpdate = $q.defer();
            spyOn(author, 'updateRole').andCallFake(function () {
                return deferredUpdate.promise;
            })

            // prevent firing of controller init code
            spyOn(Author, 'getAllByArticle').andCallFake(function () {
                return {
                    $promise: {
                        then: function () {}
                    }
                }
            });
        }));

        it('sets author\'s updatingRole flag', function () {
            var newRole = roles[0],  // 1, Writer
                oldRole = roles[3],  // 13, Lector
                promise;

            author.articleRole = newRole;  // Writer
            author.updatingRole = false;

            ctrl.authorRoleChanged(newRole, oldRole, author);
            articleDeferred.resolve({number: 64, language: 'de'});
            scope.$apply();

            expect(author.updatingRole).toEqual(true);
        });

        it('invokes author.updateRole() with correct parameters', function () {
            var newRole = roles[0],  // 1, Writer
                oldRole = roles[3],  // 13, Lector
                promise;

            author.articleRole = newRole;  // Writer

            ctrl.authorRoleChanged(newRole, oldRole, author);
            articleDeferred.resolve({number: 64, language: 'de'});
            scope.$apply();

            expect(author.updateRole).toHaveBeenCalledWith(
                {number: 64, language: 'de', oldRoleId: 13, newRoleId: 1});
        });

        it('clears author\'s updatingRole flag on success', function () {
            var newRole = roles[0],  // 1, Writer
                oldRole = roles[3],  // 13, Lector
                promise;

            author.articleRole = newRole;  // Writer
            author.updatingRole = true;  // make sure the flag is set

            ctrl.authorRoleChanged(newRole, oldRole, author);
            articleDeferred.resolve({number: 64, language: 'de'});
            deferredUpdate.resolve();
            scope.$apply();

            expect(author.updatingRole).toEqual(false);
        });

        it('clears author\'s updatingRole flag on error', function () {
            var newRole = roles[0],  // 1, Writer
                oldRole = roles[3],  // 13, Lector
                promise;

            author.stopRoleChangeWatch = jasmine.createSpy();
            author.articleRole = newRole;  // Writer
            author.updatingRole = true;  // make sure the flag is set

            ctrl.authorRoleChanged(newRole, oldRole, author);
            articleDeferred.resolve({number: 64, language: 'de'});
            deferredUpdate.reject();
            scope.$apply();

            expect(author.updatingRole).toEqual(false);
        });

        it('reverts back to original author role on error', function () {
            var newRole = roles[0],  // 1, Writer
                oldRole = roles[3],  // 13, Lector
                promise;

            author.stopRoleChangeWatch = jasmine.createSpy();
            author.articleRole = newRole;  // Writer

            ctrl.authorRoleChanged(newRole, oldRole, author);
            articleDeferred.resolve({number: 64, language: 'de'});
            deferredUpdate.reject();
            scope.$apply();

            expect(author.articleRole).toEqual(oldRole);
        });

        it('does not cause infinite request loop on error', function () {
            var newRole = roles[0],  // 1, Writer
                oldRole = roles[3],  // 13, Lector
                promise;

            spyOn(ctrl, 'authorRoleChanged').andCallThrough();
            ctrl.setRoleChangeWatch(author);
            spyOn(author, 'stopRoleChangeWatch').andCallThrough();
            author.articleRole = newRole;  // Writer

            ctrl.authorRoleChanged(newRole, oldRole, author);
            articleDeferred.resolve({number: 64, language: 'de'});
            deferredUpdate.reject();
            scope.$apply();

            // XXX: for some reason changing the author role in error handler
            // does *not* trigger another roleChanged event as it does in
            // the browser, therefore ATM this test does not properly detect
            // infinite request loop caused by repeated roleChanged events
            expect(ctrl.authorRoleChanged.callCount).toBeLessThan(2);
        });
    });

    describe('scope\'s clearNewAuthorForm() method', function () {
        it('clears all new author form fields', function () {
            scope.newAuthor = {id: 22, text: 'John Doe'};
            scope.newAuthorRoleId = 4;

            scope.clearNewAuthorForm();

            expect(scope.newAuthor).toBe(null);
            expect(scope.newAuthorRoleId).toBe(null);
        });
    });

    describe('scope\'s addAuthorToArticle() method', function () {
        var author,
            deferredAddToArticle;

        beforeEach(inject(function ($q) {
            author = {
                id: 82,
                articleRole: null,
                addToArticle: function () {}
            };

            scope.newAuthor = author;
            scope.newAuthorRoleId = 13;  // Lector

            spyOn(angular, 'copy').andCallFake(function (object) {
                return object;  // don't clone anything
            });

            deferredAddToArticle = $q.defer();
            spyOn(author, 'addToArticle').andCallFake(function () {
                return deferredAddToArticle.promise;
            });

            // prevent firing of controller init code
            spyOn(Author, 'getAllByArticle').andCallFake(function () {
                var retVal = [];
                retVal.$promise = {
                    then: function () {}
                };
                return retVal;
            });
        }));

        it('sets addingNewAuthor flag before doing anything', function () {
            scope.addingNewAuthor = false;
            scope.addAuthorToArticle();
            expect(scope.addingNewAuthor).toEqual(true);
        });

        it('invokes author\'s addToArticle() method with correct parameters',
            function () {
                scope.addAuthorToArticle();
                articleDeferred.resolve({number: 75, language: 'en'});
                scope.$apply();

                expect(author.addToArticle).toHaveBeenCalledWith(75, 'en', 13);
            }
        );

        it('appends new author to the list of article authors ' +
           'on sucessful server response',
            function () {
                var appendedAuthor;

                articleDeferred.resolve({number: 75, language: 'en'});
                scope.$apply();

                scope.authors = [{id: 1}, {id: 2}];
                scope.addAuthorToArticle();
                deferredAddToArticle.resolve();
                author.articleRole = {id: 13, name: 'Lector'};
                scope.$apply();

                expect(scope.authors.length).toEqual(3);
                appendedAuthor = scope.authors[2];
                expect(appendedAuthor.id).toEqual(82);
                expect(appendedAuthor.articleRole.id).toEqual(13);
            }
        );

        it('sets role change watch on new author on successful ' +
           'server response',
           function () {
                scope.authors = [{id: 1}, {id: 2}];
                author.articleRole = {id: 13, name: 'Lector'};
                spyOn(ctrl, 'setRoleChangeWatch');

                scope.addAuthorToArticle();
                articleDeferred.resolve({number: 75, language: 'en'});
                deferredAddToArticle.resolve();
                scope.$apply();

                expect(ctrl.setRoleChangeWatch).toHaveBeenCalled();
                expect(ctrl.setRoleChangeWatch.mostRecentCall.args[0])
                    .toBe(author);  // need to check for object *identity*!
            }
        );

        it('clears addingNewAuthor flag on successful server response',
            function () {
                scope.addAuthorToArticle();
                scope.addingNewAuthor = true;

                articleDeferred.resolve({number: 75, language: 'en'});
                deferredAddToArticle.resolve();
                scope.$apply();

                expect(scope.addingNewAuthor).toEqual(false);
            }
        );

        it('clears addingNewAuthor flag on error server response',
            function () {
                scope.addAuthorToArticle();
                scope.addingNewAuthor = true;

                articleDeferred.resolve({number: 75, language: 'en'});
                deferredAddToArticle.reject();
                scope.$apply();

                expect(scope.addingNewAuthor).toEqual(false);
            }
        );
    });

    describe('scope\'s confirmRemoveAuthor() method', function () {
        var author,
            authorRemoveDeferred,
            modalDeferred,
            modalFactory;

        beforeEach(inject(function ($q, _modalFactory_) {
            authorRemoveDeferred = $q.defer();
            modalDeferred = $q.defer();
            modalFactory = _modalFactory_;

            spyOn(modalFactory, 'confirmLight').andCallFake(function () {
                return {
                    result: modalDeferred.promise
                }
            });

            author = {
                id: 82,
                articleRole: {id: 2, name: 'Reviewer'},
                removeFromArticle: jasmine.createSpy().andCallFake(
                    function () {
                        return authorRemoveDeferred.promise;
                    })
            };

            // prevent firing of controller init code
            spyOn(Author, 'getAllByArticle').andCallFake(function () {
               var retVal = [];
                retVal.$promise = {
                    then: function () {}
                };
                return retVal;
            });
        }));

        it('opens a "light" confirmation dialog', function () {
            scope.confirmRemoveAuthor();
            expect(modalFactory.confirmLight).toHaveBeenCalled();
        });

        it('removes correct author on action confirmation', function () {
            articleDeferred.resolve({number: 75, language: 'en'});
            scope.$apply();

            scope.authors = [{id:123}, author, {id:321}];

            scope.confirmRemoveAuthor(author);
            modalDeferred.resolve(true);
            articleDeferred.resolve({number: 75, language: 'en'});
            scope.$apply();

            expect(author.removeFromArticle).toHaveBeenCalledWith(75, 'en', 2);

            authorRemoveDeferred.resolve();
            scope.$apply();

            expect(scope.authors).toEqual(
                [{id:123}, {id:321}]
            );
        });

        it('does not remove anything on action rejection', function () {
            scope.authors = [{id:123}, author, {id:321}];

            scope.confirmRemoveAuthor(author);
            modalDeferred.reject(true);
            scope.$apply();

            expect(author.removeFromArticle).not.toHaveBeenCalled();
            expect(scope.authors.length).toEqual(3);
        });

        it('does not remove author on server error response', function () {
            articleDeferred.resolve({number: 75, language: 'en'});
            scope.$apply();

            scope.authors = [{id:123}, author, {id:321}];

            scope.confirmRemoveAuthor(author);
            modalDeferred.resolve(true);
            authorRemoveDeferred.reject();
            scope.$apply();

            expect(scope.authors.length).toEqual(3);
        });
    });

    describe('scope\'s orderChanged() method', function () {
        beforeEach(inject(function ($q) {
            // prevent firing of controller init code
            spyOn(Author, 'getAllByArticle').andCallFake(function () {
               var retVal = [];
                retVal.$promise = {
                    then: function () {}
                };
                return retVal;
            });
            spyOn(Author, 'setOrderOnArticle');
        }));

        it('correctly delegates work to Author service', function () {
            articleDeferred.resolve({number: 64, language: 'de'});
            scope.$apply();

            scope.authors = authors;

            scope.orderChanged();
            scope.$apply();

            expect(Author.setOrderOnArticle).toHaveBeenCalledWith(
                64, 'de', authors);
        });
    });
});
