'use strict';

/**
* AngularJS Service for creating intances of circular buffer.
*
* @class circularBufferFactory
*/
angular.module('authoringEnvironmentApp')
    .service('circularBufferFactory', function circularBufferFactory() {

        /**
        * Creates a new circular buffer instance.
        *
        * @method create
        * @param opt {Object} New buffer instance configuration options.
        *   @param opt.size {Number} Size of the buffer.
        * @return {Object} New circular buffer instance.
        */
        this.create = function(opt) {
            if (!('size' in opt)) {
                throw Error('a circular buffer needs an integer size option');
            }

            return {
                /**
                * Options used to initialize the buffer.
                * @property opt
                * @type Object
                */
                opt: opt,

                /**
                * Array holding the items currently in buffer.
                * @property arr
                * @type Array
                */
                arr: [],

                /**
                * Returns the number of items the buffer currently contains.
                * @method used
                * @return {Number} The current number of items in the buffer.
                */
                used: function() {
                    return this.arr.length;
                },

                /**
                * Adds a new element to the buffer. If the buffer is full, it
                * also removes the first element from it in order to make room
                * for the new element.
                * @method push
                * @param element {any} Element to add to the buffer.
                */
                push: function(element) {
                    if (this.used() >= this.opt.size) {
                        this.arr.shift();
                    };
                    this.arr.push(element);
                },

                /**
                * Returns a deep copy of the current buffer contents.
                * @method dump
                * @return {Array} Deep copy of the buffer.
                */
                dump: function() {
                    return angular.copy(this.arr);
                }
            };
        };
    });
