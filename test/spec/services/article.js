'use strict';

/**
* Module with tests for the article service.
*
* @module article service tests
*/

describe('Service: article', function () {
    var article,
        $httpBackend,
        $rootScope;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_article_, _$httpBackend_, _$rootScope_) {
        article = _article_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
    }));

    it('should define correct options for "commenting"', function () {
        var options = article.commenting;
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
            var options = article.wfStatus;
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
            var options = article.issueWfStatus;
            expect(options).toBeDefined();
            expect(_.size(options)).toEqual(2);
            expect('NOT_PUBLISHED' in options).toBe(true);
            expect(options.NOT_PUBLISHED).toEqual('N');
            expect('PUBLISHED' in options).toBe(true);
            expect(options.PUBLISHED).toEqual('Y');
        }
    );

    it('has the modified flag cleared by default', function () {
        expect(article.modified).toBe(false);
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
            article.save(articleObj);
        });

        it('resolves given promise on successful server response',
            function () {
                var successSpy = jasmine.createSpy();

                article.save(articleObj).then(successSpy);
                $httpBackend.flush(1);
                expect(successSpy).toHaveBeenCalled();
            }
        );

        it('rejects given promise on server error response',
            function () {
                var errorSpy = jasmine.createSpy();

                $httpBackend.resetExpectations();
                $httpBackend.expectPATCH(url).respond(500);

                article.save(articleObj).catch(errorSpy);
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

                    article.save(articleObj);
                }
            );

            it('does not convert empty (null) content fields', function () {
                articleObj.fields.teaser = null;

                checkPostData.andCallFake(function (data) {
                    var jsonData = JSON.parse(data);
                    return jsonData.fields.teaser === null;  // still null?
                });

                article.save(articleObj);
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

                article.save(articleObj);
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

                article.save(articleObj);
            });
        });
    });

    describe('deserializeAlohaBlocks', function () {
        it('returns null if text is null as well', function () {
            var converted = article.deserializeAlohaBlocks(null);
            expect(converted).toBe(null);
        });

        it('converts image placeholders to HTML', function () {
            var converted,
                text = 'Foo <** Image 12 size="small" **> bar.';

            converted = article.deserializeAlohaBlocks(text);
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

            converted = article.deserializeAlohaBlocks(text);
            expect(converted).toEqual([
                'Foo ',
                '<div class="snippet" data-id="10"></div>',
                ' bar.'
            ].join(''));
        });
    });

    describe('changeCommentingSetting() method', function () {
        var fakePromiseObj;

        beforeEach(function () {
            article.articleId = 1234;
            article.language = 'pl';
            fakePromiseObj = {then: null};
            spyOn(article.resource, 'save').andCallFake(function () {
                return {
                    $promise: fakePromiseObj
                };
            });
        });

        it('returns resource\'s promise', function () {
            var returnedObj = article.changeCommentingSetting(
                article.commenting.ENABLED
            );
            expect(returnedObj).toBe(fakePromiseObj);
        });

        it('invokes resource with correct parameters', function () {
            var callArgs;

            article.changeCommentingSetting(
                article.commenting.DISABLED
            );

            expect(article.resource.save.callCount).toBe(1);
            callArgs = article.resource.save.mostRecentCall.args;
            expect(callArgs.length).toBeGreaterThan(0);
            expect(callArgs[0]).toEqual({
                articleId: 1234,
                language: 'pl'
            });
        });

        it('provides correct parameters to resource when setting ' +
           'commenting to ENABLED', function () {
                var callArgs;

                article.changeCommentingSetting(
                    article.commenting.ENABLED
                );

                expect(article.resource.save.callCount).toBe(1);
                callArgs = article.resource.save.mostRecentCall.args;
                expect(callArgs.length).toBe(2);
                expect(callArgs[1]).toEqual({
                    comments_enabled: 1,
                    comments_locked: 0
                });
        });

        it('provides correct parameters to resource when setting ' +
           'commenting to DISABLED', function () {
                var callArgs;

                article.changeCommentingSetting(
                    article.commenting.DISABLED
                );

                expect(article.resource.save.callCount).toBe(1);
                callArgs = article.resource.save.mostRecentCall.args;
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

                article.changeCommentingSetting(
                    article.commenting.LOCKED
                );

                expect(article.resource.save.callCount).toBe(1);
                callArgs = article.resource.save.mostRecentCall.args;
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


    xdescribe('initialised', function() {
        var earlyPromise = jasmine.createSpy('earlyPromise');

        beforeEach(function() {
            var url = Routing.generate(
                'newscoop_gimme_articles_getarticle',
                {number: 64, language: 'de'}, true
            );

            $httpBackend.expect('GET', url).respond({});

            article.promise.then(function() {
                earlyPromise();
            });
            article.init({
                articleId: 64,
                language: 'de'
            });
        });
        describe('server answered', function() {
            beforeEach(function() {
                $httpBackend.flush();
            });
            it('keeps the early promise', function() {
                expect(earlyPromise).toHaveBeenCalled();
            });
            it('keeps a late promise', function(done) {
                var spy = jasmine.createSpy('spy');
                article.promise.then(function() {
                    spy();
                    done = true;
                });
                $rootScope.$apply();
                expect(spy).toHaveBeenCalled();
            });
            describe('initialised again', function() {
                beforeEach(function() {
                    article.init({
                        articleId: 64,
                        language: 'de'
                    });
                });
                it('does not require the article again', function() {
                    expect(true); // just to trigger before and after each
                });
                it('keeps another late promise', function(done) {
                    var spy = jasmine.createSpy('spy');
                    article.promise.then(function() {
                        spy();
                    });
                    $rootScope.$apply();
                    expect(spy).toHaveBeenCalled();
                });
            });
        });
    });

});
