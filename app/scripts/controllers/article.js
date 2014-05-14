'use strict';
angular.module('authoringEnvironmentApp').controller('ArticleCtrl', [
    '$scope',
    '$location',
    'article',
    'articleType',
    'panes',
    'configuration',
    'mode',
    'platform',
    'circularBufferFactory',
    '$log',
    function ($scope, $location, article, articleType, panes, configuration, mode, platform, circularBufferFactory, $log) {
        var search = $location.search();
        var n = search.article_number;
        var l = search.language;
        article.init({
            articleId: n,
            language: l
        });
        $scope.mode = mode;
        $scope.status = 'Initialising';
        $scope.history = circularBufferFactory.create({ size: 5 });
        $scope.articleService = article;
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
            function snippetDivsToComments(text) {
                if (text === null) {return text;}
                                                            // the extra backward slash (\) is because of Javascript being picky
                var snippetRegex  = '<div';                 // exact match
                snippetRegex     += '\\s';                  // single whitespace
                snippetRegex     += 'class="snippet"';      // exact match
                snippetRegex     += '\\s';                  // single whitespace
                snippetRegex     += 'data-snippet-id="';    // exact match
                snippetRegex     += '([\\d]+)';             // capture group 1, match 1 or more digits (\d)
                snippetRegex     += '"';                    // exact match
                                                            // OPTIONAL for align only
                snippetRegex     += '(?:';                  // start of non-capture group
                snippetRegex     += '\\s';                  // single whitespace
                snippetRegex     += 'data-snippet-align="'; // exact match
                snippetRegex     += '([^"]+)';              // capture group 2, match 1 or more characters (^) not equal to "
                snippetRegex     += '"';                    // exact match
                snippetRegex     += ')?';                   // end of non-capture group
                                                            // END OPTIONAL
                snippetRegex     += '><\/div>';             // exact match
                var snippetPattern = new RegExp(snippetRegex, 'ig');
                return text.replace(snippetPattern, function(whole, ID, align) {
                    var output = '';
                    if (ID !== undefined) {
                        output += '<!-- Snippet '+parseInt(ID);
                        if (align !== undefined) {
                            output += ' align="'+align+'"';
                        }
                        output += ' -->';
                    }

                    return output;
                });
            }
            for (var key in $scope.article.fields) {
                if($scope.article.fields.hasOwnProperty(key)) {
                    $scope.article.fields[key] = snippetDivsToComments($scope.article.fields[key]);
                }
            }
            article.resource.save({
                articleId: n,
                language: l
            }, $scope.article, function () {
                $scope.setModified(false);
            }, function () {
                $scope.status = 'Error saving';
            });
        };
        $scope.$watch('article', $scope.watchCallback, true);
        $scope.$watch('articleService.modified', function (newValue) {
            if (newValue) {
                $scope.status = 'Modified';
            } else {
                $scope.status = 'Saved';
            }
        });
        article.promise.then(function (article) {
            // Convert the Snippet comments into divs so that Aloha can process them
            function snippetCommentsToDivs(text) {
                if (text === null) {return text;}
                                                // the extra backward slash (\) is because of Javascript being picky
                var snippetRegex  = '<!--';     // exact match
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
                        output += '<div class="snippet" data-snippet-id="'+parseInt(ID)+'"';
                        if (align !== undefined) {
                            output += ' data-snippet-align="'+align+'"';
                        }
                        output += '></div>';
                    }

                    return output;
                });
            }
            $scope.article = article;
            for (var key in article.fields) {
                if(article.fields.hasOwnProperty(key)) {
                    article.fields[key] = snippetCommentsToDivs(article.fields[key]);
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