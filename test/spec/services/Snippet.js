'use strict';

/**
* Module with tests for the Snippet factory.
*
* @module Snippet factory tests
*/

describe('Factory: Snippet', function () {

    var Snippet,
        $httpBackend;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_Snippet_, _$httpBackend_) {
        Snippet = _Snippet_;
        $httpBackend = _$httpBackend_;
    }));

});
