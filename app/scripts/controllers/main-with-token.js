'use strict';

angular.module('authoringEnvironmentApp').config(
    function (TokenProvider) {
        TokenProvider.extendConfig({
            clientId: '14_7lu4iulnlr0gg0gwcwowkkcko48000k84sokgwcg44s4oks0g',
            redirectUri: 'http://localhost:9000/#/callback',
            authorizationEndpoint: Routing.generate(
                'fos_oauth_server_authorize', {}, true
            ),
            verifyFunc: ''
        });
    }
).controller('MainWithTokenCtrl', [
    '$scope',
    '$window',
    'mode',
    'Token',
    function ($scope, $window, mode, Token) {
        var extraParams;

        if (Token.get() === undefined) {
            $scope.auth = false;
            extraParams = $scope.askApproval ? {approval_prompt: 'force'} : {};
            Token.getTokenByPopup(extraParams)
            .then(function(params) {
                // Success getting token from popup.
                $scope.accessToken = params.access_token;
                $scope.expiresIn = params.expires_in;

                Token.set(params.access_token);
                $window.sessionStorage.token = Token.get();
                $scope.auth = true;
            }, function() {
                // Failure getting token from popup.
                alert('Failed to get token from popup.');
            });
        } else {
            $window.sessionStorage.token = Token.get();
            $scope.auth = true;
        }

        $scope.$on('$viewContentLoaded', function () {
            jQuery('#cs-specific').prependTo('.main-background-container');
        });
        $scope.mode = mode;
    }
]);
