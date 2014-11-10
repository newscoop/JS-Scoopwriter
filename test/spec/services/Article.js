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
        var articleData;

        beforeEach(function () {
            articleData = {
                fields: {}
            };
        });

        it('initializes instance with given data', function () {
            var article;

            articleData.field_1 = true;
            articleData.field_2 = 'foobar';
            articleData.issue = {
                issueId: 5,
                title: '5th issue'
            };

            article = new Article(articleData);

            expect(article.field_1).toBe(true);
            expect(article.field_2).toEqual('foobar');
            expect(article.issue).toEqual({
                issueId: 5,
                title: '5th issue'
            });
        });

        it('converts the "number" field in data to "articleId" property',
            function () {
                var article;
                articleData.number = 123;

                article = new Article(articleData);

                expect(article.articleId).toEqual(123);
                expect(article.number).toBeUndefined();
            }
        );

        it('initializes null fields to null', function () {
            var article;
            articleData.fields.null_field = null;

            article = new Article(articleData);
            expect(article.fields.null_field).toBe(null);
        });

        it('converts image placeholders in fields to HTML', function () {
            var article;
            articleData.fields.body = 'Foo <** Image 12 size="small" **> bar.';

            article = new Article(articleData);

            expect(article.fields.body).toEqual([
                'Foo ',
                '<div class="image" dropped-image ',
                    'data-id="12" data-size="small"></div>',
                ' bar.'
            ].join(''));
        });

        it('converts snippets placeholders in fields to HTML', function () {
            var article;
            articleData.fields.body = 'Foo <-- Snippet 10 --> bar.';

            article = new Article(articleData);

            expect(article.fields.body).toEqual([
                'Foo ',
                '<div class="snippet" data-id="10"></div>',
                ' bar.'
            ].join(''));
        });
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


    describe('save() method', function () {
        var article,
            url;

        beforeEach(function () {
            article = new Article();
            article.articleId = 8;
            article.language = 'de';
            article.fields = {};

            url = Routing.generate(
                // XXX: should be the patcharticle path, but there is a bug in
                // Routing object, thus we use another path that gives us the
                // same result
                'newscoop_gimme_articles_linkarticle',
                {number: 8, language: 'de'},
                true
            );
            $httpBackend.expectPATCH(url).respond(204);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('invokes correct API endpoint', function () {
            article.save();
        });

        it('resolves given promise on successful server response',
            function () {
                var successSpy = jasmine.createSpy();

                article.save().then(successSpy);
                $httpBackend.flush(1);
                expect(successSpy).toHaveBeenCalled();
            }
        );

        it('rejects given promise on server error response',
            function () {
                var errorSpy = jasmine.createSpy();

                $httpBackend.resetExpectations();
                $httpBackend.expectPATCH(url).respond(500);

                article.save().catch(errorSpy);
                $httpBackend.flush(1);
                expect(errorSpy).toHaveBeenCalled();
            }
        );

        describe('building request data', function () {
            var checkPostData;

            beforeEach(function () {
                var dataValid;

                checkPostData = jasmine.createSpy();
                dataValid = function (data) {
                    return checkPostData(data);
                };
                $httpBackend.resetExpectations();
                $httpBackend.expectPATCH(url, dataValid).respond(204);
            });

            it('does not modify normal HTML text (no special content)',
                function () {
                    article.fields.body = [
                        '<p>This is <b>bold</b>, really.&nbsp;</p>',
                    ].join('');

                    checkPostData.andCallFake(function (data) {
                        var jsonData = JSON.parse(data);
                        return jsonData.fields.body ===
                            '<p>This is <b>bold</b>, really.&nbsp;</p>';
                    });

                    article.save();
                }
            );

            it('does not convert empty (null) content fields', function () {
                article.fields.teaser = null;

                checkPostData.andCallFake(function (data) {
                    var jsonData = JSON.parse(data);
                    return jsonData.fields.teaser === null;  // still null?
                });

                article.save();
            });

            it('serializes images in article body', function () {
                article.fields.body = [
                    'Body text',
                    '<div class="image" data-id="123" data-size="small">',
                        '<img src="http://foo.com/bar.jpg" />',
                    '</div>',
                    'End of text.'
                ].join('');

                checkPostData.andCallFake(function (data) {
                    var jsonData = JSON.parse(data);
                    return (jsonData.fields.body ===
                        'Body text<** Image 123 size="small" **>End of text.');
                });

                article.save();
            });

            it('serializes snippets in article body', function () {
                article.fields.body = [
                    'Body text',
                    '<div class="snippet" data-id="99">',
                        '<div>Some<b>bold</b> text</div>',
                    '</div>',
                    'End of text.'
                ].join('');

                checkPostData.andCallFake(function (data) {
                    var jsonData = JSON.parse(data);
                    return (jsonData.fields.body ===
                        'Body text<-- Snippet 99 -->End of text.');
                });

                article.save();
            });
        });
    });


    describe('saveSwitches() method', function () {
        var article,
            switchNames,
            url;

        beforeEach(function () {
            article = new Article();
            article.articleId = 8;
            article.language = 'de';
            article.fields = {
                'switch_1': false,
                'switch_2': true,
                'content_field': 'foobar'
            };

            switchNames = ['switch_1', 'switch_2'];

            url = Routing.generate(
                // XXX: should be the patcharticle path, but there is a bug in
                // Routing object, thus we use another path that gives us the
                // same result
                'newscoop_gimme_articles_linkarticle',
                {number: 8, language: 'de'},
                true
            );
            $httpBackend.expectPATCH(url).respond(204);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('invokes correct API endpoint', function () {
            article.saveSwitches(switchNames);
        });

        it('sends correct data to server', function () {
            var requestData = {
                fields: {
                    'switch_1': false,
                    'switch_2': true
                }
            };
            $httpBackend.resetExpectations();
            $httpBackend.expectPATCH(url, requestData).respond(204);

            article.saveSwitches(switchNames);
        });

        it('resolves given promise on successful server response',
            function () {
                var successSpy = jasmine.createSpy();

                article.saveSwitches(switchNames).then(successSpy);
                $httpBackend.flush(1);

                expect(successSpy).toHaveBeenCalled();
            }
        );

        it('rejects given promise on server error response',
            function () {
                var errorSpy = jasmine.createSpy();

                $httpBackend.resetExpectations();
                $httpBackend.expectPATCH(url).respond(500, 'Timeout.');

                article.saveSwitches(switchNames).catch(errorSpy);
                $httpBackend.flush(1);

                expect(errorSpy).toHaveBeenCalledWith('Timeout.');
            }
        );
    });


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
