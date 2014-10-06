'use strict';

/**
* Module with tests for the NcImage factory.
*
* @module NcImage factory tests
*/

describe('Factory: NcImage', function () {

    var NcImage,
        imgData,
        $httpBackend;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_NcImage_, _$httpBackend_) {
        NcImage = _NcImage_;
        $httpBackend = _$httpBackend_;
    }));


    describe('constructor', function () {
        it('initializes instance\'s fields with provided values', function () {
            var data,
                instance;

            data = {
                id: 42,
                basename: 'img.jpg', thumbnailPath: 'img_thumb.jpg',
                description: 'foo bar',
                width: 100, height: 150,
                photographer: 'John Doe',
                photographerUrl: 'http://johndoe.com/'
            };
            instance = new NcImage(data);

            expect(instance instanceof NcImage).toBe(true);
            Object.keys(data).forEach(function (key) {
                expect(instance[key]).toEqual(data[key]);
            });
        });

        it('sets all instance attributes to undefined if data not provided',
            function () {
                var instance,
                    keys;

                keys = [
                    'id', 'basename', 'thumbnailPath', 'description',
                    'width', 'height', 'photographer', 'photographerUrl'
                ];

                instance = new NcImage();

                keys.forEach(function (key) {
                    expect(instance.hasOwnProperty(key)).toBe(true);
                    expect(instance[key]).toBeUndefined();
                })
            }
        );

        it('does *not* initialize the instance with unknown data keys',
            function () {
                var data,
                    instance;

                data = {
                    id: 42,
                    irrelevantValue: -123.007
                };
                instance = new NcImage(data);

                expect(instance.irrelevantValue).toBeUndefined();
            }
        );

        it('converts width and height values to integers', function () {
                var data,
                    instance;

                data = {
                    width: '25',
                    height: '75'
                };
                instance = new NcImage(data);

                expect(instance.width).toBe(25);
                expect(instance.height).toBe(75);
            }
        );
    });

    describe('getById() method', function () {
        var url;

        beforeEach(function () {
            imgData = {id:42};
            url = Routing.generate(
                'newscoop_gimme_images_getimage', {number: 42}, true
            );
            $httpBackend.expectGET(url).respond(200, JSON.stringify(imgData));
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            NcImage.getById(42);
        });

        it('resolves given promise on successful server response',
            function () {
                var expectedArg,
                    spyHelper = {
                        onSuccess: jasmine.createSpy()
                    };

                NcImage.getById(42)
                    .then(spyHelper.onSuccess);
                $httpBackend.flush(1);

                expect(spyHelper.onSuccess).toHaveBeenCalled();
                expectedArg = spyHelper.onSuccess.mostRecentCall.args[0];
                expect(expectedArg instanceof NcImage).toBe(true);
                expect(expectedArg.id).toEqual(42);
            }
        );

        it('rejects given promise on server error response', function () {
            var expectedArg,
                spyHelper = {
                    errorCallback: jasmine.createSpy()
                };

            $httpBackend.resetExpectations();
            $httpBackend.expectGET(url).respond(500, 'Error :(');

            NcImage.getById(42)
                .catch(spyHelper.errorCallback);
            $httpBackend.flush(1);

            expect(spyHelper.errorCallback).toHaveBeenCalledWith('Error :(');
        });
    });

    describe('updateDescription() method', function () {
        var image,
            requestData,
            url;

        beforeEach(function () {
            image = new NcImage();
            image.id = 5;
            image.description = 'foo';

            requestData = {
                number: 5,
                image: {
                    description: 'bar'
                }
            };

            url = Routing.generate(
                'newscoop_gimme_images_updateimage', {number: 5}, true
            );
            $httpBackend.expectPATCH(url, requestData).respond(200);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('returns a promise', inject(function ($q) {
            var deferred = $q.defer(),
                promise;
            promise = image.updateDescription('bar');
            expect(promise instanceof deferred.promise.constructor).toBe(true);
        }));

        it('sends a correct request to API', function () {
            image.updateDescription('bar');
        });

        it('resolves given promise on successful server response',
            function () {
                var spyHelper = {
                        onSuccess: jasmine.createSpy()
                    };

                image.updateDescription('bar').then(spyHelper.onSuccess);
                $httpBackend.flush(1);

                expect(spyHelper.onSuccess).toHaveBeenCalled();
            }
        );

        it('updates instance\'s description attribute on success',
            function () {
                image.description = 'foo';
                image.updateDescription('bar');
                $httpBackend.flush(1);
                expect(image.description).toEqual('bar');
            }
        );

        it('rejects given promise on server error response', function () {
            var expectedArg,
                spyHelper = {
                    errorCallback: jasmine.createSpy()
                };

            $httpBackend.resetExpectations();
            $httpBackend.expectPATCH(
                url, requestData
            ).respond(500, 'Error :(');

            image.updateDescription('bar').catch(spyHelper.errorCallback);
            $httpBackend.flush(1);

            expect(spyHelper.errorCallback).toHaveBeenCalledWith('Error :(');
        });
    });

});
