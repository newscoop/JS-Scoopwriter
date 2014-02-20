'use strict';

describe('Service: Comments', function () {

    var comments = [{
        id: 26822,
        author: "Inihe Ublinschä",
        subject: "subject",
        message: "message",
        thread_level: 0,
        thread_order: 1,
        status: "approved",
        created: "2013-11-28T18:10:09+0000",
        updated: "2013-11-28T18:10:09+0000",
        recommended: 0
    }, {
        id: 26828,
        author: "More Timat",
        subject: "ungeeignet..",
        message: "Mir fiel derselbe Satz auf: «Das Anliegen, die Spekulation mit Grundbesitz einzudämmen ... , sei zwar verständlich, doch die Initiative sei dazu ungeeignet» Ja was gibts denn für geeignete Mittel möchte ich gerne wissen. Enteignung? Verstaatlichung des gesamten Bodens und Verpachtung im Baurecht für 99 Jahre? Vorschläge willkommen!",
        thread_level: 0,
        thread_order: 2,
        status: "approved",
        created: "2013-11-28T21:30:43+0000",
        updated: "2013-11-28T21:30:43+0000",
        recommended: 1
    }];
    var raw = {
        items: comments
    };

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var comments, $httpBackend;
    beforeEach(inject(function (_comments_, _$httpBackend_, _article_) {
        $httpBackend = _$httpBackend_;
        $httpBackend.expect(
            'GET',
            'http://tw-merge.lab.sourcefabric.org/content-api/comments/article/64/de?page=1'
        ).respond(raw);
        comments = _comments_;
        _article_.promise = {
            then: function(f) {
                f({
                    number: 64,
                    language: 'de'
                });
            }
        };
        comments.init();
    }));

    describe('the resource', function() {
        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('saves a comment', function() {
            var spies = {
                data: function() { return true; },
                success: function() {}
            };
            spyOn(spies, 'data').andCallThrough();
            spyOn(spies, 'success');
            $httpBackend.expect(
                'POST',
                'http://tw-merge.lab.sourcefabric.org/content-api/comments/article/64/de',
                spies.data
            ).respond(200, '');
            comments.resource.save({
                articleNumber: 64,
                languageCode: 'de'
            }, {
                message: 'hey, Joe, let us go!'
            }, spies.success);
            $httpBackend.flush();
            expect(spies.success).toHaveBeenCalled();
            expect(spies.data).toHaveBeenCalledWith('message=hey%2C+Joe%2C+let+us+go!');
        });
    });

    describe('server answered', function() {
        beforeEach(function() {
            $httpBackend.flush();
        });
        it('has comments', function () {
            expect(comments.displayed.length).toBe(2);
        });
        describe('comment created', function() {
            var p = {
                comment: {
                    subject: 'subj',
                    message: 'message',
                    author: 'sancio'
                }
            };
            beforeEach(function() {
                spyOn(comments.resource, 'create');
                comments.add(p);
            });
            it('creates a comment', function() {
                expect(comments.resource.create.mostRecentCall.args[1])
                    .toEqual({ comment : { subject : 'subj', message : 'message', author : 'sancio' } });
            });
            it('adds the comment on success', function() {
                var location = 'http://tw-merge.lab.sourcefabric.org/content-api/comments/26996';
                $httpBackend.expect(
                    'GET',
                    location
                ).respond({});
                comments.resource.create
                    .mostRecentCall.args[2]({}, function() {
                        return location;
                    });
                $httpBackend.flush();
                expect(comments.displayed.length).toBe(3);
            });
        });
        describe('a single comment', function() {
            var comment;
            beforeEach(function() {
                comment = comments.displayed[0];
            });
            describe('removed', function() {
                beforeEach(function() {
                    comments.displayed[0].remove();
                });
                it('removes itself', function() {
                    expect(comments.displayed.length).toBe(2);
                });
            });
            it('is not being edited', function() {
                expect(comment.isEdited).toBe(false);
            });
            describe('being edited', function() {
                beforeEach(function() {
                    comment.edit();
                });
                it('updates its editing content', function() {
                    expect(comment.editing.subject).toBe('subject');
                    expect(comment.editing.message).toBe('message');
                });
                it('knows that it is being edited', function() {
                    expect(comment.isEdited).toBe(true);
                });
                describe('fields changed', function() {
                    beforeEach(function() {
                        comment.editing.subject = 'edited subject';
                        comment.editing.message = 'edited message';
                    });
                    describe('canceled', function() {
                        beforeEach(function() {
                            comment.cancel();
                        });
                        it('is not being edited anymore', function() {
                            expect(comment.isEdited).toBe(false);
                        });
                        describe('edited', function() {
                            beforeEach(function() {
                                comment.edit();
                            });
                            it('resets the contents', function() {
                                expect(comment.editing.subject)
                                    .toBe('subject');
                                expect(comment.editing.message)
                                    .toBe('message');
                            });
                        });
                    });
                    describe('saved', function() {
                        beforeEach(function() {
                            $httpBackend.expect(
                                'POST',
                                'http://tw-merge.lab.sourcefabric.org/content-api/comments/article/64/de/26822'
                            ).respond(200, '');
                            comment.save();
                            $httpBackend.flush();
                        });
                        it('is done with editing', function() {
                            expect(comment.isEdited).toBe(false);
                        });
                        it('gets updated', function() {
                            expect(comment.subject).toBe('edited subject');
                            expect(comment.message).toBe('edited message');
                        });
                    });
                });
            });
        });
    });
});
