'use strict';

/**
* Module with tests for the switches pane controller.
*
* @module PaneSwitchesCtrl controller tests
*/
describe('Controller: PaneSwitchesCtrl', function () {
    var articleService,
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

        articleService.articleInstance = {
            articleId: 8,
            language: 'it',
            type: 'news',
            fields: {}
        };

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
            expect(ArticleType.getByName).toHaveBeenCalledWith('news');
        }
    );

    it('initializes the list of switch fields\' names with built-in switches',
        function () {
            expect(PaneSwitchesCtrl.switches).toEqual([
                {name: 'show_on_front_page', text: 'Show on Front Page'},
                {name: 'show_on_section_page', text: 'Show on Section Page'}
            ]);
        }
    );

    it('adds field names of user-defined switches to the list of switch ' +
        'names when data is retrieved',
        function () {
            PaneSwitchesCtrl.switches = [
                {name: 'foo', text: 'bar'}
            ];

            articleTypeDeferred.resolve({
                fields: [
                    {name: 'switch_1', type: 'switch'},
                    {name: 'teaser', type: 'text'},
                    {name: 'switch_2', type: 'switch'}
                ]
            });
            $rootScope.$digest();

            expect(PaneSwitchesCtrl.switches).toEqual([
                {name: 'foo', text: 'bar'},
                {name: 'switch_1', text: 'switch_1'},
                {name: 'switch_2', text: 'switch_2'}
            ]);
        }
    );

    it('uses human-friendly switch names, if available', function () {
        PaneSwitchesCtrl.switches = [];

        articleTypeDeferred.resolve({
            fields: [
                {name: 'switch_1', type: 'switch', phrase: '1st switch'},
                {name: 'switch_2', type: 'switch', phrase: '2nd switch'},
                {name: 'switch_3', type: 'switch'}
            ]
        });
        $rootScope.$digest();

        expect(PaneSwitchesCtrl.switches).toEqual([
            {name: 'switch_1', text: '1st switch'},
            {name: 'switch_2', text: '2nd switch'},
            {name: 'switch_3', text: 'switch_3'}
        ]);
    });

    it('converts article\'s switch fields\' values to booleans ' +
        'when data is retrieved',
        function () {
            PaneSwitchesCtrl.article.fields = {
                switch_1: '0',
                teaser: 'foobar',
                switch_2: '1',
                // switch_3 is undefined
                show_on_front_page: 0,
                show_on_section_page: 1
            };

            articleTypeDeferred.resolve({
                fields: [
                    {name: 'switch_1', type: 'switch'},
                    {name: 'teaser', type: 'text'},
                    {name: 'switch_3', type: 'switch'},
                    {name: 'switch_2', type: 'switch'}
                ]
            });
            $rootScope.$digest();

            expect(PaneSwitchesCtrl.article.fields).toEqual({
                show_on_front_page: false,
                show_on_section_page: true,
                switch_1: false,
                switch_2: true,
                switch_3: false,
                teaser: 'foobar'
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
        var saveSwitchesDeferred;

        beforeEach(inject(function ($q) {
            saveSwitchesDeferred = $q.defer();
            PaneSwitchesCtrl.article.saveSwitches = jasmine.createSpy()
                .andReturn(saveSwitchesDeferred.promise);
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
            $rootScope.$digest();

            expect(PaneSwitchesCtrl.saveInProgress).toBe(false);
        });

        it('clears the saveInProgress flag on error', function () {
            PaneSwitchesCtrl.saveInProgress = true;

            PaneSwitchesCtrl.save();
            saveSwitchesDeferred.reject();
            $rootScope.$digest();

            expect(PaneSwitchesCtrl.saveInProgress).toBe(false);
        });

        it('clears the modified flag on success', function () {
            PaneSwitchesCtrl.modified = true;

            PaneSwitchesCtrl.save();
            saveSwitchesDeferred.resolve();
            $rootScope.$digest();

            expect(PaneSwitchesCtrl.modified).toBe(false);
        });

        it('clears the modified flag on error', function () {
            PaneSwitchesCtrl.modified = true;

            PaneSwitchesCtrl.save();
            saveSwitchesDeferred.reject();
            $rootScope.$digest();

            expect(PaneSwitchesCtrl.modified).toBe(false);
        });

        it('invokes article service\'s saveSwitches() method ' +
            'with correct parameters',
            function () {
                PaneSwitchesCtrl.switches = [
                    {name: 'switch_1', text: 'First Switch'},
                    {name: 'switch_2', text: 'Second Switch'}
                ];

                PaneSwitchesCtrl.save();

                expect(
                    PaneSwitchesCtrl.article.saveSwitches
                ).toHaveBeenCalledWith(['switch_1', 'switch_2']);
            }
        );
    });
});
