'use strict';
angular.module('authoringEnvironmentApp').controller('ArticleCtrl', [
    '$scope',
    'article',
    'articleType',
    'panes',
    'configuration',
    'mode',
    'platform',
    'circularBufferFactory',
    '$log',
    '$routeParams',
    function ($scope, article, articleType, panes, configuration, mode, platform, circularBufferFactory, $log, $routeParams) {

        article.init({
            articleId: $routeParams.article,
            language: $routeParams.language
        });

        $scope.mode = mode;
        $scope.status = 'Initializing';
        $scope.history = circularBufferFactory.create({ size: 5 });
        $scope.articleService = article;

        // list of possible article workflow status options to choose from
        $scope.workflowStatuses = [
            {
                value: article.wfStatus.NEW,
                text: 'New'
            },
            {
                value: article.wfStatus.SUBMITTED,
                text: 'Submitted'
            },
            {
                value: article.wfStatus.PUBLISHED,
                text: 'Published'
            },
            {
                value: article.wfStatus.PUBLISHED_W_ISS,
                text: 'Published with issue'
            }
        ];

        $scope.wfStatus = $scope.workflowStatuses[0];  // default value is new
        $scope.changingWfStatus = false;

        $scope.articleService.promise.then(function (article) {
            var statusObj = _.find(
                $scope.workflowStatuses, {value: article.status}
            );
            $scope.wfStatus = statusObj;
        });

        /**
        * Changes article's workflow status. It also disables the corresponding
        * dropdown menu until the API request is completed.
        *
        * @method setWorkflowStatus
        * @param newStatus {String} new article workflow status
        */
        $scope.setWorkflowStatus = function (newStatus) {

            $scope.changingWfStatus = true;

            article.setWorkflowStatus(newStatus)
                .then(function () {
                    var statusObj = _.find(
                        $scope.workflowStatuses, {value: newStatus}
                    );
                    $scope.wfStatus = statusObj;
                })
                .finally(function () {
                    $scope.changingWfStatus = false;
                });
        };

        $scope.watchCallback = function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) {
                // initialisation
                $scope.modified = false;
                $scope.status = 'Just downloaded';
            } else {
                if (newValue && oldValue) {
                    // modified
                    $scope.history.push(oldValue);
                    $scope.setModified(true);
                } else {
                    // used also for testing
                    if (!oldValue) {
                        $log.debug('the old article value is', oldValue);
                    }
                    if (!newValue) {
                        $log.debug('the new article value is', newValue);
                    }
                }
            }
        };
        // wrapper just for testability purposes
        $scope.setModified = function (value) {
            article.modified = value;
        };

        $scope.save = function () {
            // converts images' and snippets' HTML in text to special
            // placeholder comments
            function divsToCommentsFor(type, text) {
                if ((type !== 'snippet' && type !== 'image') || text === null) {
                    return text;
                }
                var sep = {snippet: '--', image: '**'};
                var content = $('<div/>').html(text);

                content.contents().filter('div.'+type)
                    .replaceWith(function() {
                        var contents = '<'+sep[type] +' '+ type[0].toUpperCase() + type.slice(1) +' '+parseInt($(this).data('id'));
                        $.each( $(this).data(),function(name, value) {
                            if (name !== 'id') {
                                contents += ' '+name+'="'+value+'"';
                            }
                        });
                        return contents += ' '+sep[type]+'>';
                    });
                return content.html()
                    .replace(/\&lt\;\*\*/g,'<**')   // replace &lt;** with <**
                    .replace(/\*\*\&gt\;/g, '**>')  // replace **&gt; with **>
                    .replace(/\&lt\;\-\-/g,'<--')   // replace &lt;-- with <--
                    .replace(/\-\-\&gt\;/g, '-->'); // replace --&gt; with -->
            }

            var postData = angular.copy($scope.article);

            // serialize objects (images, snippets) in all article fields
            for (var key in postData.fields) {
                if (postData.fields.hasOwnProperty(key)) {
                    postData.fields[key] = divsToCommentsFor(
                        'snippet',
                        divsToCommentsFor('image', postData.fields[key])
                    );
                }
            }

            article.resource.save({
                articleId: $routeParams.article,
                language: $routeParams.language
            }, postData, function () {
                $scope.setModified(false);
            }, function () {
                $scope.status = 'Error saving';
            });
        };  // end $scope.save function

        $scope.$watch('article', $scope.watchCallback, true);
        $scope.$watch('articleService.modified', function (newValue) {
            if (newValue) {
                $scope.status = 'Modified';
            } else {
                $scope.status = 'Saved';
            }
        });

        $scope.articleService.promise.then(function (article) {

            // Convert the Snippet comments into divs so that Aloha can process them
            function snippetCommentsToDivs(text) {
                if (text === null) {
                    return text;
                }
                                                // the extra backward slash (\) is because of Javascript being picky
                var snippetRegex  = '<--';     // exact match
                snippetRegex     += '\\s';      // single whitespace
                snippetRegex     += 'Snippet';  // exact match
                snippetRegex     += '\\s';      // single whitespace
                snippetRegex     += '([\\d]+)'; // capture group 1, match 1 or more digits (\d)
                                                // OPTIONAL for align only
                snippetRegex     += '(?:';      // start of non-capture group
                snippetRegex     += '\\s';      // single whitespace
                snippetRegex     += 'align="';  // exact match
                snippetRegex     += '([^"]+)';  // capture group 2, match 1 or more characters (^) not equal to "
                snippetRegex     += '"';        // exact match
                snippetRegex     += ')?';       // end of non-capture group
                                                // END OPTIONAL
                snippetRegex     += '\\s';      // single whitespace
                snippetRegex     += '-->';      // exact match
                var snippetPattern = new RegExp(snippetRegex, 'ig');
                return text.replace(snippetPattern, function(whole, ID, align) {
                    var output = '';
                    if (ID !== undefined) {
                        output += '<div class="snippet" data-id="'+parseInt(ID)+'"';
                        if (align !== undefined) {
                            output += ' data-align="'+align+'"';
                        }
                        output += '></div>';
                    }

                    return output;
                });
            }
            // Convert the Image comments into divs for Aloha
            // example: <** Image 1234 align=left size=small **>
            function imageCommentsToDivs(text) {
                if (text === null) {return text;}
                                                               // the extra backward slash (\) is because of Javascript being picky
                var imageReg  = '<';                          // exact match
                imageReg     += '\\*\\*';                      // exact match on **
                imageReg     += '[\\s]*';                      // match whitespace 0 to unlimited
                imageReg     += 'Image';                       // exact match
                imageReg     += '[\\s]+';                      // match whitespace 1 to unlimited
                imageReg     += '([\\d]+)';                    // capture digit 1 to unlimited
                imageReg     += '(';                           // capture group 2
                imageReg     +=     '(';                       // capture group 3, 0 to unlimited
                imageReg     +=         '[\\s]+';              // match whitespace 1 to unlimited
                imageReg     +=         '(align|alt|sub';      // alternating capture group
                imageReg     +=         '|width|height|ratio';
                imageReg     +=         '|\\w+)';              // or any word longer then 1 to unlimited, end of alternating
                imageReg     +=         '\\s*';                // match whitespace 0 to unlimited
                imageReg     +=         '=';                   // exact match
                imageReg     +=         '\\s*';                // match whitespace 0 to unlimited
                imageReg     +=         '(';                   // capture group 4
                imageReg     +=             '"[^"]*"';         // capture anything except ", 0 to unlimited characters
                imageReg     +=             '|[^\\s]*';        // capture anything except whitespace, 0 to unlimited
                imageReg     +=         ')';                   // end capture group 4
                imageReg     +=     ')*';                      // end capture group 3, 0 to unlimited
                imageReg     += ')';                           // end capture group 2
                imageReg     += '[\\s]*';                      // match whitespace 0 to unlimited
                imageReg     += '\\*\\*';                      // exact match on **
                imageReg     += '>';                           // exact match
                var imagePattern = new RegExp(imageReg, 'ig');

                var converted = text.replace(
                    imagePattern,
                    function(whole, imageId, imageAttributes) {
                        var imageDiv = '<div class="image" dropped-image ' +
                            'data-id="' + imageId + '"';
                        var tmpElement = document.createElement('div');
                        tmpElement.innerHTML = '<div '+imageAttributes+'></div>';
                        var attributes = tmpElement.childNodes[0].attributes;

                        for (var i = 0; i < attributes.length; i++) {
                            imageDiv += ' data-' + attributes[i].name +
                                '="'+attributes[i].value + '"';
                        }

                        imageDiv += '></div>';

                        return imageDiv;
                    }
                );
                return converted;
            }  // end function imageCommentsToDivs

            $scope.article = article;

            for (var key in article.fields) {
                if(article.fields.hasOwnProperty(key)) {
                    article.fields[key] = imageCommentsToDivs(
                        snippetCommentsToDivs(article.fields[key])
                    );
                }
            }
            if (typeof $scope.type === 'undefined') {
                $scope.type = articleType.get({ type: article.type }, function () {
                    var additional = configuration.additionalFields[article.type];
                    additional.forEach(function (field) {
                        $scope.type.fields.push(field);
                    });
                });
            }
        });

        $scope.panes = panes.query();
        $scope.platform = platform;
        // used to filter
        $scope.editable = function (field) {
            var known = [
                    'date',
                    'dateline',
                    'main_image',
                    'lede',
                    'body',
                    'title'
                ];
            if (known.indexOf(field.name) === -1) {
                return false;
            } else {
                return true;
            }
        };
    }
]);
