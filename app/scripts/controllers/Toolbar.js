'use strict';

angular.module('authoringEnvironmentApp').controller('ToolbarCtrl', [
    '$scope',
    '$rootScope',
    '$filter',
    '$timeout',
    function ($scope, $rootScope, $filter, $timeout) {
        var updateScope;

        $scope.stylers = [
            {
                element: 'p',
                name: 'Normal Text'
            },
            {
                element: 'h1',
                name: 'Heading 1'
            },
            {
                element: 'h2',
                name: 'Heading 2'
            },
            {
                element: 'h3',
                name: 'Heading 3'
            },
            {
                element: 'h4',
                name: 'Heading 4'
            },
            {
                element: 'h5',
                name: 'Heading 5'
            },
            {
                element: 'blockquote',
                name: 'Blockquote'
            },
            {
                element: 'pre',
                name: 'Preformatted'
            }
        ];

        $scope.active = $filter('filter')(
            $scope.stylers,
            {element: 'p'},
            true
        )[0].name;

        updateScope = function () {
            var commandValue = Aloha.queryCommandValue('formatBlock'),
                filtered;

            if (commandValue.toString().length > 0) {
                filtered = $filter('filter')(
                    $scope.stylers, {element: commandValue}, true
                );
                if (filtered.length > 0) {
                    // We need to trigger a $digest cycle here, but sometimes
                    // one is already in progress and thus we cannot simply
                    // call $scope.$apply(). With $timeout, hovever, we
                    // achieve the same and the change of the active styler
                    // is immediately reflected in the UI (page).
                    $timeout(function () {
                        $scope.active = filtered[0].name;
                    });
                }
            } else {
                // Aloha events are a little slow so
                // we have to wrap this check in a timeout
                $timeout(function () {
                    if (Aloha.blockquoteFound) {
                        $scope.active = 'Blockquote';
                    } else {
                        $scope.active = 'Normal Text';
                    }
                }, 30);
            }
        };

        $rootScope.$on('texteditor-selection-changed', function () {
            updateScope();
        });

        $rootScope.$on('texteditor-command-executed', function () {
            updateScope();
        });
    }
]);
