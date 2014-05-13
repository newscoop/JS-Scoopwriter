'use strict';

/**
* Module with tests for the articleAuthor service.
*
* @module articleAuthor service tests
*/

describe('Service: articleAuthor', function () {

    var service,
        $httpBackend;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (articleAuthor, _$httpBackend_) {
        service = articleAuthor;
        $httpBackend = _$httpBackend_;
    }));

    // TODO: getAll()

    // TODO: getRoleList()

    // TODO: createFromServerData()
});
