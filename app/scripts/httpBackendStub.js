(function(ng) {
	if (!document.URL.match(/\?nobackend$/)) {
		return; // do nothing special - this app is not going to use a stubbed backend
	}

	console.log('=== STUBBED BACKEND ===');

	initStubbedBackend();

	function initStubbedBackend() {
		ng.module('authoringEnvironmentApp')
			.config(['$provide', function($provide) {
				$provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
			}])
			.run(['$httpBackend', function($httpBackend) {
				// templates
			    $httpBackend.whenGET(/views\/.*/).passThrough();

			    // Article
			    article = {    "language":"en",    "fields":{        "highlight":"0",        "lede":"<p>BRUSSELS - Italian and Greek candidates nominated for President of the European Council\u00a0in secret ballot.<\/p>",        "body":"<p>It plu plia olda nula, lo ekoo interjekcio a\u016d. Iom inkluzive dividostreko sh, subtraho praanta\u016dhiera\u016d bio fo. San go povi triliono kunmetita, anstata\u016d supersigno mallongigita iom kz. Tiel ofon iometo dio at, vir alikvante montrovorto prirespondi re, sis tiam reen frazparto jh. Pov mi pobo infra alternativo, nenio geedzo alimaniere sor um.<\/p>\r\n<p>Tek in dekoj komplika kernovorto, dekuma disskribado je end. Vendo posttagmezo um esk, ki nedifina personalo, unt. Sen ki tiele aligi resti. Diesa resti alika\u016dze enz us, cii gardi duobla vi, ajna ceceo nelimigita oid no. Oho negi anta\u016dparto alternativdemando si, adjektivo multiplikite bv ism, ind jh prepozitivo anta\u016delemento. He ano orda nekutima, mil fi alia patro solstariva.<\/p>\r\n<p>Tia zepto rolvorteto du. Ar duo frota sepen dikfingro. Des vavo senforte ed. Mano halt' onklo sur nv, aliu help transigi ian o, amen multe kompreneble ena er. Nul tiuj fora nano jo.<\/p>\r\n<p>Kuo op negi posta. Kazablanko subpropozicio mal ne. End ad ekoo sori, in sor otek finitivo okulvitroj, egalo latina iom ge. Pra ho filo troa, mf esk apud aliel geedzo, fin duobla fratineto sekstiliono as. Lo devus video kelka mia, sia ed mili fini. Sin nula usono kunmeta\u0135o ik, cii op tiea post gibi, sob brosi substantiva is.<\/p>\r\n<p>Jam unun participo sh. Nea mo ioma identiga, mi edzo ekde frikativo dio. Cii milo tohuo iufoje tc, mo tet krom prezoinda tempopunkto, hago dank' esperantigita ok kie. Iufoje helpverbo ko mis, poa ci dura e\u0125o komparado. Pli persa deziri ju, falsa ekesti definitive jes aj. Tro iu hodia\u016da infinitivo, e eca malpli kernovorto.<\/p>\r\n<p>Ke ato armo postpriskribo. Mem al triliono frikativo miriametro, spite vortfarado fo iel. Oj iom ruli okej vatto. Jota tiama tagnokto nu ili. Nei kian spite ki, nenia reciprokeco ajn vo. Hot jena respondeci uj.<\/p>\r\n<div class=\"generic-embed\">\u00a0<\/div>\r\n<p>Fri go longa senobjekta postmorga\u016d, deci praanta\u016dhiera\u016d ina el, nea ve dato hekto. Ci speco anstata\u016di sat, ses mono literaturo ko. Per vi dume falsa fundamenta, amen siatempe kuo id. Pri vi e\u0125o fontoj frazparto. Kab'o difina la\u016dlonge ne a\u0125.<\/p>",        "printsection":"Sports",        "printstory":null,        "iPad_prominent":"0"    },    "authors":[        {            "name":"Test Persona",            "link":"http:\/\/tw-merge.lab.sourcefabric.org\/api\/author\/9"        },        {            "name":"Frank N. Stein",            "link":"http:\/\/tw-merge.lab.sourcefabric.org\/api\/author\/13"        }    ],    "number":"64",    "title":"European Council candidates set to be named",    "updated":"2013-12-17T14:31:14+0000",    "comments":"http:\/\/tw-merge.lab.sourcefabric.org\/api\/articles\/64\/en\/comments",    "type":"news",    "published":"2013-11-14T10:49:17+0000",    "topics":[        {            "id":10,            "title":"Cruise Night"        },        {            "id":10,            "title":"Crucero nocturno"        },        {            "id":11,            "title":"People In The News"        },        {            "id":11,            "title":"La gente en las noticias"        },        {            "id":29,            "title":"Milan Shows"        },        {            "id":29,            "title":"Muestra Mil\u00e1n"        }    ],    "slideshow":[        {            "id":5,            "title":"Berlin Zoo",            "itemsLink":"http:\/\/tw-merge.lab.sourcefabric.org\/api\/slideshows\/5"        }    ],    "renditions":[        {            "caption":"articlebig",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/600x400%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"sectionthumb",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/250x167%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"square",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/150x150%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"thumb",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/150x100%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"topfront",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/500x333%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"artikel",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/555x370%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"artikelnew",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/639x426%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"blogsidebar",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/300x150%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"dossierbild",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/980x306%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"dossierbildnew",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/990x330%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"dossierteaser",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/300x131%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"naviteaser",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/120x53%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        },        {            "caption":"rubrikenseite",            "type":"image",            "link":"tw-merge.lab.sourcefabric.org\/images\/cache\/300x200%2Ffit%2Fimages%257Ccms-image-000000099.jpg"        }    ],    "webcode":"cup6z",    "reads":"5"}
			    articleTypeNews = {    "name":"news",    "fields":[        {            "name":"body",            "type":"body",            "fieldWeight":3,            "isHidden":0,            "commentsEnabled":0,            "fieldTypeParam":"editor_size=750",            "isContentField":1        },        {            "name":"highlight",            "type":"switch",            "fieldWeight":1,            "isHidden":0,            "commentsEnabled":0,            "isContentField":0        },        {            "name":"iPad_prominent",            "type":"switch",            "fieldWeight":6,            "isHidden":0,            "commentsEnabled":0,            "isContentField":0        },        {            "name":"lede",            "type":"longtext",            "fieldWeight":2,            "isHidden":0,            "commentsEnabled":0,            "fieldTypeParam":"editor_size=250",            "isContentField":0        },        {            "name":"printsection",            "length":0,            "type":"text",            "fieldWeight":4,            "isHidden":0,            "commentsEnabled":0,            "isContentField":0        },        {            "name":"printstory",            "length":0,            "type":"text",            "fieldWeight":5,            "isHidden":0,            "commentsEnabled":0,            "isContentField":0        }    ]}

			    $httpBackend.whenGET(/\/api\/articles\/[\d]/).respond(article);
			    $httpBackend.whenGET(/\/api\/articleTypes\/.*/).respond(articleTypeNews);

			    // /Article

			    var snippetGenerator = function($id, $type) {
			    	return { 
			    		id: $id,
				    	"name": 'My '+$id+' '+$type,
				    	"template": $type,
				    	"content": {
				    		"code": '<div class="embed'+ $id +'">This is so cool, '+$type+'</div>'
				    	}
				    }
			    }

			    snippetsGeneric = {
			    	1: snippetGenerator(1, 'Generic'),
				    2: snippetGenerator(2, 'Generic'),
				    3: snippetGenerator(3, 'Generic'),
				    4: snippetGenerator(4, 'Generic')
			    }

			    snippetsTweet = {
			    	5: snippetGenerator(5, 'Tweet'),
				    6: snippetGenerator(6, 'Tweet'),
				    7: snippetGenerator(7, 'Tweet'),
				    8: snippetGenerator(8, 'Tweet')
				}

			    snippets = {
			    	1: snippetGenerator(1, 'Generic'),
				    2: snippetGenerator(2, 'Generic'),
				    3: snippetGenerator(3, 'Generic'),
				    4: snippetGenerator(4, 'Generic'),
			    	5: snippetGenerator(5, 'Tweet'),
				    6: snippetGenerator(6, 'Tweet'),
				    7: snippetGenerator(7, 'Tweet'),
				    8: snippetGenerator(8, 'Tweet')
			    }

			    snippetsForArticle = snippetsGeneric;

			    snippet = snippetGenerator(1, 'Generic');

			    snippetTemplate = {
			    	id: 1,
			    	"name": "Generic",
			    	"template": '%code%'
			    }

			    
			    $httpBackend.whenGET(/\/api\/article\/64\/1\/snippets\/[\d]/).respond(function(method, url, data) {
			    	console.log(url.split('/'));
			    	return [200, snippetGenerator(url.split('/')[4], 'generic')];
			    });

			    $httpBackend.whenGET(/\/api\/article\/64\/1\/snippets/).respond(snippetsForArticle);
			    
			    $httpBackend.whenGET(/\/api\/snippets\/generic\/[\d]/).respond(function(method, url, data) {
			    	return [200, snippetGenerator(url.split('/')[4], 'generic')];
			    });
			    $httpBackend.whenGET(/\/api\/snippets\/tweet\/[\d]/).respond(function(method, url, data) {
			    	return [200, snippetGenerator(url.split('/')[4], 'tweet')];
			    });
			    $httpBackend.whenGET(/\/api\/snippets\/generic/).respond(snippetsGeneric);
			    $httpBackend.whenGET(/\/api\/snippets\/tweet/).respond(snippetsTweet);
			    $httpBackend.whenGET(/\/api\/snippets/).respond(snippets);
			    $httpBackend.whenGET(/\/api\/snippetTemplate\/[\d]/).respond(snippetTemplate);

			    // $httpBackend.whenGET(/api\/.*/).passThrough();
				// define responses for requests here as usual
			}]);
	}
})(angular);