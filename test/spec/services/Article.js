'use strict';

/**
* Module with tests for the Article factory.
*
* @module Article factory tests
*/

describe('Factory: Article', function () {

    var Article,
        $httpBackend;

    /**
    * Escapes given string so that it can be treated as a literal
    * string in a regular expression.
    *
    * @function regexEscape
    * @param str {String} string to escape
    * @return {String} escaped string
    */
    function regexEscape(str){
        return str.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
    }

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

    describe('constructor', function () {
        // TODO
    });


    describe('getById() method', function () {
        var urlMatcher,
            validUrl,
            $httpBackend;

        beforeEach(inject(function (_$httpBackend_) {
            var articleData = {number: 8, language: 'de'};

            urlMatcher = function (url) {
                return validUrl.test(url);
            };

            validUrl = new RegExp('.*');  // match any URL by default

            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET(urlMatcher).respond(200, articleData);
        }));

        it('sends a correct request to API', function () {
            var url = Routing.generate(
                'newscoop_gimme_articles_getarticle',
                {number: 8, language: 'de'},
                true
            );
            validUrl = new RegExp('^' + regexEscape(url) + '$');

            Article.getById(8, 'de');

            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('resolves given promise with Article instance on successful ' +
            'server response',
            function () {
                var expectedArg,
                    onSuccessSpy = jasmine.createSpy();

                Article.getById(8, 'de').then(onSuccessSpy);
                $httpBackend.flush(1);

                expect(onSuccessSpy).toHaveBeenCalled();
                expectedArg = onSuccessSpy.mostRecentCall.args[0];
                expect(expectedArg instanceof Article).toBe(true);
            }
        );

        it('rejects given promise on server error response', function () {
            var expectedArg,
                onErrorSpy= jasmine.createSpy();

            $httpBackend.resetExpectations();
            $httpBackend.expectGET(urlMatcher).respond(500, 'Error :(');

            Article.getById(8, 'de').catch(onErrorSpy);
            $httpBackend.flush(1);

            expect(onErrorSpy).toHaveBeenCalledWith('Error :(');
        });
    });

});
