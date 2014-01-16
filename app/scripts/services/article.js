'use strict';

angular.module('authoringEnvironmentApp')
  .service('article', function article($resource, endpoint) {

    var langMap = {
        1: ['English', 'en'],
        2: ['Romanian', 'ro'],
        5: ['German', 'de'],
        7: ['Croatian', 'hr'],
        9: ['Portuguese Portugal', 'pt'],
        10: ['Serbian Cyrillic', 'sr'],
        11: ['Serbian Latin', 'sh'],
        12: ['French', 'fr'],
        13: ['Spanish', 'es'],
        15: ['Russian', 'ru'],
        16: ['Chinese Simplified', 'zh'],
        17: ['Arabic', 'ar'],
        18: ['Swedish', 'sv'],
        19: ['Korean', 'ko'],
        20: ['Dutch', 'nl'],
        22: ['Belarus', 'be'],
        23: ['Georgian', 'ka'],
        24: ['Chinese Traditional', 'zh_TW'],
        25: ['Polish', 'pl'],
        26: ['Greek', 'el'],
        27: ['Hebrew', 'he'],
        28: ['Bangla', 'bn'],
        29: ['Czech', 'cs'],
        30: ['Italian', 'it'],
        31: ['Portuguese Brazil', 'pt_BR'],
        32: ['Albanian', 'sq'],
        33: ['Turkish', 'tr'],
        34: ['Ukrainian', 'uk'],
        35: ['English Britain', 'en_GB'],
        36: ['Kurdish', 'ku'],
        37: ['German Austria', 'de_AT']
    };

    // AngularJS will instantiate a singleton by calling "new" on this function
    return $resource(
      endpoint + '/api/articles/:articleId?language=:language',
      {},
      {
        query: {
          method: 'GET',
          params: {articleId: '', language: 'en'},
          isArray: true
        }
    });
  });
