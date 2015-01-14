'use strict';

/**
* Module with tests for the Article factory.
*
* @module Article factory tests
*/

describe('Factory: Article', function () {

    var Article,
        $rootScope,
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

    beforeEach(inject(function (_Article_, _$rootScope_, _$httpBackend_) {
        Article = _Article_;
        $rootScope = _$rootScope_;
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

        it('leaves non-string fields intact', function () {
            var article;
            articleData.fields.fieldInt = 1;
            articleData.fields.fieldBool = true;
            articleData.fields.fieldNull = null;
            articleData.fields.fieldUndefined = undefined;

            article = new Article(articleData);

            expect(article.fields.fieldInt).toEqual(1);
            expect(article.fields.fieldBool).toBe(true);
            expect(article.fields.fieldNull).toBe(null);
            expect(article.fields.fieldUndefined).toBeUndefined();
        });

        it('converts comments_locked flag to boolean', function () {
            var article;

            articleData.comments_locked = undefined;
            article = new Article(articleData);
            expect(article.comments_locked).toBe(false);

            articleData.comments_locked = '';
            article = new Article(articleData);
            expect(article.comments_locked).toBe(false);

            articleData.comments_locked = '0';
            article = new Article(articleData);
            expect(article.comments_locked).toBe(false);

            articleData.comments_locked = '1';
            article = new Article(articleData);
            expect(article.comments_locked).toBe(true);

            articleData.comments_locked = 1;
            article = new Article(articleData);
            expect(article.comments_locked).toBe(true);
        });

        it('converts comments_enabled flag to boolean', function () {
            var article;

            articleData.comments_enabled = undefined;
            article = new Article(articleData);
            expect(article.comments_enabled).toBe(false);

            articleData.comments_enabled = '';
            article = new Article(articleData);
            expect(article.comments_enabled).toBe(false);

            articleData.comments_enabled = '0';
            article = new Article(articleData);
            expect(article.comments_enabled).toBe(false);

            articleData.comments_enabled = '1';
            article = new Article(articleData);
            expect(article.comments_enabled).toBe(true);

            articleData.comments_enabled = 1;
            article = new Article(articleData);
            expect(article.comments_enabled).toBe(true);
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

    describe('loadContentFields() method', function () {
        var article,
            deferedArticleType,
            ArticleType,
            fakeArticleType;
        
        beforeEach(inject(function($q, _ArticleType_) {
            deferedArticleType = $q.defer();
            ArticleType = _ArticleType_;
            fakeArticleType = {
                fields: [
                    {name: 'body', isContentField: false, type: 'body', showInEditor: true},
                    {name: 'longtext', isContentField: false, type: 'longtext', showInEditor: true},
                    {name: 'isContent', isContentField: true, type: 'body', showInEditor: false},
                    {name: 'hidden-body', isContentField: false, type: 'body', showInEditor: false},
                    {name: 'hidden-longtext', isContentField: false, type: 'longtext', showInEditor: false},
                    {name: 'hidden-isContent', isContentField: false, showInEditor: false},
                ]
            };
            spyOn(ArticleType, 'getByName').andReturn(deferedArticleType.promise);
        }));

        
        it('call ArticleType.getByName() method with the correct article type', function () {
            article = new Article({articleId: 1, type: 'news'}); 
            article.loadContentFields();
            expect(ArticleType.getByName).toHaveBeenCalledWith('news');
        });
        

        it('returns correct contentFields promise', function () {
            var readPromise, 
                spyOnThen = jasmine.createSpy(),
                expectedContentFields = [[ 'isContent', 'longtext', 'body' ]];

            article = new Article({articleId: 1, type: 'news'}); 

            readPromise = article.loadContentFields();
            readPromise.then(spyOnThen);
            deferedArticleType.resolve(fakeArticleType);
            $rootScope.$apply();

            expect(angular.equals(spyOnThen.mostRecentCall.args, expectedContentFields)).toBe(true);
        });

        it('returns a promise', inject(function ($q) {
            var deferred = $q.defer(),
                promise;
            promise = article.loadContentFields();
            expect(promise instanceof deferred.promise.constructor).toBe(true);
        }));
    });

    describe('loadFirstImage() method', function () {
        var article,
            url;

        beforeEach(function () {
            article = new Article();
            article.articleId = 8;
            article.language = 'de';
            article.fields = {};

            url = Routing.generate(
                'newscoop_gimme_images_getimagesforarticle',
                {number: 8, language: 'de'},
                true
            );
            $httpBackend.expectGET(url).respond(204);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('calls the correct API endpoint', function () {
            article.loadFirstImage();
        });

        it('returns a promise', inject(function ($q) {
            var deferred = $q.defer(),
                promise;
            promise = article.loadFirstImage();
            expect(promise instanceof deferred.promise.constructor).toBe(true);
        }));

        it('resolves promise to an image basename on success', function () {
            var onSuccessSpy = jasmine.createSpy(),
                fakeImage = { 
                    items: [
                        { basename: 'fakeimage.png' }
                    ]
                };

            $httpBackend.resetExpectations();
            $httpBackend.expectGET(url).respond(200, fakeImage);

            article.loadFirstImage().then(onSuccessSpy);
            $httpBackend.flush(1);

            expect(onSuccessSpy).toHaveBeenCalled();
        });

        it('rejects promise when empty results are returned', function () {
            var errorSpy = jasmine.createSpy(),
                fakeImage = { 
                    items: [ ]
                };

            $httpBackend.resetExpectations();
            $httpBackend.expectGET(url).respond(200, fakeImage);

            article.loadFirstImage().catch(function (reason) {
                errorSpy(reason);
            });
            expect(errorSpy).not.toHaveBeenCalled();

            $httpBackend.flush(1);
            expect(errorSpy).toHaveBeenCalledWith('Empty List');

        });
        
        it('rejects given promise with server error message on failure', function () {
                var errorSpy = jasmine.createSpy();                                                      
                
                $httpBackend.resetExpectations();
                $httpBackend.expectGET(url).respond(500, 'Server error');                                
                
                article.loadFirstImage().catch(errorSpy);                                           
                $httpBackend.flush(1);                                                                   
                
                expect(errorSpy).toHaveBeenCalledWith('Server error');                                   
        });
    });

    describe('searchArticles() method', function () {
        var article,
            url,
            filters;

        beforeEach(function () {
            article = new Article();
            article.articleId = 8;
            article.language = 'de';
            article.fields = {};
            filters = {
                'publication': 1,
                'issue': 1,
                'section': 1,
            };

            url = Routing.generate(
                'newscoop_gimme_articles_searcharticles',
                {
                    'publication': 1,
                    'issue': 1,
                    'section': 1,
                    'items_per_page': 20,
                    'query': 'query'
                },
                true
            );
            $httpBackend.expectGET(url).respond(204);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('calls the correct API endpoint', function () {
            article.searchArticles('query', filters);
        });

        it('returns a promise', inject(function ($q) {
            var deferred = $q.defer(),
                promise;
            promise = article.searchArticles('query', filters);
            expect(promise instanceof deferred.promise.constructor).toBe(true);
        }));

        it('resolves promise on success', function () {
            var onSuccessSpy = jasmine.createSpy(),
                fakeArticles = { 
                    items: [
                        { articleId: 1, language: 'de' },
                        { articleId: 2, language: 'de' }
                    ]
                };

            $httpBackend.resetExpectations();
            $httpBackend.expectGET(url).respond(200, fakeArticles);

            article.searchArticles('query', filters).then(onSuccessSpy);
            $httpBackend.flush(1);

            expect(onSuccessSpy).toHaveBeenCalled();
        });
        
        it('rejects given promise with server error message on failure', function () {
                var errorSpy = jasmine.createSpy();
                
                $httpBackend.resetExpectations();
                $httpBackend.expectGET(url).respond(500, 'Server error');
                
                article.searchArticles('query', filters).catch(errorSpy);
                $httpBackend.flush(1);
                
                expect(errorSpy).toHaveBeenCalledWith('Server error');
        });
    });

    describe('getRelatedArticles() method', function () {
        var article,
            url;

        beforeEach(function () {
            article = new Article();
            article.articleId = 8;
            article.language = 'de';
            article.fields = {};

            url = Routing.generate(
                'newscoop_gimme_articles_related',
                {number: 8, language: 'de'},
                true
            );
            $httpBackend.expectGET(url).respond(204);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('calls the correct API endpoint', function () {
            article.getRelatedArticles();
        });

        it('returns a promise', inject(function ($q) {
            var deferred = $q.defer(),
                promise;
            promise = article.getRelatedArticles();
            expect(promise instanceof deferred.promise.constructor).toBe(true);
        }));

        it('resolves promise on success', function () {
            var results, 
                onSuccessSpy = jasmine.createSpy(),
                fakeArticles = { 
                    items: [
                        { articleId: 1, language: 'de' },
                        { articleId: 2, language: 'de' }
                    ]
                };

            $httpBackend.resetExpectations();
            $httpBackend.expectGET(url).respond(200, fakeArticles);

            results = article.getRelatedArticles();
            $httpBackend.flush(1);

            results.forEach(function (item) {
                expect(item instanceof Article).toBe(true);
            });
        });
        
        it('rejects given promise with server error message on failure', function () {
                var result,
                    errorSpy = jasmine.createSpy();
                
                $httpBackend.resetExpectations();
                $httpBackend.expectGET(url).respond(500, 'Server error');
                
                result = article.getRelatedArticles();
                $httpBackend.flush(1);
               
                expect(result.length).toEqual(0); 
        });
    });

    describe('addRelatedArticle() method', function () {
        var article,
            url;

        beforeEach(function() {
            var expectedLinkHeader;
            article = new Article();
            article.articleId = 8;
            article.language = 'de';
            article.fields = {};


            expectedLinkHeader = [
                '<' +
                Routing.generate(
                    'newscoop_gimme_articles_getarticle',
                    {number: 18},
                    false
                ) +
                '; rel="topic">'
            ].join('');

            url = Routing.generate(
                'newscoop_gimme_articles_linkarticle',
                {number: 8, language: 'de'}, true
            );

            $httpBackend.expect(
                'LINK',
                url,
                undefined,
                function (headers) {
                    return headers.link === expectedLinkHeader;
                }
            ).respond(201, '');
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });
        
        it('sends a correct request to API', function () {
            article.addRelatedArticle({articleId: 18});
        });

        it('returns a promise', inject(function ($q) {
            var deferred = $q.defer(),
                promise;
            promise = article.addRelatedArticle({articleId: 18});
            expect(promise instanceof deferred.promise.constructor).toBe(true);
        }));

        it('resolves promise on success', function () {
            var onSuccessSpy = jasmine.createSpy();

            $httpBackend.resetExpectations();
            $httpBackend.expect('LINK', url).respond(200);

            article.addRelatedArticle({articleId: 18}).then(onSuccessSpy);
            $httpBackend.flush(1);

            expect(onSuccessSpy).toHaveBeenCalled();
        });
        
        it('rejects given promise with server error message on failure', function () {
                var errorSpy = jasmine.createSpy();
                
                $httpBackend.resetExpectations();
                $httpBackend.expect('LINK', url).respond(500, 'Server error');
                
                article.addRelatedArticle({articleId: 18}).catch(errorSpy);
                $httpBackend.flush(1);
                
                expect(errorSpy).toHaveBeenCalledWith('Server error');
        });
    });

    describe('removeRelatedArticle() method', function () {
        var article,
            url;

        beforeEach(function() {
            var expectedLinkHeader;
            article = new Article();
            article.articleId = 8;
            article.language = 'de';
            article.fields = {};


            expectedLinkHeader = [
                '<' +
                Routing.generate(
                    'newscoop_gimme_articles_getarticle',
                    {number: 18},
                    false
                ) +
                '; rel="topic">'
            ].join('');

            url = Routing.generate(
                'newscoop_gimme_articles_unlinkarticle',
                {number: 8, language: 'de'}, true
            );

            $httpBackend.expect(
                'UNLINK',
                url,
                undefined,
                function (headers) {
                    return headers.link === expectedLinkHeader;
                }
            ).respond(201, '');
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });
        
        it('sends a correct request to API', function () {
            article.removeRelatedArticle({articleId: 18});
        });

        it('returns a promise', inject(function ($q) {
            var deferred = $q.defer(),
                promise;
            promise = article.removeRelatedArticle({articleId: 18});
            expect(promise instanceof deferred.promise.constructor).toBe(true);
        }));

        it('resolves promise on success', function () {
            var onSuccessSpy = jasmine.createSpy();

            $httpBackend.resetExpectations();
            $httpBackend.expect('UNLINK', url).respond(200);

            article.removeRelatedArticle({articleId: 18}).then(onSuccessSpy);
            $httpBackend.flush(1);

            expect(onSuccessSpy).toHaveBeenCalled();
        });
        
        it('rejects given promise with server error message on failure', function () {
                var errorSpy = jasmine.createSpy();
                
                $httpBackend.resetExpectations();
                $httpBackend.expect('UNLINK', url).respond(500, 'Server error');
                
                article.removeRelatedArticle({articleId: 18}).catch(errorSpy);
                $httpBackend.flush(1);
                
                expect(errorSpy).toHaveBeenCalledWith('Server error');
        });
    });

    describe('save() method', function () {
        var article,
            url;

        /**
        * Helper function for verifying if Content-Type request header is
        * correctly set.
        *
        * @function headersCheck
        * @param headers {Object} request headers
        * @return {Boolean} true if check passes, false otherwise
        */
        function headersCheck(headers) {
            return headers['Content-Type'] ===
                'application/x-www-form-urlencoded';
        }

        beforeEach(function () {
            article = new Article();
            article.articleId = 8;
            article.language = 'de';
            article.fields = {};

            url = Routing.generate(
                'newscoop_gimme_articles_patcharticle',
                {number: 8, language: 'de'},
                true
            );
            $httpBackend.expectPATCH(url).respond(200);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('invokes correct API endpoint', function () {
            article.save();
        });

        it('sets correct Content-Type header', function () {
            $httpBackend.resetExpectations();
            $httpBackend.expectPATCH(
                url,
                function () {return true;},  // we don't check POST data here
                headersCheck
            ).respond(200);

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
            var expectedReqData;

            beforeEach(function () {
                var dataValidChecker = function (data) {
                    return data === $.param(expectedReqData);
                };

                expectedReqData = {
                    article: {
                        fields: {}
                    }
                };

                article.title = 'article title';

                $httpBackend.resetExpectations();
                $httpBackend.expectPATCH(url, dataValidChecker).respond(200);
            });

            it('does not modify normal HTML text (no special content)',
                function () {
                    var bodyValue = '<p>This <b>bold</b>, really.&nbsp;</p>';
                    article.fields.body = bodyValue;
                    expectedReqData.article.fields.body = bodyValue;
                    expectedReqData.article.name = 'article title';
                    article.save();
                }
            );

            it('does not convert empty (null) content fields', function () {
                article.fields.teaser = null;
                expectedReqData.article.fields.teaser = null;
                expectedReqData.article.name = 'article title';
                article.save();
            });

            it('omits predefined switch fields', function () {
                article.fields.body = 'body content';
                article.fields.show_on_front_page = true;
                article.fields.show_on_section_page = true;

                expectedReqData.article.fields.body = 'body content';
                expectedReqData.article.name = 'article title';

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

                expectedReqData.article.fields.body =
                    'Body text<** Image 123 size="small" **>End of text.';
                expectedReqData.article.name = 'article title';

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

                expectedReqData.article.fields.body =
                    'Body text<-- Snippet 99 -->End of text.';
                expectedReqData.article.name = 'article title';

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
            article.onFrontPage = 0;
            article.onSection = 0;
            article.fields = {
                'switch_1': 0,
                'switch_2': 1,
                'content_field': 'foobar'
            };

            switchNames = ['switch_1', 'switch_2'];

            url = Routing.generate(
                'newscoop_gimme_articles_patcharticle',
                {number: 8, language: 'de'},
                true
            );
            $httpBackend.expectPATCH(url).respond(200);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('invokes correct API endpoint', function () {
            article.saveSwitches(switchNames);
        });

        it('sets correct request data and headers', function () {
            var requestData = {
                article: {
                    fields: {
                        'switch_1': 0,
                        'switch_2': 1
                    },
                    onFrontPage: 0,
                    onSection: 0,
                }
            };
            requestData = $.param(requestData);

            $httpBackend.resetExpectations();
            $httpBackend.expectPATCH(
                /.+/,
                requestData,
                function headersCheck(headers) {
                    return (headers['Content-Type'] ===
                        'application/x-www-form-urlencoded');
                }
            ).respond(200);

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
            ).respond(200);
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
                    var expected = $.param({
                        article: {
                            comments_enabled: 1,
                            comments_locked: 0
                        }
                    });
                    return angular.equals(data, expected);
                };

                article.changeCommentingSetting(Article.commenting.ENABLED);
            }
        );

        it('sends correct parameters when setting commenting to DISABLED',
           function () {
                postDataChecker = function (data) {
                    var expected = $.param({
                        article: {
                            comments_enabled: 0,
                            comments_locked: 0 
                        }
                    });
                    return angular.equals(data, expected);
                };

                article.changeCommentingSetting(Article.commenting.DISABLED);
            }
        );

        it('sends correct parameters when setting commenting to LOCKED',
           function () {
                postDataChecker = function (data) {
                    var expected = $.param({
                        article: {
                            comments_enabled: 0,
                            comments_locked: 1 
                        }
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


    describe('releaseLock() method', function () {
        var article;

        beforeEach(inject(function (_$httpBackend_) {
            var url,
                $httpBackend;

            $httpBackend = _$httpBackend_;

            article = new Article();
            article.articleId = 25;
            article.language = 'de';
        }));

        it ('sends a correct request to API', function () {
            var url = Routing.generate(
                'newscoop_gimme_articles_changearticlelockstatus',
                {number: 25, language: 'de'}, true
            );
            $httpBackend.expect('DELETE', url).respond(204, '');

            article.releaseLock();

            $httpBackend.verifyNoOutstandingExpectation();
        });

        it ('clears the isLocked flag on success', function () {
            $httpBackend.whenDELETE(/.*/).respond(204, '');
            article.isLocked = true;

            article.releaseLock();
            $httpBackend.flush();

            expect(article.isLocked).toBe(false);
        });

        it ('resolves given promise on success', function () {
            var onSuccessSpy = jasmine.createSpy();
            $httpBackend.whenDELETE(/.*/).respond(204, '');

            article.releaseLock().then(onSuccessSpy);
            $httpBackend.flush();

            expect(onSuccessSpy).toHaveBeenCalled();
        });

        it ('resolves given promise even if article is already unlocked',
            function () {
                var onSuccessSpy = jasmine.createSpy();
                $httpBackend.whenDELETE(/.*/).respond(403, '');
                // NOTE: when trying to unlock an already unlocked article,
                // the API retuns status 403

                article.releaseLock().then(onSuccessSpy);
                $httpBackend.flush();

                expect(onSuccessSpy).toHaveBeenCalled();
            }
        );

        it ('rejects given promise with error message on failure',
            function () {
                var onErrorSpy = jasmine.createSpy();
                $httpBackend.whenDELETE(/.*/).respond(500, 'DB Error');

                article.releaseLock().catch(onErrorSpy);
                $httpBackend.flush();

                expect(onErrorSpy).toHaveBeenCalledWith('DB Error');
            }
        );
    });

    describe('setOrderOfRelatedArticles() method', function () {
        var article,
            url,
            expectedLinkHeader;

        beforeEach(function() {
            var expectedLinkHeader;

            article = new Article();
            article.articleId = 25;
            article.language = 'de';

            expectedLinkHeader = [
                '<' +
                Routing.generate(
                    'newscoop_gimme_articles_getarticle',
                    {number: 5},
                    false
                ) +
                '; rel="article">,' +
                '<2; rel="article-position">'
            ].join('');

            url = Routing.generate(
                'newscoop_gimme_articles_linkarticle',
                {number: 25, language: 'de'}, true
            );

            $httpBackend.expect(
                'LINK',
                url,
                undefined,
                function (headers) {
                    return headers.link === expectedLinkHeader;
                }
            ).respond(201, '');
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });
        
        it('sends a correct request to API', function () {
            article.setOrderOfRelatedArticles({ articleId: 5 }, 1);
        });

        it ('resolves given promise',
            function () {
                var onSuccessSpy = jasmine.createSpy();

                $httpBackend.resetExpectations();
                $httpBackend.expect('LINK', url).respond(200);

                article.setOrderOfRelatedArticles({ articleId: 5 }, 1).then(onSuccessSpy);
                $httpBackend.flush(1);

                expect(onSuccessSpy).toHaveBeenCalled();
            }
        );

        it ('rejects given promise with error message on failure',
            function () {
                var onErrorSpy = jasmine.createSpy();

                $httpBackend.resetExpectations();
                $httpBackend.expect('LINK', url).respond(500, 'DB Error');

                article.setOrderOfRelatedArticles({ articleId: 5 }, 1)
                    .catch(onErrorSpy);
                $httpBackend.flush();

                expect(onErrorSpy).toHaveBeenCalledWith('DB Error');
            }
        );
    });
});
