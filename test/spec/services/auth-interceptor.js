'use strict';

/**
* Module with tests for the authInterceptor service.
*
* @module authInterceptor service tests
*/

describe('Service: AuthInterceptor', function () {

    var authInterceptor,
        $window;

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_authInterceptor_, _$window_) {
        authInterceptor = _authInterceptor_;
        $window = _$window_;
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
                $window.sessionStorage.token = undefined;

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
                $window.sessionStorage.token = 'abcd1234';

                returned = authInterceptor.request(config);
                expect(returned.headers.Authorization).toEqual(
                    'Bearer abcd1234');
            }
        );
    });

});
