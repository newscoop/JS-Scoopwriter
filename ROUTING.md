#Newscoop Article Edit Screen API Routing

The Newscoop API is implemented as a Symfony bundle and therefore all endpoint routing is handled by pre-compiled FOSJsRoutingBundle files:

|file|description|
|:---- |:------------|
|**app/scripts/routing/router.js**|Routing class used to generate Newscoop API endpoint URIs.|
|**app/scripts/routing/fos_js_routes.js**|Specific Newscoop API endpoint routing definitions. |

***

More information about FOSJsRoutingBundle (Friends of Symfony) can be found here:
[https://github.com/FriendsOfSymfony/FOSJsRoutingBundle](https://github.com/FriendsOfSymfony/FOSJsRoutingBundle)

***

### Generating the route URIs
Usage:  

    Routing.generate('route_id', /* your params */)


Example:  

    url = Routing.generate(
        'newscoop_gimme_articles_getarticle',
        {number: 13, language: 'en'}
    );

  
  
The example above would produce the following URI:

    https://<newscoop.domain.com>/content-api/articles/13.json?language=de

    
    

### Finding the route_id

Route ids have the following format:

    newscoop_gimme_{controller}_{function}


where {controller} and {function} refer to the Newscoop API Symfony Bundle Controller and Function definitions.  To find out what routes are available reference the Newscoop API documentation, which can be found here:

[http://newscoop.aes.sourcefabric.net/documentation/rest-api/](http://newscoop.aes.sourcefabric.net/documentation/rest-api/)
  
  
  
You can also get a list of route_ids directly from your Newscoop instance by running the following command from the 'newscoop' directory of your installed instance:


    php application/console route:debug | grep newscoop_gimme


***

More information on Symfony routing can be found here:
[http://symfony.com/doc/current/book/routing.html](http://symfony.com/doc/current/book/routing.html)

***

