'use strict';

/**
* Module with tests for the userAuth factory.
*
* @module userAuth factory tests
*/

describe('Factory: userAuth', function () {

    var responseData,
        userAuth,
        $httpBackend;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_userAuth_, _$httpBackend_) {
        userAuth = _userAuth_;
        $httpBackend = _$httpBackend_;
        responseData = {
            access_token: 'fOoBaR123',
            expires_in: 1800,
            token_type: 'blahblah',
            refresh_token: 'abc123'
        };
    }));


    describe('createFromApiData() method', function () {
        it('creates userAuth instance from data object', function () {
            var instance = userAuth.createFromApiData(responseData);

            expect(instance instanceof userAuth).toEqual(true);
            expect(instance.access_token).toBe('fOoBaR123');
            expect(instance.expires_in).toBe(1800);
            expect(instance.token_type).toBe('blahblah');
            expect(instance.refresh_token).toBe('abc123');
        });
    });

    describe('getToken() method', function () {
        var url;

        beforeEach(function () {
            url = Routing.generate(
                'newscoop_gimme_users_getuseraccesstoken',
                {clientId: '123_qwertz'}, true
            );

            $httpBackend.expectGET(url)
                .respond(200, responseData);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            userAuth.getToken('123_qwertz');
        });

        it('resolves given promise with userAuth instance on successful ' +
            'server response',
            function () {
                var expected,
                    promise,
                    spy = jasmine.createSpy();

                promise = userAuth.getToken('123_qwertz');
                promise.then(spy);
                $httpBackend.flush(1);

                expected = new userAuth();
                expected.access_token = responseData.access_token;
                expected.expires_in = responseData.expires_in;
                expected.token_type = responseData.token_type;
                expected.refresh_token = responseData.refresh_token;

                expect(spy).toHaveBeenCalledWith(expected);
        });

        it('rejects given promise with server error message on ' +
            'server\'s error response',
            function () {
                var promise,
                    spy = jasmine.createSpy();

                $httpBackend.resetExpectations();
                $httpBackend.expectGET(url).respond(500, 'Server error');

                promise = userAuth.getToken('123_qwertz');
                promise.catch(function (reason) {
                    spy(reason);
                });
                $httpBackend.flush(1);

                expect(spy).toHaveBeenCalledWith('Server error');
            }
        );
    });

});
