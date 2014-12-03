'use strict';

/**
* Module with tests for the authInterceptor service.
*
* @module authInterceptor service tests
*/

describe('Service: authInterceptor', function () {

    var authInterceptor,
        fakeHttp,
        fakeUserAuth;

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // mock some services service
    beforeEach(module(function ($provide) {
        fakeUserAuth = {
            token: jasmine.createSpy(),
            newTokenByLoginModal: jasmine.createSpy()
        };
        $provide.value('userAuth', fakeUserAuth);

        fakeHttp = jasmine.createSpy();
        $provide.value('$http', fakeHttp);
    }));

    beforeEach(inject(function (_authInterceptor_) {
        authInterceptor = _authInterceptor_;
    }));

    describe('request interceptor', function () {
        it('implements request() method', function () {
            expect(typeof authInterceptor.request).toBe('function');
        });

        it('does not modify non-API requests', function () {
            var config,
                returned;
            config = {
                url: 'http://foo.com/bar',
                headers: {}
            };
            returned = authInterceptor.request(config);
            expect(returned).toEqual(config);
        });

        it('does not modify API requests if session does not contain ' +
           'authorization token',
            function () {
                var config,
                    returned;

                config = {
                    url: 'http://backend.com/content-api/articles/8/en'
                };
                fakeUserAuth.token.andReturn(undefined);

                returned = authInterceptor.request(config);
                expect(returned).toEqual(config);
            }
        );

        it('sets authorization header for API requests if session ' +
           'contains authorization token',
            function () {
                var config,
                    returned;

                config = {
                    url: 'http://backend.com/content-api/articles/8/en',
                    headers: {}
                };
                fakeUserAuth.token.andReturn('abcd1234');

                returned = authInterceptor.request(config);
                expect(returned.headers.Authorization).toEqual(
                    'Bearer abcd1234');
            }
        );
    });


    describe('response error interceptor', function () {
        var httpDelay,
            loginModalResult,
            responseObj,
            $rootScope;

        beforeEach(inject(function ($q, _$rootScope_) {
            var httpErrorHandler,
                httpSuccessHandler;

            $rootScope = _$rootScope_;

            responseObj = {
                status: 0,
                statusText: '',
                config: {
                    method: 'POST',
                    url: 'http://www.api.com/createItem'
                }
            };

            loginModalResult = $q.defer();
            fakeUserAuth.newTokenByLoginModal.andReturn(
                loginModalResult.promise
            );

            httpDelay = $q.defer();
            fakeHttp.andReturn(httpDelay.promise);
        }));

        it('implements responseError() method', function () {
            expect(typeof authInterceptor.responseError).toBe('function');
        });

        it('forwards all non-auth errors without trying to solve them',
            function () {
                var promise,
                    onErrorSpy = jasmine.createSpy();

                responseObj.status = 404;
                responseObj.MARKER = 'foo';  // to recognize the object

                promise = authInterceptor.responseError(responseObj);
                promise.catch(onErrorSpy);
                $rootScope.$digest();

                expect(onErrorSpy).toHaveBeenCalledWith(responseObj);
                expect(fakeHttp).not.toHaveBeenCalled();
                expect(
                    fakeUserAuth.newTokenByLoginModal
                ).not.toHaveBeenCalled();
            }
        );

        it('forwards retried requests\'s failure without trying to solve it',
            function () {
                var promise,
                    onErrorSpy = jasmine.createSpy();

                responseObj.status = 401;
                responseObj.config.IS_RETRY = true;

                promise = authInterceptor.responseError(responseObj);
                promise.catch(onErrorSpy);
                $rootScope.$digest();

                expect(onErrorSpy).toHaveBeenCalledWith(responseObj);
                expect(fakeHttp).not.toHaveBeenCalled();
                expect(
                    fakeUserAuth.newTokenByLoginModal
                ).not.toHaveBeenCalled();
            }
        );

        describe('handling authentication errors', function () {

            it('displays a login modal', function () {
                responseObj.status = 401;
                authInterceptor.responseError(responseObj);
                expect(fakeUserAuth.newTokenByLoginModal).toHaveBeenCalled();
            });

            it('recognizes auth. error by an error message', function () {
                responseObj.status = 500;
                responseObj.statusText = 'OAuth2 authentication required';;
                authInterceptor.responseError(responseObj);
                expect(fakeUserAuth.newTokenByLoginModal).toHaveBeenCalled();
            });

            describe('logging-in through a modal fails', function () {
                it ('resolves the failed request as erroneous', function() {
                    var promise,
                        onErrorSpy = jasmine.createSpy();

                    responseObj.status = 401;
                    responseObj.MARKER = 'foo'; // to recognize the object
                    promise = authInterceptor.responseError(responseObj);
                    promise.catch(onErrorSpy);

                    loginModalResult.reject();
                    $rootScope.$digest();

                    expect(onErrorSpy).toHaveBeenCalledWith(responseObj);
                });
            });

            describe('logging-in through a modal succeeds', function () {
                it ('repeats the failed request and marks it', function () {
                    var expectedRetryConfig;

                    responseObj.status = 401;
                    expectedRetryConfig = angular.copy(responseObj.config);
                    expectedRetryConfig.IS_RETRY = true;

                    authInterceptor.responseError(responseObj);
                    loginModalResult.resolve();
                    $rootScope.$digest();

                    expect(fakeHttp).toHaveBeenCalledWith(expectedRetryConfig);
                });

                it ('resolves the error if the retried request succeeds ' +
                    '(with IS_RETRY flag removed)',
                    function () {
                        var expectedPromiseData,
                            newResponse,
                            onSuccessSpy = jasmine.createSpy(),
                            promise;

                        responseObj.status = 401;
                        responseObj.MARKER = 'foo'; // to recognize the object

                        newResponse = {
                            status: 201,
                            statusText: 'Created',
                            config: angular.copy(responseObj.config)
                        };
                        newResponse.config.IS_RETRY = true;

                        promise = authInterceptor.responseError(responseObj);
                        promise.then(onSuccessSpy);
                        loginModalResult.resolve();
                        httpDelay.resolve(newResponse);
                        $rootScope.$digest();

                        expectedPromiseData = angular.copy(newResponse);
                        delete expectedPromiseData.config.IS_RETRY;
                        expect(onSuccessSpy).toHaveBeenCalledWith(
                            expectedPromiseData);
                    }
                );

                it ('forwards the error if the retried request fails',
                    function () {
                        var onErrorSpy = jasmine.createSpy(),
                            promise;

                        responseObj.status = 401;
                        responseObj.MARKER = 'foo'; // to recognize the object

                        promise = authInterceptor.responseError(responseObj);
                        promise.catch(onErrorSpy);
                        loginModalResult.resolve();
                        httpDelay.reject();
                        $rootScope.$digest();

                        expect(onErrorSpy).toHaveBeenCalledWith(responseObj);
                    }
                );
            });
        });

    });  // end describe response error interceptor

});
