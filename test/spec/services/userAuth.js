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
            $window.sessionStorage.setItem('token', 'someToken');
            expect(userAuth.token()).toEqual('someToken');
        });
    });


    describe('isAuthenticated() method', function () {
        it('returns true if there is a token in sessionStorage', function () {
            $window.sessionStorage.setItem('token', 'someToken');
            expect(userAuth.isAuthenticated()).toBe(true);
        });

        it('returns false if there is no token in sessionStorage',
            function () {
                $window.sessionStorage.removeItem('token');
                expect(userAuth.isAuthenticated()).toBe(false);
            }
        );
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
                modalResult.resolve('newToken');
                 $rootScope.$digest();

                expect(onSuccessSpy).toHaveBeenCalledWith('newToken');
            });

            it('stores new token into session storage', function () {
                $window.sessionStorage.token = 'existingToken';

                userAuth.newTokenByLoginModal();
                modalResult.resolve('newToken');
                 $rootScope.$digest();

                expect($window.sessionStorage.token).toEqual('newToken');
            });

            it('displays a toast with info message', function () {
                userAuth.newTokenByLoginModal();
                modalResult.resolve('newToken');
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
            $rootScope;

        beforeEach(inject(function ($modal,$q, _$rootScope_) {
            var ModalCtrl;

            $rootScope = _$rootScope_;

            // return a fake modal template
            $httpBackend.whenGET(/.+\.html/).respond(200, '<div></div>');

            spyOn($modal, 'open').andCallThrough();
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

            ctrl = new ModalCtrl(fakeModalInstance);
        }));

        describe('iframeLoadedHandler() method', function () {
            it('closes the modal, providing the new token', function () {
                var location = {
                    hash: '#token_type=bearer' +
                        '&access_token=xYz123' +
                        '&expires_in=3600'
                };
                ctrl.iframeLoadedHandler(location);
                expect(fakeModalInstance.close).toHaveBeenCalledWith('xYz123');
            });

            it('keeps the modal open locations\'s hash part does not exist',
                function () {
                    var location = {
                        hash: undefined
                    };
                    ctrl.iframeLoadedHandler(location);
                    expect(fakeModalInstance.close).not.toHaveBeenCalled();
                }
            );

            it('keeps the modal open if token is not found in locations\'s' +
                'hash part',
                function () {
                    var location = {
                        hash: '#login_failed=true&retry'
                    };
                    ctrl.iframeLoadedHandler(location);
                    expect(fakeModalInstance.close).not.toHaveBeenCalled();
                }
            );
        });
    });
});
