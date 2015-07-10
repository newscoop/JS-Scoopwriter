'use strict';

/**
* Module with tests for the pageHelper service.
*
* @module pageHelper service tests
*/

describe('Service: pageHelper', function () {

    var pageHelper,
        $rootScope,
        TranslationService;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(module(function ($provide) {
        var articleServiceMock = {
            articleInstance: {
                articleId: 55,
                language: 'pl',
                title: 'test article'
            }
        };

        $provide.value('article', articleServiceMock);
    }));

    beforeEach(inject(function (_$rootScope_, _pageHelper_, _TranslationService_) {
        pageHelper = _pageHelper_;
        $rootScope = _$rootScope_;
        TranslationService = _TranslationService_;
    }));

    describe('populateHeaderTitle() method', function () {
        it('sets article title in HTML title tag ',
            function () {
                spyOn(TranslationService, 'trans').andReturn('Scoopwriter');
                pageHelper.populateHeaderTitle();
                expect(TranslationService.trans).toHaveBeenCalledWith('aes.name');
                expect($rootScope.headerTitle).toEqual('Scoopwriter - test article');
            }
        );
    });

});