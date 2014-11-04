'use strict';

/**
* Module with tests for the switches pane controller.
*
* @module PaneSwitchesCtrl controller tests
*/
describe('Controller: PaneSwitchesCtrl', function () {
    var articleService,
        articleDeferred,
        articleTypeDeferred,
        ArticleType,
        PaneSwitchesCtrl,
        $q,
        $rootScope;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (
        $controller, _$q_, _$rootScope_, _article_, _ArticleType_
    ) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        articleService = _article_;
        ArticleType = _ArticleType_;

        articleDeferred = $q.defer();
        articleService.promise = articleDeferred.promise;

        articleTypeDeferred = $q.defer();
        spyOn(ArticleType, 'getByName').andReturn(articleTypeDeferred.promise);

        PaneSwitchesCtrl = $controller('PaneSwitchesCtrl', {
            article: articleService,
            ArticleType: ArticleType
        });
    }));

    it('initializes the modified flag to false', function () {
        expect(PaneSwitchesCtrl.modified).toBe(false);
    });

    it('initializes the saveInProgress flag to false', function () {
        expect(PaneSwitchesCtrl.saveInProgress).toBe(false);
    });

    it('retrieves fields\' metadata for the correct article type',
        function () {
            articleDeferred.resolve({
                number: 8, language: 'it', type: 'news', fields: {}
            });
            $rootScope.$apply();
            expect(ArticleType.getByName).toHaveBeenCalledWith('news');
        }
    );

    it('initializes the list of switch fields\' names when data is retrieved',
        function () {
            articleDeferred.resolve({
                number: 8, language: 'it', type: 'news', fields: {}
            });
            articleTypeDeferred.resolve({
                fields: [
                    {name: 'switch_1', type: 'switch'},
                    {name: 'teaser', type: 'text'},
                    {name: 'switch_2', type: 'switch'}
                ]
            });
            $rootScope.$apply();

            expect(PaneSwitchesCtrl.switchNames).toEqual(
                ['switch_1', 'switch_2']
            );
        }
    );

    it('converts article\'s switch fields\' values to booleans ' +
        'when data is retrieved',
        function () {
            articleDeferred.resolve({
                number: 8, language: 'it', type: 'news',
                fields: {
                    'switch_1': '0',
                    'teaser': 'foobar',
                    'switch_2': '1'
                    // switch_3 is undefined
                }
            });
            articleTypeDeferred.resolve({
                fields: [
                    {name: 'switch_1', type: 'switch'},
                    {name: 'teaser', type: 'text'},
                    {name: 'switch_3', type: 'switch'},
                    {name: 'switch_2', type: 'switch'}
                ]
            });
            $rootScope.$apply();

            expect(PaneSwitchesCtrl.articleObj.fields).toEqual({
                'switch_1': false,
                'switch_2': true,
                'switch_3': false,
                'teaser': 'foobar'
            });
        }
    );

    describe('valueChanged() method', function () {
        it('sets the modified flag', function () {
            PaneSwitchesCtrl.modified = false;
            PaneSwitchesCtrl.valueChanged();
            expect(PaneSwitchesCtrl.modified).toBe(true);
        });

        it('does not change the modified flag if it is already set',
            function () {
                PaneSwitchesCtrl.modified = true;
                PaneSwitchesCtrl.valueChanged();
                expect(PaneSwitchesCtrl.modified).toBe(true);
            }
        );
    });

    describe('save() method', function () {
        var saveSwitchesDeferred

        beforeEach(inject(function ($q) {
            saveSwitchesDeferred = $q.defer();
            spyOn(articleService, 'saveSwitches').andReturn(
                saveSwitchesDeferred.promise);
        }));

        it('sets the saveInProgress flag before doing anything', function () {
            PaneSwitchesCtrl.saveInProgress = false;
            PaneSwitchesCtrl.save();
            expect(PaneSwitchesCtrl.saveInProgress).toBe(true);
        });

        it('clears the saveInProgress flag on success', function () {
            PaneSwitchesCtrl.saveInProgress = true;

            PaneSwitchesCtrl.save();
            saveSwitchesDeferred.resolve();
            $rootScope.$apply();

            expect(PaneSwitchesCtrl.saveInProgress).toBe(false);
        });

        it('clears the saveInProgress flag on error', function () {
            PaneSwitchesCtrl.saveInProgress = true;

            PaneSwitchesCtrl.save();
            saveSwitchesDeferred.reject();
            $rootScope.$apply();

            expect(PaneSwitchesCtrl.saveInProgress).toBe(false);
        });

        it('clears the modified flag on success', function () {
            PaneSwitchesCtrl.modified = true;

            PaneSwitchesCtrl.save();
            saveSwitchesDeferred.resolve();
            $rootScope.$apply();

            expect(PaneSwitchesCtrl.modified).toBe(false);
        });

        it('clears the modified flag on error', function () {
            PaneSwitchesCtrl.modified = true;

            PaneSwitchesCtrl.save();
            saveSwitchesDeferred.reject();
            $rootScope.$apply();

            expect(PaneSwitchesCtrl.modified).toBe(false);
        });

        it('invokes article service\'s saveSwitches() method ' +
            'with correct parameters',
            function () {
                PaneSwitchesCtrl.articleObj= {
                    number: 8,
                    language: 'fr',
                    fields: {}
                };
                PaneSwitchesCtrl.switchNames = ['switch_1', 'switch_2'];

                PaneSwitchesCtrl.save();

                expect(articleService.saveSwitches).toHaveBeenCalledWith(
                    {number: 8, language: 'fr', fields: {}},
                    ['switch_1', 'switch_2']
                );
            }
        );
    });
});
