'use strict';

angular.module('authoringEnvironmentApp')
    .factory('configuration', function () {
        return {
            image: {
                width: {
                    small: '20%',
                    medium: '50%',
                    big: '100%'
                },
                float: 'none'
            }
        };
    });
