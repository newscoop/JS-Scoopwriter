'use strict';

/**
* Module with tests for the topics pane controller.
*
* @module PaneTopicsCtrl controller tests
*/
describe('Controller: PaneTopicsCtrl', function () {
    var articleService,
        PaneTopicsCtrl,
        scope,
        $window,
        Translator,
        mockTranslator,
        Topic;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function ($injector) {
        mockTranslator = {
            trans: function (value) {
                return value;
            }
        };

        $window = $injector.get('$window');
        $window.Translator = mockTranslator;
        Translator = $injector.get('Translator');
    }));

    beforeEach(inject(function (
        $controller, $rootScope, _article_, _Topic_
    ) {
        articleService = _article_;
        Topic = _Topic_;

        articleService.articleInstance = {
            articleId: 17,
            language: 'it'
        };

        spyOn(Topic, 'getAllByArticle').andReturn(
            [{id: 1, title: 'foo'}, {id: 4, title: 'bar'}]
        );

        scope = $rootScope.$new();

        scope.addTopic = {
            topicTitle: {
                $setValidity: jasmine.createSpy()
            }
        };

        PaneTopicsCtrl = $controller('PaneTopicsCtrl', {
            $scope: scope,
            article: articleService,
            Topic: Topic
        });
    }));

    afterEach(function () {
        delete $window.Translator;
    });

    it('initializes the list of selected topics in scope to empty list',
        function () {
            expect(scope.selectedTopics).toEqual([]);
        }
    );

    it('initializes the assigningTopics flag in scope to false', function () {
        expect(scope.assigningTopics).toBe(false);
    });

    it('initializes the assigningTopics flag in scope to false', function () {
        expect(scope.assigningTopics).toBe(false);
    });

    it('initializes options for the parent topic widget', function () {
        expect(scope.select2Options).toEqual({
            minimumInputLength: 3,
            query: Topic.liveSearchQuery
        });
    });

    it('initializes the new topic form\'s data to empty values', function () {
        expect(scope.newTopic).toEqual({title: '', parentTopic: null});
    });

    // new topic object
    it('initializes the addingNewTopic flag in scope to false', function () {
        expect(scope.addingNewTopic).toBe(false);
    });


    describe('initialization of article topics in scope', function () {
        it('invokes service\'s getAllByArticle() method with correct ' +
           'parameters',
            function () {
                expect(Topic.getAllByArticle).toHaveBeenCalledWith(17, 'it');
            }
        );

        it('exposes retrieved topics in scope', function () {
            expect(scope.assignedTopics).toEqual(
                [{id: 1, title: 'foo'}, {id: 4, title: 'bar'}]
            );
        });
    });


    describe('scope\'s addNewTopicToArticle() method', function () {
        var addToArticleDelay,
            fakeNewTopic,
            topicCreateDelay;

        beforeEach(inject(function ($q) {
            fakeNewTopic = {
                id: 55,
                title: 'New Topic',
                parentId: 123
            };

            topicCreateDelay = $q.defer();
            spyOn(Topic, 'create').andCallFake(function () {
                return topicCreateDelay.promise;
            });

            addToArticleDelay = $q.defer();
            spyOn(Topic, 'addToArticle').andCallFake(function () {
                return addToArticleDelay.promise;
            });
        }));

        it('sets addingNewTopic flag before doing anything', function () {
            scope.addingNewTopic = false;
            scope.addNewTopicToArticle({title: 'foo'});
            expect(scope.addingNewTopic).toEqual(true);
        });

        it('tries to create a new topic with correct data (no parent topic)',
            function () {
                scope.addNewTopicToArticle({title: 'foo'});
                expect(Topic.create).toHaveBeenCalledWith('foo', undefined, 'it');
            }
        );

        it('tries to create a new topic with correct data (with parent topic)',
            function () {
                scope.addNewTopicToArticle({
                    title: 'foo',
                    parentTopic: {id: 17}
                });
                expect(Topic.create).toHaveBeenCalledWith('foo', 17, 'it');
            }
        );

        it('sets the topicTitle form field to invalid if the topic name ' +
            'already exists',
            function () {
                scope.addNewTopicToArticle({title: 'Already exists'});
                topicCreateDelay.reject({status: 409});
                scope.$digest();

                expect(scope.addTopic.topicTitle.$setValidity)
                    .toHaveBeenCalledWith('duplicate', false);
            }
        );

        it('tries to assign the newly created topic to article', function () {
            scope.addNewTopicToArticle({title: 'New Topic'});
            topicCreateDelay.resolve(fakeNewTopic);
            scope.$digest();

            expect(Topic.addToArticle).toHaveBeenCalledWith(
                17, 'it', [fakeNewTopic]);
        });

        it('appends the new topic to assignedTopics list if topic\'s parent ' +
            'is not present',
            function () {
                scope.assignedTopics = [{id: 2}, {id: 8}, {id: 4}];

                scope.addNewTopicToArticle({
                    title: 'New Topic',
                    parentTopic: {id: 123}
                });
                topicCreateDelay.resolve(fakeNewTopic);
                addToArticleDelay.resolve();
                scope.$digest();

                expect(scope.assignedTopics).toEqual(
                    [{id: 2}, {id: 8}, {id: 4}, fakeNewTopic]
                );
            }
        );

        it('inserts the new topic into assignedTopics list immediately ' +
            'after its parent if the parent is in the list',
            function () {
                scope.assignedTopics = [{id: 2}, {id: 123}, {id: 4}];

                scope.addNewTopicToArticle({
                    title: 'New Topic',
                    parentTopic: {id: 123}
                });
                topicCreateDelay.resolve(fakeNewTopic);
                addToArticleDelay.resolve();
                scope.$digest();

                expect(scope.assignedTopics).toEqual(
                    [{id: 2}, {id: 123}, fakeNewTopic, {id: 4}]
                );
            }
        );

        it('clears the new topic form on successful assignment of the new ' +
            'topic to article',
            function () {
                scope.newTopic = {title: 'New Topic', parentTopic: {id: 123}};

                scope.addNewTopicToArticle({
                    title: 'New Topic',
                    parentTopic: {id: 123}
                });
                topicCreateDelay.resolve(fakeNewTopic);
                addToArticleDelay.resolve();
                scope.$digest();

                expect(scope.newTopic).toEqual(
                    {title: '', parentTopic: null}
                );
            }
        );

        it('clears the addingNewTopic flag on error', function () {
            scope.addNewTopicToArticle({title: 'New Topic'});
            scope.addingNewTopic = true;  // make sure it is indeed true
            topicCreateDelay.reject({status: 500});
            scope.$digest();

            expect(scope.addingNewTopic).toBe(false);
        });
    });


    describe('scope\'s clearNewTopicForm() method', function () {
        it('clears all new topic form fields', function () {
            scope.newTopic = {title: 'Economy', parentTopic: {id: 123}};

            scope.clearNewTopicForm();

            expect(scope.newTopic.title).toEqual('');
            expect(scope.newTopic.parentTopic).toBe(null);
        });

        it('resets duplicate topic title error', function () {
            scope.clearNewTopicForm();
            expect(scope.addTopic.topicTitle.$setValidity)
                .toHaveBeenCalledWith('duplicate', true);
        });
    });


    describe('scope\'s clearSelectedTopics() method', function () {
        it('clears the selected topics list', function () {
            scope.selectedTopics = [
                {id: 1, title: 'topic 1'}, {id: 5, title: 'topic 5'}
            ];
            scope.clearSelectedTopics();
            expect(scope.selectedTopics).toEqual([]);
        });
    });


    describe('scope\'s findTopics() method', function () {
        var deferredGetAll,
            allTopics;

        beforeEach(inject(function ($q) {
            allTopics = [
                {id: 2, title: 'Motor Sports'},
                {id: 9, title: 'Water Sports'},
                {id: 3, title: 'Politics'},
                {id: 5, title: 'FooSportBaz'},
                {id: 1, title: 'Local News'},
                {id: 8, title: 'Economy'}
            ];

            deferredGetAll = $q.defer();
            allTopics.$promise = deferredGetAll.promise;
            spyOn(Topic, 'getAll').andReturn(allTopics);

            scope.selectedTopics = [];
            scope.assignedTopics = [];
        }));

        it('returns a promise', inject(function ($q) {
            var promiseConstructor = $q.defer().promise.constructor,
                promise = scope.findTopics('foo');
            expect(promise instanceof promiseConstructor).toBe(true);
        }));

        it('resolves given promise with found topics list', function () {
            var promise = scope.findTopics('litic'),
                onSuccessSpy = jasmine.createSpy();

            promise.then(onSuccessSpy);
            deferredGetAll.resolve();
            scope.$digest();

            expect(onSuccessSpy).toHaveBeenCalledWith(
                [{id: 3, title: 'Politics'}]
            );
        });

        it('performs a case-insensitive search', function () {
            var promise = scope.findTopics('SpoRt'),
                onSuccessSpy = jasmine.createSpy();

            promise.then(onSuccessSpy);
            deferredGetAll.resolve();
            scope.$digest();

            expect(onSuccessSpy).toHaveBeenCalledWith([
                {id: 2, title: 'Motor Sports'},
                {id: 9, title: 'Water Sports'},
                {id: 5, title: 'FooSportBaz'}
            ]);
        });

        it('filters out already selected topics from results', function () {
            var promise,
                onSuccessSpy = jasmine.createSpy();

            scope.selectedTopics= [{id: 9, title: 'Water Sports'}];

            promise = scope.findTopics('Sport');
            promise.then(onSuccessSpy);
            deferredGetAll.resolve();
            scope.$digest();

            expect(onSuccessSpy).toHaveBeenCalledWith([
                {id: 2, title: 'Motor Sports'},
                {id: 5, title: 'FooSportBaz'}
            ]);
        });

        it('filters out already assigned topics from results', function () {
            var promise,
                onSuccessSpy = jasmine.createSpy();

            scope.assignedTopics= [{id: 9, title: 'Water Sports'}];

            promise = scope.findTopics('Sport');
            promise.then(onSuccessSpy);
            deferredGetAll.resolve();
            scope.$digest();

            expect(onSuccessSpy).toHaveBeenCalledWith([
                {id: 2, title: 'Motor Sports'},
                {id: 5, title: 'FooSportBaz'}
            ]);
        });

        it('retrieves all topics list only once', function () {
            scope.findTopics('Sport');
            deferredGetAll.resolve();
            scope.$digest();

            scope.findTopics('Economy');
            deferredGetAll.resolve();
            scope.$digest();

            expect(Topic.getAll.callCount).toEqual(1);
        });
    });

    describe('scope\'s assignSelectedToArticle() method', function () {
        var deferredAdd,
            topics;

        beforeEach(inject(function ($q) {
            topics = [
                {id: 2, title: 'topic 2'},
                {id: 9, title: 'topic 9'},
            ];

            deferredAdd = $q.defer();
            spyOn(Topic, 'addToArticle').andReturn(deferredAdd.promise);

            articleService.articleInstance.articleId = 18;
            articleService.articleInstance.language = 'it';

            scope.selectedTopics = angular.copy(topics);
            scope.assignedTopics = [{id: 4, title: 'topic 4'}];
        }));

        it('sets the assigningTopics flag before doing anything', function () {
            scope.assigningTopics = false;
            scope.assignSelectedToArticle();
            expect(scope.assigningTopics).toBe(true);
        });

        it('invokes the Topic service\'s addToArticle() method with correct ' +
           'parameters',
            function () {
                scope.assignSelectedToArticle();
                expect(Topic.addToArticle).toHaveBeenCalledWith(
                    18, 'it', topics
                );
            }
        );

        it('clears the assigningTopics flag on successful server response',
            function () {
                scope.assignSelectedToArticle();
                scope.assigningTopics = true;  // make sure the flag is set

                deferredAdd.resolve(topics);
                scope.$apply();

                expect(scope.assigningTopics).toBe(false);
            }
        );

        it('clears the assigningTopics flag on server error response',
            function () {
                scope.assignSelectedToArticle();
                scope.assigningTopics = true;  // make sure the flag is set

                deferredAdd.reject('Timeout');
                scope.$apply();

                expect(scope.assigningTopics).toBe(false);
            }
        );

        it('adds added topics to the assignedTopics list on successful ' +
           'server response',
            function () {
                scope.assignSelectedToArticle();

                deferredAdd.resolve(topics);
                scope.$apply();

                expect(scope.assignedTopics).toEqual([
                    {id: 4, title: 'topic 4'},
                    {id: 2, title: 'topic 2'},
                    {id: 9, title: 'topic 9'}
                ]);
            }
        );

        it('clears the selected topics list on successful server response',
            function () {
                scope.assignSelectedToArticle();

                deferredAdd.resolve(topics);
                scope.$apply();

                expect(scope.selectedTopics).toEqual([]);
            }
        );
    });

    describe('scope\'s confirmUnassignTopic() method', function () {
        var deferedRemove,
            topic,
            modalDeferred,
            modalFactory;

        beforeEach(inject(function ($q, _modalFactory_) {
            deferedRemove = $q.defer();
            modalDeferred = $q.defer();
            modalFactory = _modalFactory_;

            articleService.articleInstance.articleId = 25;
            articleService.articleInstance.language = 'de';

            spyOn(modalFactory, 'confirmLight').andCallFake(function () {
                return {
                    result: modalDeferred.promise
                };
            });

            Topic.getAllByArticle.andReturn([]);

            topic = {
                id: 20,
                removeFromArticle: function () {}
            };
            spyOn(topic, 'removeFromArticle').andReturn(deferedRemove.promise);
        }));

        it('opens a "light" confirmation dialog', function () {
            scope.confirmUnassignTopic(topic);
            expect(modalFactory.confirmLight).toHaveBeenCalled();
        });

        it('invokes topic\'s removeFromArticle() method ' +
            'with correct parameters on action confirmation',
            function () {
                scope.confirmUnassignTopic(topic);
                modalDeferred.resolve();
                scope.$apply();

                expect(topic.removeFromArticle).toHaveBeenCalledWith(25, 'de');
            }
        );

        it('does not try to unassign topic on action cancellation',
            function () {
                scope.confirmUnassignTopic(topic);
                modalDeferred.reject();
                scope.$apply();

                expect(topic.removeFromArticle).not.toHaveBeenCalled();
            }
        );

        it('removes the topic from the list of assigned topics ' +
           'on action confirmation',
           function () {
                scope.assignedTopics= [
                    {id: 4, title: 'topic 4'},
                    {id: 20, title: 'topic 20'},
                    {id: 8, title: 'topic 8'}
                ];

                scope.confirmUnassignTopic(topic);
                modalDeferred.resolve();
                deferedRemove.resolve();
                scope.$apply();

                expect(scope.assignedTopics).toEqual(
                    [{id: 4, title: 'topic 4'}, {id: 8, title: 'topic 8'}]
                );
            }
        );
    });

});
