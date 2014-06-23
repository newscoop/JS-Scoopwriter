'use strict';
angular.module('authoringEnvironmentApp').
config(function(TokenProvider) {
    TokenProvider.extendConfig({
        clientId: '14_7lu4iulnlr0gg0gwcwowkkcko48000k84sokgwcg44s4oks0g',
        redirectUri: 'http://localhost:9000/#/callback',
        authorizationEndpoint: 'http://newscoop.aes.sourcefabric.net/oauth/v2/auth',
        verifyFunc: ''
    });
}).

controller('MainCtrl', [
        '$scope',
        '$window',
        'mode',
        'configuration',
        'Token',
        function ($scope, $window, mode, configuration, Token) {
            if (Token.get() === undefined) {
                var extraParams = $scope.askApproval ? {approval_prompt: 'force'} : {};
                Token.getTokenByPopup(extraParams)
                .then(function(params) {
                    // Success getting token from popup.
                    $scope.accessToken = params.access_token;
                    $scope.expiresIn = params.expires_in;

                    Token.set(params.access_token);
                    $window.sessionStorage.token = Token.get();
                }, function() {
                    // Failure getting token from popup.
                    alert('Failed to get token from popup.');
                });
            } else {
                $window.sessionStorage.token = Token.get();
            }

            $scope.$on('$viewContentLoaded', function () {
                jQuery('#cs-specific').prependTo('.main-background-container');
            });
            $scope.mode = mode;
        }
    ]
);
