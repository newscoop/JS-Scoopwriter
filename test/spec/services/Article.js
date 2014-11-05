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

    // TODO: describe('deserializeAlohaBlocks() method', function () {

    describe('textStats() method', function () {
        it('it returns zero count for null value', function () {
            expect(
                Article.textStats(null)
            ).toEqual({chars: 0, words: 0});
        });

        it('it returns word count of zero for strings with no matches',
            function () {
                expect(
                    Article.textStats(' #$/ &@! :*+').words
                ).toEqual(0);
            }
        );

        it('correctly counts characters and words in ascii text', function () {
            expect(
                Article.textStats('foo bar baz')
            ).toEqual({chars: 11, words: 3});
        });

        it('correctly counts characters and words in non-ascii text',
            function () {
                expect(
                    Article.textStats('foöbarbázŁeiß')
                ).toEqual({chars: 13, words: 1});
            }
        );

        it('does not count HTML tags in statistics', function () {
            var text = '<p>Some text is <b>bold</b>.</p>';
            expect(
                Article.textStats(text)
            ).toEqual({chars: 18, words: 4});
        });

        it('counts HTML entities as single characters', function () {
            var text = 'A&nbsp;&lt;&nbsp;B&#8482;';  // A < B™
            expect(Article.textStats(text).chars).toEqual(6);
        });

        it('correctly counts words in text with many different delimiters',
            function () {
                var text = '  foo,bar bAz!Hocus POCUS. one&lt;two ... end  ';
                expect(Article.textStats(text).words).toEqual(8);
            }
        );

        it('counts numbers as words', function () {
            var text = 'foo 555 bar 777 end';
            expect(Article.textStats(text).words).toEqual(5);
        });
    });

    // TODO: describe('save() method', function () {

    // TODO: describe('saveSwitches() method', function () {

    describe('changeCommentingSetting() method', function () {
        var article,
            postDataChecker,
            url;

        beforeEach(function () {
            article = new Article();
            article.articleId = 6;
            article.language = 'pl';

            url = Routing.generate(
                'newscoop_gimme_articles_patcharticle',
                {number: 6, language: 'pl'},
                true
            );

            postDataChecker = function (data) {
                return true;
            };

            $httpBackend.expectPATCH(
                url,
                function (data) {
                    return postDataChecker(data);
                }
            ).respond(204);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('invokes correct API endpoint', function () {
            article.changeCommentingSetting(Article.commenting.ENABLED);
        });

        it('sends correct parameters when setting commenting to ENABLED',
           function () {
                postDataChecker = function (data) {
                    var expected = JSON.stringify({
                        comments_enabled: true,
                        comments_locked: false
                    });
                    return angular.equals(data, expected);
                };

                article.changeCommentingSetting(Article.commenting.ENABLED);
            }
        );

        it('sends correct parameters when setting commenting to DISABLED',
           function () {
                postDataChecker = function (data) {
                    var expected = JSON.stringify({
                        comments_enabled: false,
                        comments_locked: false
                    });
                    return angular.equals(data, expected);
                };

                article.changeCommentingSetting(Article.commenting.DISABLED);
            }
        );

        it('sends correct parameters when setting commenting to LOCKED',
           function () {
                postDataChecker = function (data) {
                    var expected = JSON.stringify({
                        comments_enabled: false,
                        comments_locked: true
                    });
                    return angular.equals(data, expected);
                };

                article.changeCommentingSetting(Article.commenting.LOCKED);
            }
        );

        it('resolves given promise on success', function () {
            var onSuccessSpy = jasmine.createSpy();

            article.changeCommentingSetting(
                Article.commenting.ENABLED).then(onSuccessSpy);
            $httpBackend.flush(1);

            expect(onSuccessSpy).toHaveBeenCalled();
        });

        it('rejects given promise with server error message on error',
            function () {
                var onErrorSpy = jasmine.createSpy();

                $httpBackend.resetExpectations();
                $httpBackend.expectPATCH(url).respond(500, 'Error :(');

                article.changeCommentingSetting(
                    Article.commenting.ENABLED).catch(onErrorSpy);
                $httpBackend.flush(1);

                expect(onErrorSpy).toHaveBeenCalledWith('Error :(');
            }
        );
    });


    describe('setWorkflowStatus() method', function () {
        var article;

        beforeEach(inject(function (_$httpBackend_) {
            var url,
                $httpBackend;

            $httpBackend = _$httpBackend_;

            article = new Article();
            article.articleId = 25;
            article.language = 'de';

            url = Routing.generate(
                'newscoop_gimme_articles_changearticlestatus',
                {number: 25, language: 'de', status: 'Y'}, true
            );

            $httpBackend.expect('PATCH', url).respond(201, '');
        }));

        it ('sends a correct request to API', function () {
            article.setWorkflowStatus('Y');
        });

        it ('returns $http promise', function () {
            var returned = article.setWorkflowStatus('Y');

            // if it looks like a promise, then it probably is a promise
            ['then', 'success', 'error', 'finally'].forEach(function (key) {
                expect(typeof returned[key]).toEqual('function');
            });
        });
    });

});
