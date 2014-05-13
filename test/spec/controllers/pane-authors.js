'use strict';

/**
* Module with tests for the authors pane controller.
*
* @module PaneAuthorsCtrl controller tests
*/

describe('Controller: PaneAuthorsCtrl', function () {

    beforeEach(module('authoringEnvironmentApp'));

    var article,
        articleAuthor,
        authors,
        ctrl,
        roles,
        scope;

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
            sortOrder: 1
        }, {
            id: 162,
            firstName: 'Jack',
            lastName: 'Black',
            articleRole: {
                id: 4,
                name: 'Photographer'
            },
            avatarUrl: 'http://foo.bar/image/thumb_162.png',
            sortOrder: 5
        }
    ];

    beforeEach(inject(
        function ($controller, $rootScope, _article_, _articleAuthor_) {
            article = _article_;
            articleAuthor = _articleAuthor_;

            article.promise = {
                then: function (callback) {
                    callback({number: 64, language: 'de'});
                }
            };

            spyOn(articleAuthor, 'getRoleList').andCallFake(function () {
                return roles;
            });

            spyOn(articleAuthor, 'getAll').andCallFake(function () {
                return authors;
            });

            scope = $rootScope.$new();
            ctrl = $controller('PaneAuthorsCtrl', {
                $scope: scope,
                article: article,
                articleAuthor: articleAuthor
            });
        }
    ));

    it('initializes a list of author roles in scope', function () {
        expect(articleAuthor.getRoleList).toHaveBeenCalled();
        expect(scope.authorRoles).toEqual(roles);
    });

    it('initializes a list of article authors in scope', function () {
        expect(articleAuthor.getAll)
            .toHaveBeenCalledWith({articleId: 64, articleLang: 'de'});
        expect(scope.authors).toEqual(authors);
    });

});
