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
            updateRole: function () {}
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
            updateRole: function () {}
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
        var authorsDeferred = $q.defer();

        spyOn(Author, 'getAll').andCallFake(function () {
            var result = angular.copy(authors);
            result.$promise = authorsDeferred.promise;
            return result;
        });

        // authors list is empty until the server responds
        expect(_.difference(scope.authors, [])).toEqual([]);

        articleDeferred.resolve({number: 64, language: 'de'});
        authorsDeferred.resolve(authors);
        scope.$apply();

        expect(Author.getAll)
            .toHaveBeenCalledWith({number: 64, language: 'de'});
        expect(scope.authors).toEqual(authors);
    });

    it('initializes new author to null', function () {
        expect(scope.newAuthor).toBe(null);
    });

    it('initializes new author role ID to null', function () {
        expect(scope.newAuthorRoleId).toBe(null);
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
        spyOn(Author, 'getAll').andCallFake(function () {
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
            roles[1], roles[0], authors[0]);
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
            spyOn(Author, 'getAll').andCallFake(function () {
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

            author.articleRole = newRole;  // Writer

            ctrl.authorRoleChanged(newRole, oldRole, author);
            articleDeferred.resolve({number: 64, language: 'de'});
            deferredUpdate.reject();
            scope.$apply();

            expect(author.articleRole).toEqual(oldRole);
        });
    });

});
