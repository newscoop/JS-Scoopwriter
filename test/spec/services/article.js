'use strict';

/**
* Module with tests for the article service.
*
* @module article service tests
*/

describe('Service: article', function () {
    var articleService,
        $httpBackend,
        $rootScope;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (article, _$httpBackend_, _$rootScope_) {
        articleService = article;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
    }));

    it('should define correct options for "commenting"', function () {
        var options = articleService.commenting;
        expect(options).not.toBeUndefined();
        expect(_.size(options)).toBe(3);
        expect('ENABLED' in options).toBe(true);
        expect(options.ENABLED).toBe(0);
        expect('DISABLED' in options).toBe(true);
        expect(options.DISABLED).toBe(1);
        expect('LOCKED' in options).toBe(true);
        expect(options.LOCKED).toBe(2);
    });

    it('should define correct options for the article workflow status',
        function () {
            var options = articleService.wfStatus;
            expect(options).toBeDefined();
            expect(_.size(options)).toEqual(4);
            expect('NEW' in options).toBe(true);
            expect(options.NEW).toEqual('N');
            expect('SUBMITTED' in options).toBe(true);
            expect(options.SUBMITTED).toEqual('S');
            expect('PUBLISHED' in options).toBe(true);
            expect(options.PUBLISHED).toEqual('Y');
            expect('PUBLISHED_W_ISS' in options).toBe(true);
            expect(options.PUBLISHED_W_ISS).toEqual('M');
        }
    );

    it('should define correct options for the article issue workflow status',
        function () {
            var options = articleService.issueWfStatus;
            expect(options).toBeDefined();
            expect(_.size(options)).toEqual(2);
            expect('NOT_PUBLISHED' in options).toBe(true);
            expect(options.NOT_PUBLISHED).toEqual('N');
            expect('PUBLISHED' in options).toBe(true);
            expect(options.PUBLISHED).toEqual('Y');
        }
    );

    it('has the modified flag cleared by default', function () {
        expect(articleService.modified).toBe(false);
    });

    describe('save() method', function () {
        var articleObj,
            url;

        beforeEach(function () {
            articleObj = {number: 8, language: 'en', fields: {}};

            url = Routing.generate(
                // XXX: should be the patcharticle path, but there is a bug in
                // Routing object, thus we use another path that gives us the
                // same result
                'newscoop_gimme_articles_linkarticle',
                {number: 8, language: 'en'},
                true
            );
            $httpBackend.expectPATCH(url).respond(201);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            articleService.save(articleObj);
        });

        it('resolves given promise on successful server response',
            function () {
                var successSpy = jasmine.createSpy();

                articleService.save(articleObj).then(successSpy);
                $httpBackend.flush(1);
                expect(successSpy).toHaveBeenCalled();
            }
        );

        it('rejects given promise on server error response',
            function () {
                var errorSpy = jasmine.createSpy();

                $httpBackend.resetExpectations();
                $httpBackend.expectPATCH(url).respond(500);

                articleService.save(articleObj).catch(errorSpy);
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
                $httpBackend.expectPATCH(url, dataValid).respond(201);
            });

            it('does not modify normal HTML text (no special content)',
                function () {
                    articleObj.fields.body = [
                        '<p>This is <b>bold</b>, really.&nbsp;</p>',
                    ].join('');

                    checkPostData.andCallFake(function (data) {
                        var jsonData = JSON.parse(data);
                        return jsonData.fields.body ===
                            '<p>This is <b>bold</b>, really.&nbsp;</p>';
                    });

                    articleService.save(articleObj);
                }
            );

            it('does not convert empty (null) content fields', function () {
                articleObj.fields.teaser = null;

                checkPostData.andCallFake(function (data) {
                    var jsonData = JSON.parse(data);
                    return jsonData.fields.teaser === null;  // still null?
                });

                articleService.save(articleObj);
            });

            it('serializes images in article body', function () {
                articleObj.fields.body = [
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

                articleService.save(articleObj);
            });

            it('serializes snippets in article body', function () {
                articleObj.fields.body = [
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

                articleService.save(articleObj);
            });
        });
    });

    describe('deserializeAlohaBlocks() method', function () {
        it('returns null if text is null as well', function () {
            var converted = articleService.deserializeAlohaBlocks(null);
            expect(converted).toBe(null);
        });

        it('converts image placeholders to HTML', function () {
            var converted,
                text = 'Foo <** Image 12 size="small" **> bar.';

            converted = articleService.deserializeAlohaBlocks(text);
            expect(converted).toEqual([
                'Foo ',
                '<div class="image" dropped-image ',
                    'data-id="12" data-size="small"></div>',
                ' bar.'
            ].join(''));
        });

        it('converts snippets placeholders to HTML', function () {
            var converted,
                text = 'Foo <-- Snippet 10 --> bar.';

            converted = articleService.deserializeAlohaBlocks(text);
            expect(converted).toEqual([
                'Foo ',
                '<div class="snippet" data-id="10"></div>',
                ' bar.'
            ].join(''));
        });
    });

    describe('init() method', function () {
        var responseData,
            $httpBackend;

        beforeEach(inject(function (_$httpBackend_) {
            var url = Routing.generate(
                'newscoop_gimme_articles_getarticle',
                {number: 8, language: 'de'},
                true
            );

            responseData = {number: 8, language: 'de'};

            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET(url).respond(200, responseData);
        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            articleService.init({articleId: 8, language: 'de'});
        });

        it('initializes articleId on successful server response', function () {
            articleService.articleId = undefined;

            articleService.init({articleId: 8, language: 'de'});
            $httpBackend.flush(1);

            expect(articleService.articleId).toBe(8);
        });

        it('initializes article language on successful server response',
            function () {
                articleService.language = undefined;

                articleService.init({articleId: 8, language: 'de'});
                $httpBackend.flush(1);

                expect(articleService.language).toEqual('de');
            }
        );

        it('resolves article promise with retrieved data on successful ' +
           'server response',
            function () {
                var callArgs,
                    onSuccess = jasmine.createSpy('onSuccess()');

                articleService.promise.then(onSuccess);

                articleService.init({articleId: 8, language: 'de'});
                $httpBackend.flush(1);

                expect(onSuccess).toHaveBeenCalled();
                callArgs = onSuccess.mostRecentCall.args[0];
                expect(callArgs.number).toEqual(responseData.number);
                expect(callArgs.language).toEqual(responseData.language);
            }
        );

        it('successive calls to the method have no effect', function () {
                articleService.init({articleId: 8, language: 'de'});
                $httpBackend.flush(1);

                // The following should not trigger the "unexpected request"
                // error. If it does, the test (correctly) fails.
                articleService.init({articleId: 8, language: 'de'});
            }
        );
    });

    describe('changeCommentingSetting() method', function () {
        var fakePromiseObj;

        beforeEach(function () {
            articleService.articleId = 1234;
            articleService.language = 'pl';
            fakePromiseObj = {then: null};
            spyOn(articleService.resource, 'save').andCallFake(function () {
                return {
                    $promise: fakePromiseObj
                };
            });
        });

        it('returns resource\'s promise', function () {
            var returnedObj = articleService.changeCommentingSetting(
                articleService.commenting.ENABLED
            );
            expect(returnedObj).toBe(fakePromiseObj);
        });

        it('invokes resource with correct parameters', function () {
            var callArgs;

            articleService.changeCommentingSetting(
                articleService.commenting.DISABLED
            );

            expect(articleService.resource.save.callCount).toBe(1);
            callArgs = articleService.resource.save.mostRecentCall.args;
            expect(callArgs.length).toBeGreaterThan(0);
            expect(callArgs[0]).toEqual({
                articleId: 1234,
                language: 'pl'
            });
        });

        it('provides correct parameters to resource when setting ' +
           'commenting to ENABLED', function () {
                var callArgs;

                articleService.changeCommentingSetting(
                    articleService.commenting.ENABLED
                );

                expect(articleService.resource.save.callCount).toBe(1);
                callArgs = articleService.resource.save.mostRecentCall.args;
                expect(callArgs.length).toBe(2);
                expect(callArgs[1]).toEqual({
                    comments_enabled: 1,
                    comments_locked: 0
                });
        });

        it('provides correct parameters to resource when setting ' +
           'commenting to DISABLED', function () {
                var callArgs;

                articleService.changeCommentingSetting(
                    articleService.commenting.DISABLED
                );

                expect(articleService.resource.save.callCount).toBe(1);
                callArgs = articleService.resource.save.mostRecentCall.args;
                expect(callArgs.length).toBe(2);
                expect(callArgs[1]).toEqual({
                    comments_enabled: 0,
                    comments_locked: 0
                });
        });

        it('provides correct parameters to resource when setting ' +
           'commenting to LOCKED',
            function () {
                var callArgs;

                articleService.changeCommentingSetting(
                    articleService.commenting.LOCKED
                );

                expect(articleService.resource.save.callCount).toBe(1);
                callArgs = articleService.resource.save.mostRecentCall.args;
                expect(callArgs.length).toBe(2);
                expect(callArgs[1]).toEqual({
                    comments_enabled: 0,
                    comments_locked: 1
                });
        });
    });

    describe('setWorkflowStatus() method', function () {
        var $httpBackend;

        beforeEach(inject(function (_$httpBackend_) {
            var url;

            $httpBackend = _$httpBackend_;

            articleService.articleId = 25;
            articleService.language = 'de';

            url = Routing.generate(
                'newscoop_gimme_articles_changearticlestatus',
                {number: 25, language: 'de', status: 'Y'}, true
            );

            $httpBackend.expect('PATCH', url).respond(201, '');
        }));

        it ('sends a correct request to API', function () {
            articleService.setWorkflowStatus('Y');
        });

        it ('returns $http promise', function () {
            var returned = articleService.setWorkflowStatus('Y');

            // if it looks like a promise, then it probably is a promise
            ['then', 'success', 'error', 'finally'].forEach(function (key) {
                expect(typeof returned[key]).toEqual('function');
            });
        });
    });

    describe('textStats() method', function () {
        it('it returns zero count for null value', function () {
            expect(
                articleService.textStats(null)
            ).toEqual({chars: 0, words: 0});
        });

        it('it returns word count of zero for strings with no matches',
            function () {
                expect(
                    articleService.textStats(' #$/ &@! :*+').words
                ).toEqual(0);
            }
        );

        it('correctly counts characters and words in ascii text', function () {
            expect(
                articleService.textStats('foo bar baz')
            ).toEqual({chars: 11, words: 3});
        });

        it('correctly counts characters and words in non-ascii text',
            function () {
                expect(
                    articleService.textStats('foöbarbázŁeiß')
                ).toEqual({chars: 13, words: 1});
            }
        );

        it('does not count HTML tags in statistics', function () {
            var text = '<p>Some text is <b>bold</b>.</p>';
            expect(
                articleService.textStats(text)
            ).toEqual({chars: 18, words: 4});
        });

        it('counts HTML entities as single characters', function () {
            var text = 'A&nbsp;&lt;&nbsp;B&#8482;';  // A < B™
            expect(articleService.textStats(text).chars).toEqual(6);
        });

        it('correctly counts words in text with many different delimiters',
            function () {
                var text = '  foo,bar bAz!Hocus POCUS. one&lt;two ... end  ';
                expect(articleService.textStats(text).words).toEqual(8);
            }
        );

        it('counts numbers as words', function () {
            var text = 'foo 555 bar 777 end';
            expect(articleService.textStats(text).words).toEqual(5);
        });
    });

});
