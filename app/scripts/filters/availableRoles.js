'use strict';

/**
* AngularJS Filter for filtering out roles that a particular author already has
* assigned on the given article and thus these roles cannot be selected again
* for the said author.
*
* @class availableRoles
*/
angular.module('authoringEnvironmentApp').filter('availableRoles', [
    function () {

        /**
        * From a given list of roles it filters out all those roles that are
        * already assigned to the given author on a specific article and
        * thus cannot be assigned again to the same author (on that article).
        *
        * @method availableRoles
        * @param roleList {Array} list of all roles (unfiltered) that can be
        *     assigned to article author
        * @param author {Object} author for which to filter the role list
        * @param authorList {Array} list of all current article authors
        *   (with their roles) on a specific article
        * @return {Array} list of filtered roles
        */
        return function (roleList, author, authorList) {
            var filteredRoles = [];

            if (!author) {
                // no author selected (e.g. in live search widget), thus
                // all roles are available
                return roleList;
            }

            roleList.forEach(function (roleItem) {
                var roleTaken = false;  // role already "taken" by the author?

                authorList.forEach(function (authorItem) {
                    // don't filter out the current role of the given
                    // author's object instance...
                    if (authorItem === author) {
                        return;
                    }

                    // ...but do filter out a role if it is assigned to
                    // *another* object instance representing the same author
                    if (authorItem.id === author.id &&
                        authorItem.articleRole.id === roleItem.id
                    ) {
                        roleTaken = true;
                        return;
                    }
                });

                if (!roleTaken) {
                    filteredRoles.push(roleItem);
                }
            });

            return filteredRoles;
        };
    }
]);
