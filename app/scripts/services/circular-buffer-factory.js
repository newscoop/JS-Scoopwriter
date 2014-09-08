'use strict';

/**
* AngularJS Service for creating intances of circular buffer.
*
* @class circularBufferFactory
*/
angular.module('authoringEnvironmentApp').service('circularBufferFactory',
    function circularBufferFactory() {
        /**
            * Creates a new circular buffer instance.
            *
            * @method create
            * @param opt {Object} New buffer instance configuration options.
            *   @param opt.size {Number} Size of the buffer.
            * @return {Object} New circular buffer instance.
            */
        this.create = function (opt) {
            if (!('size' in opt)) {
                throw new Error(
                        'a circular buffer needs an integer size option');
            }
            return {
                opt: opt,
                arr: [],
                used: function () {
                    return this.arr.length;
                },
                push: function (element) {
                    if (this.used() >= this.opt.size) {
                        this.arr.shift();
                    }
                    this.arr.push(element);
                },
                dump: function () {
                    return angular.copy(this.arr);
                },
                prev: function (optionalCount) {
                    var count = optionalCount || 1;
                    var intCount = parseInt(count, 10);
                    if (intCount < 1) {
                        throw new Error(
                                intCount +
                                ' is not a valid value for the `prev` ' +
                                'function, check the tests or the code');
                    }
                    var index = this.arr.length - intCount;
                    var positiveIndex = index >= 0 ? index : 0;
                    return this.arr[positiveIndex];
                }
            };
        };
    }
);
