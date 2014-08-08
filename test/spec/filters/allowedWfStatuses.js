'use strict';

/**
* Module with tests for the allowedWfStatuses filter.
*
* @module allowedWfStatuses filter tests
*/

describe('Filter: allowedWfStatuses', function () {

    var article,
        filter,
        statuses;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function ($filter, _article_) {
        filter = $filter('allowedWfStatuses');
        article = _article_;

        statuses = [
            {value: article.wfStatus.NEW, text: 'New'},
            {value: article.wfStatus.SUBMITTED, name: 'Submitted'},
            {value: article.wfStatus.PUBLISHED, name: 'Published'},
            {
                value: article.wfStatus.PUBLISHED_W_ISS,
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
                article.wfStatus.PUBLISHED,
                article.issueWfStatus.NOT_PUBLISHED
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
                article.wfStatus.NEW,
                article.issueWfStatus.PUBLISHED
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
                article.wfStatus.SUBMITTED,
                article.issueWfStatus.NOT_PUBLISHED
            );
            expect(filteredStatuses).toEqual(expected);
        }
    );

});
