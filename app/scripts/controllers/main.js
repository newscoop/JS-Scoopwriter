'use strict';
angular.module('authoringEnvironmentApp').
    config(function(TokenProvider) {
        TokenProvider.extendConfig({
            //clientId: '7_6203opwgvx8g4skgskksgkws8cs44ks8s4cw4sc8cg4wsk8c40',
            clientId: '14_7lu4iulnlr0gg0gwcwowkkcko48000k84sokgwcg44s4oks0g',
            redirectUri: 'http://localhost:9000/#/callback/',
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
        console.log('sup');
    $scope.accessToken = Token.get();
    console.log($scope.accessToken);
    
    if ($scope.accessToken === undefined) {
      var extraParams = $scope.askApproval ? {approval_prompt: 'force'} : {};
      Token.getTokenByPopup(extraParams)
        .then(function(params) {
          // Success getting token from popup.

          // Verify the token before setting it, to avoid the confused deputy problem.
          //Token.verifyAsync(params.access_token).
          //  then(function(data) {
              $rootScope.$apply(function() {
                $scope.accessToken = params.access_token;
                $scope.expiresIn = params.expires_in;

                Token.set(params.access_token);
              });
          //  }, function() {
          //    alert("Failed to verify token.")
          //  });

        }, function() {
          // Failure getting token from popup.
          alert("Failed to get token from popup.");
        });
    };



        //if ('token' in $window.sessionStorage) {
            $scope.$on('$viewContentLoaded', function () {
                jQuery('#cs-specific').prependTo('.main-background-container');
            });
            $scope.mode = mode;
        //} else {
            
            //var pars = {
            //        client_id: configuration.auth.client_id,
            //        redirect_uri: configuration.auth.redirect_uri,
            //        response_type: 'token'
            //    };
            //var arr = [];
            //var e = encodeURIComponent;
            //angular.forEach(pars, function (value, key) {
            //    arr.push(e(key) + '=' + e(value));
            //});
            //var href = configuration.auth.server + arr.join('&');
            //$window.location.href = href;
        //}
    }
]);
