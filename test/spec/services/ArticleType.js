'use strict';

/**
* Module with tests for the ArticleType factory.
*
* @module ArticleType factory tests
*/

describe('Factory: ArticleType', function () {

    var ArticleType,
        $httpBackend;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_ArticleType_, _$httpBackend_) {
        ArticleType = _ArticleType_;
        $httpBackend = _$httpBackend_;
    }));


    describe('createFromApiData() method', function () {
        var data;

        beforeEach(function () {
            data = {
                name: 'news',
                fields: [{
                    name: 'body',
                    type: 'body',
                    fieldWeight: 10,
                    isHidden: 0
                }, {
                    name: 'teaser',
                    type: 'longtext',
                    fieldWeight: 8,
                    isHidden: 0
                }]
            };
        });

        it('creates ArticleType instance from data object', function () {
            var instance = ArticleType.createFromApiData(data);
            expect(instance instanceof ArticleType).toBe(true);
        });

        it('correctly initializes the object returned', function () {
            var instance = ArticleType.createFromApiData(data);

            expect(instance.name).toEqual('news');
            expect(instance.fields.length).toBe(2);

            expect(instance.fields[0]).toEqual({
                    name: 'body',
                    type: 'body',
                    fieldWeight: 10,
                    isHidden: 0
            });
            expect(instance.fields[1]).toEqual({
                    name: 'teaser',
                    type: 'longtext',
                    fieldWeight: 8,
                    isHidden: 0
            });
        });
    });

    describe('getByName() method', function () {
        var response,
            url;

        beforeEach(function () {
            response = {
                name: 'news',
                fields: [{
                    name: 'field_1',
                    fieldWeight: 8
                }, {
                    name: 'field_2',
                    fieldWeight: 3
                }]
            };

            url = Routing.generate(
                'newscoop_gimme_articletypes_getarticletype',
                {name: 'news'}, true
            );
            $httpBackend.expectGET(url).respond(200, response);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            ArticleType.getByName('news');
        });

        it('resolves given promise with found ArticleType on success',
            function () {
                var onSuccess = jasmine.createSpy();

                spyOn(ArticleType, 'createFromApiData')
                    .andReturn({foo: 'bar'});

                ArticleType.getByName('news').then(onSuccess);
                $httpBackend.flush(1);

                expect(onSuccess).toHaveBeenCalledWith({foo: 'bar'});
        });

        it('rejects given promise with server error message on failure',
            function () {
                var result,
                    errorSpy = jasmine.createSpy();

                $httpBackend.resetExpectations();
                $httpBackend.expectGET(url).respond(500, 'Server error');

                ArticleType.getByName('news').catch(errorSpy);
                $httpBackend.flush(1);

                expect(errorSpy).toHaveBeenCalledWith('Server error');
            }
        );
    });  // end describe getByName()

});
