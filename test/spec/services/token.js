'use strict';

describe('Service: Token', function () {

    var mock = {
        access_token: "MmQxODQ4NzQyYmEyZDA0ODE1MDA3ODIwMTUyMjgxOTcwZDhhOTNmYTcwYmFhYmE2YjFlYjk4ZmUxNjA3ZDRiNA",
        expires_in: 3600,
        token_type: "bearer",
        scope: null,
        refresh_token: "YmRjYmVmYzE4MzliOTAxZTQzMWY5ZmZjNGY2YjZkNjBiZDczMzg2NDllYjQ4MDVhYTQ0N2E4MzJjNWU5YjJjZQ"
    };

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var token, resource;
    beforeEach(inject(function (_token_, $httpBackend) {
        $httpBackend
            .expect('GET', 'http://tw-merge.lab.sourcefabric.org/oauth/v2/token?client_id=1_2gkjgb9tl0sgwow8w4ksg4ws4wkw8884c848kwgkw4k8gc4woc&client_secret=60mtm1heov8kwskss8gcg0cokwckkkk0cowocos4swc4g80s80&grant_type=client_credentials')
            .respond(mock);
        token = _token_;
        resource = token.get();
        $httpBackend.flush();
    }));

    it('gets the token', function () {
        expect(resource.access_token).toBe('MmQxODQ4NzQyYmEyZDA0ODE1MDA3ODIwMTUyMjgxOTcwZDhhOTNmYTcwYmFhYmE2YjFlYjk4ZmUxNjA3ZDRiNA');
    });
});
