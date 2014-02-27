'use strict';

angular.module('authoringEnvironmentApp')
    .service('imageUploading', function imageUploading() {
        var files = null;
        this.init = function(newFiles) {
            files = [];
            for(var i=0; i<newFiles.length; i++) {
                files.push(newFiles.item(i));
            }
        };
        this.get = function() {
            return files;
        };
    });
