'use strict';

angular.module('authoringEnvironmentApp')
  .service('nestedSort', ['$log', function NestedSort($log) {
      this.sort = function(arr) {
          var levels = [];
          var currentLevel = 0;
          var isOnCurrentLevel = function(element) {
              return element.thread_level == currentLevel;
          };
          var found = arr.filter(isOnCurrentLevel);
          while(found.length > 0) {
              levels.push(found);
              currentLevel++;
              found = arr.filter(isOnCurrentLevel);
          }

          /* support map for accessing the comments in the tree by id,
           * and for navigating child relations. a comment will appear
           * twice here, once on the top level of the map, and once
           * within the `childs` array of the parent comment */
          var map = {
              root: {
                  childs: []
              }
          };
          /* navigate the levels and populate the map. since we are
           * going by levels, all the parents should already be
           * there when a child is inserted */
          levels.forEach(function(level) {
              level.forEach(function(comment) {
                  var copy = angular.copy(comment);
                  copy.childs = [];
                  if (copy.thread_level == 0) {
                      copy.parent = "root";
                  }
                  map[copy.id] = copy;
                  if ('parent' in copy) {
                      if (copy.parent in map) {
                          map[copy.parent].childs.push(copy);
                      } else {
                          $log.debug('error, comment', copy, 'has parent', copy.parent, 'which is not available to us');
                      }
                  } else {
                      $log.debug('error, comment', copy, 'is not first level but it has no parent');
                  }
              });
          });

          /* recursively navigate the map from the root, sort the
           * childs, and assign positions */
          var position = 0;
          function assignPosition (copiedComment) {
              function getDate (child) {
                  return new Date(child.created);
              }
              var sortedChilds = _.sortBy(copiedComment.childs, getDate);
              sortedChilds.forEach(function(child) {
                  child.nestedPosition = position;
                  position++;
                  assignPosition(child);
              });
          };
          assignPosition(map.root);
          
          /* navigate the original array, and copy the positions from the map */
          arr.forEach(function(comment) {
              if (comment.id in map) {
                  comment.nestedPosition = map[comment.id].nestedPosition;
              } else {
                  $log.error('comment', comment, 'is not in the nested sorting map', map);
              }
          });
      };
  }]);
