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


    describe('obtainNewToken() method', function () {

        it('invokes correct API endpoint', function () {
            var url = Routing.generate(
                'newscoop_gimme_users_getuseraccesstoken',
                {clientId: CSClientId}, true
            );
            $httpBackend.expectGET(url).respond(200, {});
            userAuth.obtainNewToken();
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('adds a special market to request config if instructed to do so',
            inject(function ($http) {
                var callArgs;

                spyOn($http, 'get').andCallThrough();
                userAuth.obtainNewToken(true);

                callArgs = $http.get.mostRecentCall.args;
                expect(callArgs[1]._NEW_TOKEN_REQ_).toBe(true);
            })
        );

        describe('on success response',function () {
            var responseData,
                url;

            beforeEach(function () {
                url = Routing.generate(
                    'newscoop_gimme_users_getuseraccesstoken',
                    {clientId: CSClientId}, true
                );

                responseData = {
                    access_token: 'foo',
                    expires_in: 1800,
                    token_type: 'bar',
                    refresh_token: 'baz'
                };

                $httpBackend.whenGET(/.*/).respond(200, responseData);
            });

            it('stores new token into session storage', function () {
                $window.sessionStorage.setItem('token', 'foobar');
                responseData.access_token = 'newToken';

                userAuth.obtainNewToken();
                $httpBackend.flush(1);

                expect(
                    $window.sessionStorage.getItem('token')
                ).toEqual('newToken');
            });

            it('resolves given promise with obtained token', function () {
                var promise,
                    onSuccessSpy = jasmine.createSpy();

                responseData.access_token = 'someToken';

                promise = userAuth.obtainNewToken();
                promise.then(onSuccessSpy);
                $httpBackend.flush(1);

                expect(onSuccessSpy).toHaveBeenCalledWith('someToken');
            });
        });

        it('rejects given promise with server error message on failure',
            function () {
                var promise,
                    onErrorSpy = jasmine.createSpy();

                $httpBackend.whenGET(/.*/).respond(500, 'Some Error');

                promise = userAuth.obtainNewToken();
                promise.catch(onErrorSpy);
                $httpBackend.flush(1);

                expect(onErrorSpy).toHaveBeenCalledWith('Some Error');
            }
        );
    });


    describe('newTokenByLoginModal() method', function () {
        var getTokenDelay,
            modalResult,
            $modal,
            $rootScope;

        beforeEach(inject(function ($q,  _$modal_, _$rootScope_) {
            $modal = _$modal_;
            $rootScope= _$rootScope_;

            modalResult = $q.defer();
            spyOn($modal, 'open').andReturn({result: modalResult.promise});

            getTokenDelay= $q.defer();
            spyOn(userAuth, 'obtainNewToken').andReturn(
                getTokenDelay.promise);
        }));

        it('opens a modal dialog', function () {
            userAuth.newTokenByLoginModal();
            expect($modal.open).toHaveBeenCalled();
        });

        it('rejects given promise if dialog is closed without user logging in',
            function () {
                var promise,
                    onErrorSpy = jasmine.createSpy();

                promise = userAuth.newTokenByLoginModal();
                promise.catch(onErrorSpy);
                modalResult.reject('No login');
                 $rootScope.$digest();

                expect(onErrorSpy).toHaveBeenCalledWith('No login');
            }
        );

        it('tries to retrieve a new token if user logs through the modal',
            function () {
                userAuth.newTokenByLoginModal();
                modalResult.resolve();
                 $rootScope.$digest();

                expect(userAuth.obtainNewToken).toHaveBeenCalled();
            }
        );

        it('resolves given promise with a new token if user logs in and ' +
            'a new token is successfully obtained',
            function () {
                var promise,
                    onSuccessSpy = jasmine.createSpy();

                promise = userAuth.newTokenByLoginModal();
                promise.then(onSuccessSpy);
                modalResult.resolve();
                getTokenDelay.resolve('newToken')
                 $rootScope.$digest();

                expect(onSuccessSpy).toHaveBeenCalledWith('newToken');
            }
        );

        it('rejects given promise with a new token if user logs in but ' +
            'obtaining a new token fails',
            function () {
                var promise,
                    onErrorSpy = jasmine.createSpy();

                promise = userAuth.newTokenByLoginModal();
                promise.catch(onErrorSpy);
                modalResult.resolve();
                getTokenDelay.reject('some error')
                 $rootScope.$digest();

                expect(onErrorSpy).toHaveBeenCalledWith('some error');
            }
        );
    });


    describe('loginUser() method', function () {
        var $httpBackend;

        beforeEach(inject(function (_$httpBackend_) {
            $httpBackend = _$httpBackend_;

            // var url = Routing.generate(
            //     'newscoop_gimme_users_getuseraccesstoken',
            //     {clientId: CSClientId}, true
            // );
            // $httpBackend.expectGET(url).respond(200, {});
            // userAuth.obtainNewToken();
            // $httpBackend.verifyNoOutstandingExpectation();
        }));

        it('invokes correct API endpoint', function () {
            var url = Routing.generate(
                'newscoop_gimme_users_login',
                {username: 'user', password: 'pass'}, true
            );
            $httpBackend.expectPOST(url).respond(200, 'response');
            userAuth.loginUser('user', 'pass');
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('resolves given promise on success', function () {
            var promise,
                onSuccessSpy = jasmine.createSpy();

            $httpBackend.whenPOST(/.*/).respond(200, '');

            promise = userAuth.loginUser('user', 'pass');
            promise.then(onSuccessSpy);
            $httpBackend.flush(1);

            expect(onSuccessSpy).toHaveBeenCalled();
        });

        it('rejects given promise on failure', function () {
            var promise,
                onErrorSpy = jasmine.createSpy();

            $httpBackend.whenPOST(/.*/).respond(500, 'Some Error');

            promise = userAuth.loginUser('user', 'pass');
            promise.catch(onErrorSpy);
            $httpBackend.flush(1);

            expect(onErrorSpy).toHaveBeenCalled();
        });
    });


    describe('login modal\'s controller', function () {
        var ctrl,
            fakeModalInstance,
            fakeUserAuth,
            getUserDelay,
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

            getUserDelay = $q.defer();
            fakeUserAuth = {
                loginUser: jasmine.createSpy().andReturn(getUserDelay.promise)
            };

            ctrl = new ModalCtrl(fakeModalInstance, fakeUserAuth);
        }));

        it('initializes message to an empty string', function () {
            expect(ctrl.message).toEqual('');
        });

        it('initializes form data to empty values', function () {
            expect(ctrl.formData).toEqual({
                username: undefined,
                password: undefined
            });
        });

        describe('submit() method', function () {
            beforeEach(function () {
                fakeUserAuth.loginUser
            });

            it('changes message to inform the user that authentication ' +
                'is in progress',
                function () {
                    ctrl.submit();
                    expect(ctrl.message).toEqual('Authenticating...');
                }
            );

            it('closes the modal on successful login', function () {
                ctrl.submit();
                getUserDelay.resolve();
                $rootScope.$digest();
                expect(fakeModalInstance.close).toHaveBeenCalled();
            });

            it('clears the password on failed login', function () {
                ctrl.formData = {
                    password: 'secret'
                };

                ctrl.submit();
                getUserDelay.reject();
                $rootScope.$digest();

                expect(ctrl.formData.password).toEqual('');
            });

            it('sets the error message on failed login', function () {
                ctrl.submit();
                getUserDelay.reject();
                $rootScope.$digest();
                expect(ctrl.message).toEqual(
                    'Login failed, please check your username/password.');
            });
        });
    });
});
