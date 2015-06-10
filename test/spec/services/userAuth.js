/* global CSClientId */
'use strict';


/**
* Module with tests for the userAuth factory.
*
* @module userAuth factory tests
*/

describe('Factory: userAuth', function () {

    var userAuth,
        $httpBackend,
        $window;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_userAuth_, _$httpBackend_, _$window_) {
        userAuth = _userAuth_;
        $httpBackend = _$httpBackend_;
        $window = _$window_;
    }));


    describe('token() method', function () {
        it('returns the current token in sessionStorage', function () {
            $window.sessionStorage.setItem(AES_SETTINGS.auth.tokenKeyName, 'someToken');
            expect(userAuth.token()).toEqual('someToken');
        });
    });


    describe('isAuthenticated() method', function () {
        it('returns true if there is a token in sessionStorage', function () {
            $window.sessionStorage.setItem(AES_SETTINGS.auth.tokenKeyName, 'someToken');
            expect(userAuth.isAuthenticated()).toBe(true);
        });

        it('returns false if there is no token in sessionStorage',
            function () {
                $window.sessionStorage.removeItem(AES_SETTINGS.auth.tokenKeyName);
                expect(userAuth.isAuthenticated()).toBe(false);
            }
        );
    });


    describe('setToken() method', function () {
        it('sets given token in sessionStorage', function () {
            $window.sessionStorage.setItem(AES_SETTINGS.auth.tokenKeyName, 'someToken');
            expect(userAuth.setToken('someToken')).toEqual(null);
            expect(userAuth.token()).toEqual('someToken');
        });
    });


    describe('obtainToken() method', function () {
        var url,
            response;

        beforeEach(function () {
            response = {
                access_token: 'MGYyOWNiYTU1YjhjNTAz',
                expires_in: '3600',
                token_type: 'bearer',
                refresh_token: 'NjBiMzgxZGQ0ZTY4ZmFjMTFl'
            };

            url = Routing.generate(
                'newscoop_gimme_users_getuseraccesstoken',
                {clientId: AES_SETTINGS.auth.client_id},
                true
            );

            $httpBackend.expectGET(url, function () {
                return {IS_RETRY: true, IS_AUTHORIZATION_HEADER: true}
            }).respond(200, response);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            userAuth.obtainToken();
        });

        it('returns an object which is populated on successful response',
            function () {
                var expectedArg,
                    spyHelper = {
                        onSuccess: jasmine.createSpy()
                    };

                userAuth.obtainToken()
                    .then(spyHelper.onSuccess);
                $httpBackend.flush(1);

                expect(spyHelper.onSuccess).toHaveBeenCalled();
                expectedArg = spyHelper.onSuccess.mostRecentCall.args[0];
                expect(expectedArg instanceof Object).toBe(true);
                expect(expectedArg).toEqual(response);
        });

        it('resolves given promise on successful server response',
            function () {
                var expectedArg,
                    spyHelper = {
                        onSuccess: jasmine.createSpy()
                    };

                userAuth.obtainToken()
                    .then(spyHelper.onSuccess);
                $httpBackend.flush(1);

                expect(spyHelper.onSuccess).toHaveBeenCalled();
                expectedArg = spyHelper.onSuccess.mostRecentCall.args[0];
                expect(expectedArg instanceof Object).toBe(true);
                expect(expectedArg.access_token).toEqual('MGYyOWNiYTU1YjhjNTAz');
                expect(userAuth.token()).toEqual('MGYyOWNiYTU1YjhjNTAz');
            }
        );

        it('rejects given promise on server error response', function () {
            var expectedArg,
                spyHelper = {
                    errorCallback: jasmine.createSpy()
                };

            $httpBackend.resetExpectations();
            $httpBackend.expectGET(url)
                .respond(401, 'Error :(');

            userAuth.obtainToken()
                .catch(spyHelper.errorCallback);
            $httpBackend.flush(1);

            expect(spyHelper.errorCallback).toHaveBeenCalledWith('Error :(');
        });
    });


    describe('newTokenByLoginModal() method', function () {
        var modalResult,
            toaster,
            $modal,
            $rootScope;

        beforeEach(inject(function ($q,  _$modal_, _$rootScope_, _toaster_) {
            $modal = _$modal_;
            $rootScope= _$rootScope_;
            toaster = _toaster_;

            modalResult = $q.defer();
            spyOn($modal, 'open').andReturn({result: modalResult.promise});

            spyOn(toaster, 'add');
        }));

        it('opens a modal dialog', function () {
            userAuth.newTokenByLoginModal();
            expect($modal.open).toHaveBeenCalled();
        });

        describe('when login through the modal succeeds', function () {
            it('resolves given promise with a new token', function () {
                var promise,
                    onSuccessSpy = jasmine.createSpy();

                promise = userAuth.newTokenByLoginModal();
                promise.then(onSuccessSpy);
                modalResult.resolve();
                 $rootScope.$digest();

                expect(onSuccessSpy).toHaveBeenCalled();
            });

            it('displays a toast with info message', function () {
                userAuth.newTokenByLoginModal();
                modalResult.resolve();
                 $rootScope.$digest();

                expect(toaster.add).toHaveBeenCalledWith({
                    type: 'sf-info',
                    message: 'Successfully refreshed authentication token.'
                });
            });
        });

        describe('when login through the modal fails', function () {
            it('rejects given promise with an error message', function () {
                var promise,
                    onErrorSpy = jasmine.createSpy();

                promise = userAuth.newTokenByLoginModal();
                promise.catch(onErrorSpy);
                modalResult.reject('No login');
                 $rootScope.$digest();

                expect(onErrorSpy).toHaveBeenCalledWith('No login');
            });

            it('displays a toast with error message', function () {
                userAuth.newTokenByLoginModal();
                modalResult.reject('No login');
                 $rootScope.$digest();

                expect(toaster.add).toHaveBeenCalledWith({
                    type: 'sf-error',
                    message: 'Failed to refresh authentication token.'
                });
            });
        });

    });


    describe('login modal\'s controller', function () {
        var ctrl,
            fakeModalInstance,
            $window;

        beforeEach(inject(function ($modal, _$window_) {
            var ModalCtrl;

            $window = _$window_;

            // return a fake modal template
            $httpBackend.whenGET(/.+\.html/).respond(200, '<div></div>');

            spyOn($modal, 'open').andCallThrough();
            angular.element($window).trigger('storage');
            userAuth.newTokenByLoginModal();

            // XXX: this is not ideal, since obtaining a reference to the
            // modal controller depends on the newTokenByLoginModal() method
            // to provide a correct controller parameterto the $modal.open()
            // ... but on the other hand, is there a good alternative to
            // obtainining the controller reference that way?
            ModalCtrl = $modal.open.mostRecentCall.args[0].controller;

            fakeModalInstance = {
                close: jasmine.createSpy()
            };

            ctrl = new ModalCtrl(fakeModalInstance, $window);

        }));

        it('should have been triggered on session storage change', function() {
            $window.sessionStorage.setItem(AES_SETTINGS.auth.tokenKeyName, 'someToken');
            expect($window.sessionStorage.getItem(AES_SETTINGS.auth.tokenKeyName)).toEqual('someToken');
        });

        it('should do nothing on session storage change when it was not modified', function() {
            $window.sessionStorage.removeItem(AES_SETTINGS.auth.tokenKeyName);
            expect($window.sessionStorage.getItem(AES_SETTINGS.auth.tokenKeyName)).toBe(null);
        });
    });
});
