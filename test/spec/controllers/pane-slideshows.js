'use strict';

/**
* Module with tests for the slideshows pane controller.
*
* @module PaneSlideshowsCtrl controller tests
*/
describe('Controller: PaneSlideshowsCtrl', function () {
    var articleService,
        PaneSlideshowsCtrl,
        scope,
        Slideshow;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (
        $controller, $rootScope, _article_, _Slideshow_
    ) {
        articleService = _article_;
        Slideshow = _Slideshow_;

        scope = $rootScope.$new();

        spyOn(scope, '$broadcast').andCallThrough();
        articleService.articleInstance = {
            articleId: 64,
            language: 'en'
        };

        spyOn(Slideshow, 'getAllByArticle').andReturn(
            [{
                cover: "http://newscoop.dev/images/cache/3200x2368/fit/images%7Ccms-image-000000131.jpg",
                id: 1,
                itemsCount: 2,
                title: "Test Slideshow",
                type: "image"
            },
            {
                cover: "http://newscoop.dev/images/cache/3200x2368/fit/images%7Ccms-image-000000132.jpg",
                id: 2,
                itemsCount: 1,
                title: "Test Slideshow 2",
                type: "image"
            }]
        );

        PaneSlideshowsCtrl = $controller('PaneSlideshowsCtrl', {
            $scope: scope,
            article: articleService,
            Slideshow: Slideshow
        });
    }));

    describe('initialization of article slideshows in slideshows list', function () {
        it('invokes service\'s getAllByArticle() method with correct ' +
           'parameters',
            function () {
                expect(Slideshow.getAllByArticle).toHaveBeenCalledWith(64, 'en');
            }
        );

        it('exposes retrieved slideshows in scope', function () {
            expect(PaneSlideshowsCtrl.assignedSlideshows).toEqual(
                [{
                    cover: "http://newscoop.dev/images/cache/3200x2368/fit/images%7Ccms-image-000000131.jpg",
                    id: 1,
                    itemsCount: 2,
                    title: "Test Slideshow",
                    type: "image"
                },
                {
                    cover: "http://newscoop.dev/images/cache/3200x2368/fit/images%7Ccms-image-000000132.jpg",
                    id: 2,
                    itemsCount: 1,
                    title: "Test Slideshow 2",
                    type: "image"
                }]
            );
        });

        it('$scope.$on should have been triggered', function() {
            scope.$broadcast("close-slideshow-modal");
            expect(scope.$broadcast).toHaveBeenCalledWith("close-slideshow-modal");
        });
    });

    describe('confirmUnassignSlideshow() method', function () {
        var deferedRemove,
            slideshow,
            deferred,
            toaster,
            modalDeferred,
            modalFactory;

        beforeEach(inject(function ($q, _modalFactory_, _toaster_) {
            toaster = _toaster_;
            deferred = $q.defer();
            deferedRemove = $q.defer();
            modalDeferred = $q.defer();
            modalFactory = _modalFactory_;

            articleService.articleInstance.articleId = 64;
            articleService.articleInstance.language = 'en';

            spyOn(modalFactory, 'confirmLight').andCallFake(function () {
                return {
                    result: modalDeferred.promise
                };
            });

            Slideshow.getAllByArticle.andReturn([]);

            slideshow = {
                id: 1,
                removeFromArticle: function () {}
            };
            spyOn(slideshow, 'removeFromArticle').andReturn(deferedRemove.promise);

            spyOn(toaster, 'add').andCallFake(function () {
                return deferred.promise;
            });
        }));

        it('opens a "light" confirmation dialog', function () {
            PaneSlideshowsCtrl.confirmUnassignSlideshow(slideshow);
            expect(modalFactory.confirmLight).toHaveBeenCalled();
        });

        it('invokes slideshow\'s removeFromArticle() method ' +
            'with correct parameters on action confirmation',
            function () {
                PaneSlideshowsCtrl.confirmUnassignSlideshow(slideshow);
                modalDeferred.resolve();
                scope.$apply();

                expect(slideshow.removeFromArticle).toHaveBeenCalledWith(64, 'en');
            }
        );

        it('does not try to unassign slideshow on action cancellation',
            function () {
                PaneSlideshowsCtrl.confirmUnassignSlideshow(slideshow);
                modalDeferred.reject();
                scope.$apply();

                expect(slideshow.removeFromArticle).not.toHaveBeenCalled();
            }
        );

        it('removes the slideshow from the list of assigned slideshows ' +
           'on action confirmation',
           function () {
                PaneSlideshowsCtrl.assignedSlideshows = [
                    {id: 1, title: 'slideshow 1'},
                    {id: 2, title: 'slideshows 2'},
                    {id: 5, title: 'slideshow 5'}
                ];

                PaneSlideshowsCtrl.confirmUnassignSlideshow(slideshow);
                modalDeferred.resolve();
                deferedRemove.resolve();
                scope.$apply();

                expect(PaneSlideshowsCtrl.assignedSlideshows).toEqual(
                    [{id: 2, title: 'slideshows 2'}, {id: 5, title: 'slideshow 5'}]
                );
            }
        );

        it('calls toaster.add() with appropriate params on success', function () {
            PaneSlideshowsCtrl.confirmUnassignSlideshow(slideshow);
            modalDeferred.resolve();
            deferedRemove.resolve();
            scope.$apply();

            expect(toaster.add).toHaveBeenCalledWith({
                type: 'sf-info',
                message: 'aes.msgs.slideshows.unassign.success'
            });
        });

        it('calls toaster.add() with appropriate params on error', function () {
            PaneSlideshowsCtrl.confirmUnassignSlideshow(slideshow);
            modalDeferred.resolve();
            deferedRemove.reject(false);
            scope.$apply();

            expect(toaster.add).toHaveBeenCalledWith({
                type: 'sf-error',
                message: 'aes.msgs.slideshows.unassign.error'
            });
        });
    });

});