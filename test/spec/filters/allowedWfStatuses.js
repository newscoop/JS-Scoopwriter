'use strict';

/**
* Module with tests for the allowedWfStatuses filter.
*
* @module allowedWfStatuses filter tests
*/

describe('Filter: allowedWfStatuses', function () {

    var Article,
        filter,
        statuses;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function ($filter, _Article_) {
        filter = $filter('allowedWfStatuses');
        Article = _Article_;

        statuses = [
            {value: Article.wfStatus.NEW, text: 'New'},
            {value: Article.wfStatus.SUBMITTED, name: 'Submitted'},
            {value: Article.wfStatus.PUBLISHED, name: 'Published'},
            {
                value: Article.wfStatus.PUBLISHED_W_ISS,
                name: 'Published with issue'
            }
        ];
    }));

    it('filters out "Published w/ issue" status if the article is published',
        function () {
            var expected = statuses.slice(0, 3),
                filteredStatuses;

            filteredStatuses = filter(
                statuses,
                Article.wfStatus.PUBLISHED,
                Article.issueWfStatus.NOT_PUBLISHED
            );
            expect(filteredStatuses).toEqual(expected);
        }
    );

    it('filters out "Published w/ issue" status if the article\'s issue' +
       'is published',
        function () {
            var expected = statuses.slice(0, 3),
                filteredStatuses;

            filteredStatuses = filter(
                statuses,
                Article.wfStatus.NEW,
                Article.issueWfStatus.PUBLISHED
            );
            expect(filteredStatuses).toEqual(expected);
        }
    );

    it('does not filter anything if article and its issue are both' +
       'not published',
        function () {
            var expected = statuses,
                filteredStatuses;

            filteredStatuses = filter(
                statuses,
                Article.wfStatus.SUBMITTED,
                Article.issueWfStatus.NOT_PUBLISHED
            );
            expect(filteredStatuses).toEqual(expected);
        }
    );

});
