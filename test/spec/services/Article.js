'use strict';

/**
* Module with tests for the Article factory.
*
* @module Article factory tests
*/

describe('Factory: Article', function () {

    var Article,
        $httpBackend;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_Article_, _$httpBackend_) {
        Article = _Article_;
        $httpBackend = _$httpBackend_;
    }));

    it('defines correct options for the commenting setting', function () {
        var options = Article.commenting;

        expect(options).not.toBeUndefined();
        expect(_.size(options)).toBe(3);

        expect(options.ENABLED).toBe(0);
        expect(options.DISABLED).toBe(1);
        expect(options.LOCKED).toBe(2);
    });

    it('defines correct options for the article workflow status',
        function () {
            var options = Article.wfStatus;

            expect(options).toBeDefined();
            expect(_.size(options)).toBe(4);

            expect(options.NEW).toEqual('N');
            expect(options.SUBMITTED).toEqual('S');
            expect(options.PUBLISHED).toEqual('Y');
            expect(options.PUBLISHED_W_ISS).toEqual('M');
        }
    );

    it('defines correct options for the article issue workflow status',
        function () {
            var options = Article.issueWfStatus;

            expect(options).toBeDefined();
            expect(_.size(options)).toBe(2);

            expect(options.NOT_PUBLISHED).toEqual('N');
            expect(options.PUBLISHED).toEqual('Y');
        }
    );

});
