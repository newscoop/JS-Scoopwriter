'use strict';

/**
* AngularJS Filter for filtering out youtube video id
* and outputing its thumbnail.
*
* @class youtubeThumbnail
*/
angular.module('authoringEnvironmentApp').filter('youtubeThumbnail', [
    function () {
        // regex for getting youtube video id
		var youtubeRegExp = new RegExp(
			/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
		);

        return function (input) {
			var match = input.match(youtubeRegExp);

            if (match) {
                return '//img.youtube.com/vi/' + match[2] + '/default.jpg';
            }
        };
    }
]);
