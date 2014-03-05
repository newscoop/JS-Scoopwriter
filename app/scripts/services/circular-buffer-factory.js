'use strict';

angular.module('authoringEnvironmentApp')
    .service('circularBufferFactory', function circularBufferFactory() {
        this.create = function(opt) {
            if (!('size' in opt)) {
                throw Error('a circular buffer needs an integer size option');
            }
            return {
                opt: opt,
                arr: [],
                used: function() {
                    return this.arr.length;
                },
                push: function(element) {
                    if (this.used() >= this.opt.size) {
                        this.arr.shift();
                    };
                    this.arr.push(element);
                },
                dump: function() {
                    return angular.copy(this.arr);
                }
            };
        };
    });
