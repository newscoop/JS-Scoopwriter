'use strict';

/**
* Module with tests for the articleLoader factory.
*
* @module articleLoader factory tests
*/

describe('Factory: articleLoader', function () {
    var Article,
        articleLoader,
        articleService,
        fakeInstance,
        getArticleDeferred,
        $rootScope;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (
        $q, _$rootScope_, $route, $httpBackend,
        article, _Article_, _articleLoader_
    ) {
        $rootScope = _$rootScope_;
        articleService = article;
        Article = _Article_;
        articleLoader = _articleLoader_;

        $route.current = {
            params: {
                article: 111,  // articleId
                language: 'pl'
            }
        };

        fakeInstance = {
            id: 567,
            language: 'it'
        };

        getArticleDeferred = $q.defer();
        spyOn(Article, 'getById').andReturn(getArticleDeferred.promise);

        $httpBackend.whenGET('views/main.html').respond(200, {});
    }));


    it('returns a function', function () {
        expect(typeof articleLoader).toBe('function');
    });

    it('tries to retrieve a correct article', function () {
        articleLoader();
        expect(Article.getById).toHaveBeenCalledWith(111, 'pl');
    });

    it('assigns retrieved article instance to article service', function () {
        articleLoader();

        getArticleDeferred.resolve(fakeInstance);
        $rootScope.$apply();

        expect(articleService.articleInstance).toEqual(fakeInstance);
    });

    it('resolves given promise with returned article on success', function () {
        var expectedArg,
            onSuccessSpy = jasmine.createSpy();

        articleLoader().then(onSuccessSpy);
        getArticleDeferred.resolve(fakeInstance);
        $rootScope.$apply();

        expect(onSuccessSpy).toHaveBeenCalledWith(fakeInstance);
    });

    it('rejects given promise on error with an error message', function () {
        var expectedArg,
            onErrorSpy = jasmine.createSpy();

        articleLoader().catch(onErrorSpy);
        getArticleDeferred.reject('Timeout!');
        $rootScope.$apply();

        expect(onErrorSpy).toHaveBeenCalledWith('Timeout!');
    });
});
