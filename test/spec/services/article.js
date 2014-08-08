'use strict';

describe('Service: article', function () {

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var article, $httpBackend, $rootScope;
    beforeEach(inject(function (_article_, _$httpBackend_, _$rootScope_) {
        article = _article_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
    }));
    afterEach(function() {
        $httpBackend.verifyNoOutstandingRequest();
        $httpBackend.verifyNoOutstandingExpectation();
    });

    it('should do something', function () {
        expect(!!article).toBe(true);
    });

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

    it('is not modified', function() {
        expect(article.modified).toBe(false);
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

    describe('initialised', function() {
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

            describe('changeCommentingSetting() method', function() {
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
        });
    });

});
