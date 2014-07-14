'use strict';

describe('Controller: ArticleCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var ArticleCtrl,
    scope,
    $httpBackend,
    $timeout,
    log = {
        debug: jasmine.createSpy('log debug')
    },
    articleService,
    $rootScope,
    $controller;

    var article = {    "language":"en",    "fields":{        "highlight":"0",        "lede":"<p>BRUSSELS - Italian and Greek candidates nominated for President of the European Council\u00a0in secret ballot.<\/p>",        "body":"<p>It plu plia olda nula, lo ekoo interjekcio a\u016d. Iom inkluzive dividostreko sh, subtraho praanta\u016dhiera\u016d bio fo. San go povi triliono kunmetita, anstata\u016d supersigno mallongigita iom kz. Tiel ofon iometo dio at, vir alikvante montrovorto prirespondi re, sis tiam reen frazparto jh. Pov mi pobo infra alternativo, nenio geedzo alimaniere sor um.<\/p>\r\n<p>Tek in dekoj komplika kernovorto, dekuma disskribado je end. Vendo posttagmezo um esk, ki nedifina personalo, unt. Sen ki tiele aligi resti. Diesa resti alika\u016dze enz us, cii gardi duobla vi, ajna ceceo nelimigita oid no. Oho negi anta\u016dparto alternativdemando si, adjektivo multiplikite bv ism, ind jh prepozitivo anta\u016delemento. He ano orda nekutima, mil fi alia patro solstariva.<\/p>\r\n<p>Tia zepto rolvorteto du. Ar duo frota sepen dikfingro. Des vavo senforte ed. Mano halt' onklo sur nv, aliu help transigi ian o, amen multe kompreneble ena er. Nul tiuj fora nano jo.<\/p>\r\n<p>Kuo op negi posta. Kazablanko subpropozicio mal ne. End ad ekoo sori, in sor otek finitivo okulvitroj, egalo latina iom ge. Pra ho filo troa, mf esk apud aliel geedzo, fin duobla fratineto sekstiliono as. Lo devus video kelka mia, sia ed mili fini. Sin nula usono kunmeta\u0135o ik, cii op tiea post gibi, sob brosi substantiva is.<\/p>\r\n<p>Jam unun participo sh. Nea mo ioma identiga, mi edzo ekde frikativo dio. Cii milo tohuo iufoje tc, mo tet krom prezoinda tempopunkto, hago dank' esperantigita ok kie. Iufoje helpverbo ko mis, poa ci dura e\u0125o komparado. Pli persa deziri ju, falsa ekesti definitive jes aj. Tro iu hodia\u016da infinitivo, e eca malpli kernovorto.<\/p>\r\n<p>Ke ato armo postpriskribo. Mem al triliono frikativo miriametro, spite vortfarado fo iel. Oj iom ruli okej vatto. Jota tiama tagnokto nu ili. Nei kian spite ki, nenia reciprokeco ajn vo. Hot jena respondeci uj.<\/p>\r\n<div class=\"generic-embed\">\u00a0<\/div>\r\n<p>Fri go longa senobjekta postmorga\u016d, deci praanta\u016dhiera\u016d ina el, nea ve dato hekto. Ci speco anstata\u016di sat, ses mono literaturo ko. Per vi dume falsa fundamenta, amen siatempe kuo id. Pri vi e\u0125o fontoj frazparto. Kab'o difina la\u016dlonge ne a\u0125.<\/p>",        "printsection":"Sports",        "printstory":null,        "iPad_prominent":"0"    },    "authors":[        {            "name":"Test Persona",            "link":"http:\/\/tw-merge.lab.sourcefabric.org\/api\/author\/9"        },        {            "name":"Frank N. Stein",            "link":"http:\/\/tw-merge.lab.sourcefabric.org\/api\/author\/13"        }    ],    "number":"64",    "title":"European Council candidates set to be named",    "updated":"2013-12-17T14:31:14+0000",    "comments":"http:\/\/tw-merge.lab.sourcefabric.org\/api\/articles\/123\/en\/comments",    "type":"news",    "published":"2013-11-14T10:49:17+0000",    "topics":[        {            "id":10,            "title":"Cruise Night"        },        {            "id":10,            "title":"Crucero nocturno"        },        {            "id":11,            "title":"People In The News"        },        {            "id":11,            "title":"La gente en las noticias"        },        {            "id":29,            "title":"Milan Shows"        },        {            "id":29,            "title":"Muestra Mil\u00e1n"        }    ],    "slideshow":[        {            "id":5,            "title":"Berlin Zoo",            "itemsLink":"http:\/\/tw-merge.lab.sourcefabric.org\/api\/slideshows\/5"        }    ],    "renditions":[        {            "caption":"articlebig",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/600x400%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"sectionthumb",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/250x167%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"square",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/150x150%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"thumb",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/150x100%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"topfront",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/500x333%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"artikel",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/555x370%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"artikelnew",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/639x426%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"blogsidebar",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/300x150%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"dossierbild",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/980x306%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"dossierbildnew",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/990x330%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"dossierteaser",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/300x131%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"naviteaser",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/120x53%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"rubrikenseite",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/300x200%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        }    ],    "webcode":"cup6z",    "reads":"5"}
    var articleTypeNews = {    "name":"news",    "fields":[        {            "name":"body",            "type":"body",            "fieldWeight":3,            "isHidden":0,            "commentsEnabled":0,            "fieldTypeParam":"editor_size=750",            "isContentField":1        },        {            "name":"highlight",            "type":"switch",            "fieldWeight":1,            "isHidden":0,            "commentsEnabled":0,            "isContentField":0        },        {            "name":"iPad_prominent",            "type":"switch",            "fieldWeight":6,            "isHidden":0,            "commentsEnabled":0,            "isContentField":0        },        {            "name":"lede",            "type":"longtext",            "fieldWeight":2,            "isHidden":0,            "commentsEnabled":0,            "fieldTypeParam":"editor_size=250",            "isContentField":0        },        {            "name":"printsection",            "length":0,            "type":"text",            "fieldWeight":4,            "isHidden":0,            "commentsEnabled":0,            "isContentField":0        },        {            "name":"printstory",            "length":0,            "type":"text",            "fieldWeight":5,            "isHidden":0,            "commentsEnabled":0,            "isContentField":0        }    ]};
    // Initialize the controller and a mock scope
    beforeEach(inject(function (_$controller_, _$rootScope_, _$httpBackend_, _article_) {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        articleService = _article_;
        $controller = _$controller_;
        $httpBackend.expectGET(/\/content-api\/articles\/[\d]/).respond(article);
        $httpBackend.expectGET(/\/content-api\/articleTypes\/.*/).respond(articleTypeNews);
        ArticleCtrl = $controller('ArticleCtrl', {
            $scope: scope,
            $log: log,
            $routeParams: {
                'article': 123,
                'language': 'de'
            },
            article: articleService
        });
        spyOn(scope, 'setModified').andCallThrough();
        spyOn(scope, 'watchCallback').andCallThrough();
    }));
    it('is not requesting things we do not expect', function() {
        $httpBackend.verifyNoOutstandingRequest();
    });
    it('initialises', function () {
        expect(!!ArticleCtrl).toBe(true);
    });
    it('proxies platform', function() {
        expect(scope.platform).toBeDefined();
    });
    it('proxies panes', function() {
        expect(scope.panes).toBeDefined();
    });
    it('has no article', function() {
        expect(scope.article).toBeUndefined();
    });
    it('has empty history', function() {
        expect(scope.history.used()).toBe(0);
    });
    it('is not modified', function() {
        expect(scope.status).toBe('Initialising');
    });

    it('initializes article workflow status options in scope', function () {
        var expected = [
            {value: 'N', text: 'New'},
            {value: 'S', text: 'Submitted'},
            {value: 'Y', text: 'Published'},
            {value: 'M', text: 'Published with issue'}
        ];
        expect(scope.workflowStatuses).toEqual(expected);
    });

    it('sets the selected article workflow status option to NEW by default',
        function () {
            expect(scope.wfStatus).toEqual({value: 'N', text: 'New'});
        }
    );

    it('sets scope\'s changingWfStatus flag to false by default', function () {
        expect(scope.changingWfStatus).toBe(false);
    });

    it ('sets workflow status in scope to the actual article status ' +
        'when the article is retrieved',
        inject(function ($q) {
            var deferred = $q.defer();

            ArticleCtrl = $controller('ArticleCtrl', {
                $scope: scope,
                article: {
                    init: function () {},
                    promise: deferred.promise,
                    wfStatus: {}
                },
                articleType: {
                    get: function () {}
                }
            });

            scope.workflowStatuses = [
                {value: 'N', text: 'New'},
                {value: 'S', text: 'Submitted'},
                {value: 'Y', text: 'Published'},
                {value: 'M', text: 'Published with issue'}
            ];

            scope.wfStatus = {value: 'S', text: 'Submitted'};
            deferred.resolve({id: 123, status: 'M'});
            scope.$apply();

            expect(scope.wfStatus).toEqual(
                {value: 'M', text: 'Published with issue'});
        }
    ));


    describe('scope\'s setWorkflowStatus() method', function () {
        var deferredArticle,
            deferredStatus,
            $q;

        beforeEach(inject(function (_$q_) {
            $q = _$q_;
            deferredArticle = $q.defer();
            deferredStatus = $q.defer();

            ArticleCtrl = $controller('ArticleCtrl', {
                $scope: scope,
                article: {
                    init: function () {},
                    promise: deferredArticle.promise,
                    setWorkflowStatus: function () {
                        return deferredStatus.promise
                    },
                    wfStatus: {}
                }
            });

            scope.workflowStatuses = [
                {value: 'N', text: 'New'},
                {value: 'S', text: 'Submitted'},
                {value: 'Y', text: 'Published'},
                {value: 'M', text: 'Published with issue'}
            ];

            scope.wfStatus = {value: 'S', text: 'Submitted'};
        }));

        it('sets changingWfStatus flag before sending a request', function () {
            scope.changingWfStatus = false;
            scope.setWorkflowStatus('M');
            expect(scope.changingWfStatus).toBe(true);
        });

        it('clears changingWfStatus flag on success', function () {
            scope.setWorkflowStatus('M');
            scope.changingWfStatus = true;

            deferredStatus.resolve();
            scope.$apply();

            expect(scope.changingWfStatus).toBe(false);
        });

        it('clears changingWfStatus flag on error', function () {
            scope.setWorkflowStatus('M');
            scope.changingWfStatus = true;

            deferredStatus.reject('server timeout');
            scope.$apply();

            expect(scope.changingWfStatus).toBe(false);
        });

        it('updates workflow status in scope on success', function () {
            scope.setWorkflowStatus('M');

            deferredStatus.resolve();
            scope.$apply();

            expect(scope.wfStatus).toEqual(
                {value: 'M', text: 'Published with issue'});
        });
    });


    describe('backend answers', function() {
        beforeEach(function() {
            $httpBackend.flush();
        });
        afterEach(function() {
            $httpBackend.verifyNoOutstandingRequest();
        });
        it('proxies the article', function() {
            expect(scope.article).toBeDefined();
        });
        it('reacts well to weird events', function() {
            /* in the angular doc i found no mention of the previous
             * value being undefined during initialisation, but this
             * is what we get, so i added some checks for that */
            expect(log.debug.calls[0].args).toEqual([ 'the old article value is', undefined ]);
            expect(log.debug.calls[1].args).toEqual([ 'the old article value is', undefined ]);
        });
        it('changed the article once', function() {
            expect(scope.history.used()).toBe(0);
        });
        it('is not modified', function() {
            expect(scope.modified).toBe(false);
            expect(scope.status).toBe('Saved');
        });
        describe('with a changed field', function() {
            beforeEach(function() {
                scope.$apply(function() {
                    scope.article.fields.lede = 'changed';
                });
            });
            it('knows something changed', function() {
                expect(scope.setModified).toHaveBeenCalledWith(true);
                expect(scope.articleService.modified).toBe(true);
                expect(scope.status).toBe('Modified');
            });
            describe('save triggered', function() {
                beforeEach(function() {
                    $httpBackend
                        .expect('PATCH', rootURI + '/articles/123/de')
                        .respond({});
                    scope.save();
                });
                describe('response received', function() {
                    beforeEach(function() {
                        $httpBackend.flush();
                    });
                    it('sends the update request', function() {
                        $httpBackend.verifyNoOutstandingRequest();
                    });
                    it('does not feel different anymore', function() {
                        expect(scope.setModified).toHaveBeenCalledWith(false);
                        expect(scope.status).toBe('Saved');
                    });
                });
            });
            describe('save triggered with error response', function() {
                beforeEach(function() {
                    $httpBackend
                        .expect('PATCH', rootURI + '/articles/123/de')
                        .respond(500, 'error');
                    scope.save();
                });
                describe('response received', function() {
                    beforeEach(function() {
                        $httpBackend.flush();
                    });
                    it('sends the update request', function() {
                        $httpBackend.verifyNoOutstandingRequest();
                    });
                    it('tells the user', function() {
                        /* Attention: if you change this, change also the
                         * corresponding styling in the view */
                        expect(scope.status).toBe('Error saving');
                    });
                });
            });
        });
    });
    describe('initialised again on an already modified article', function() {
        beforeEach(function() {
            $httpBackend.flush(2);
            scope = $rootScope.$new();
            articleService.modified = true;
            $httpBackend
                .expectGET(rootURI + '/articleTypes/news')
                .respond({});
            ArticleCtrl = $controller('ArticleCtrl', {
                $scope: scope,
                $routeParams: {
                    'article': 123,
                    'language': 'de'
                }
            });
        });
        it('finds the article promise already resolved', function(done) {
            var spy = jasmine.createSpy('spy');
            articleService.promise.then(function() {
                spy();
            });
            $rootScope.$apply();
            expect(spy).toHaveBeenCalled();
        });
        it('gets the article', function() {
            $rootScope.$apply();
            expect(scope.article).toBeDefined();
        });
        it('finds a modified article', function() {
            $rootScope.$apply();
            expect(scope.articleService.modified).toBe(true);
        });
        it('is modified', function() {
            $rootScope.$apply();
            expect(scope.status).toBe('Modified');
        });
    });
    describe('initialised again on a saved article', function() {
        beforeEach(function() {
            $httpBackend.flush(2);
            scope = $rootScope.$new();
            articleService.modified = false;
            $httpBackend
                .expectGET(rootURI + '/articleTypes/news')
                .respond({});
            ArticleCtrl = $controller('ArticleCtrl', {
                $scope: scope,
                $routeParams: {
                    'article': 123,
                    'language': 'de'
                }
            });
        });
        it('is shows the correct status', function() {
            $rootScope.$apply();
            expect(scope.status).toBe('Saved');
        });
    });
});
