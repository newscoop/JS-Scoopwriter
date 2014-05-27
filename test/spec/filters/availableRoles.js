'use strict';

/**
* Module with tests for the availableRoles filter.
*
* @module availableRoles filter tests
*/

describe('Filter: availableRoles', function () {

    var availableRoles,
        roles;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function ($filter) {
        availableRoles = $filter('availableRoles');

        roles = [
            {id: 1, name: 'Writer'},
            {id: 2, name: 'Editor'},
            {id: 4, name: 'Photographer'},
            {id: 9, name: 'Programmer'},
            {id: 13, name: 'Lector'},
        ];
    }));

    it('does not filter anything if author is not given', function () {
        var authorList,
            filteredRoles;

        authorList = [
            {id:40, articleRole: {id: 4}},
            {id:10, articleRole: {id: 1}},
            {id:10, articleRole: {id: 2}},
            {id:90, articleRole: {id: 9}},
        ];

        filteredRoles = availableRoles(roles, null, authorList);

        expect(filteredRoles).toEqual(roles);
    });

    it('filters out all roles already assigned to author', function () {
        var author,
            authorList,
            filteredRoles;

        author = {id:10, articleRole: {id: 456}};

        authorList = [
            {id:40, articleRole: {id: 4}},
            {id:10, articleRole: {id: 2}},
            {id:10, articleRole: {id: 4}},
            {id:10, articleRole: {id: 13}},
            {id:90, articleRole: {id: 9}},
        ];

        filteredRoles = availableRoles(roles, author, authorList);

        expect(filteredRoles).toEqual([
            {id: 1, name: 'Writer'}, {id: 9, name: 'Programmer'}
        ]);
    });

    it('does *not* filter out current role of the given author instance',
        function () {
            var author,
                authorList,
                filteredRoles;

            authorList = [
                {id:40, articleRole: {id: 4}},
                {id:10, articleRole: {id: 2}},
                {id:10, articleRole: {id: 4}},
                {id:10, articleRole: {id: 13}},
                {id:90, articleRole: {id: 9}},
            ];

            author = authorList[1];

            filteredRoles = availableRoles(roles, author, authorList);

            expect(filteredRoles).toEqual([
                {id: 1, name: 'Writer'},
                {id: 2, name: 'Editor'},
                {id: 9, name: 'Programmer'}
            ]);
        }
    );

});
