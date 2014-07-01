/* custom script for managing variable height of the add snippet box */

$(function() {
    var addSnippetHeight = $('.authoring-environment .embed-panel .add-element').outerHeight();
    $('.authoring-environment .embed-panel .list').css('top',addSnippetHeight);
});