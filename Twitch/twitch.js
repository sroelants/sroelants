$(function() {
    // Search bar
    $search = $('.menu-search');
    $expand = $('.expand');
    $searchbar = $('.searchbar');
    $close = $('.close');
    $expand.click(function() {
        $search.addClass('search-expanded');
        $searchbar.addClass("searchbar-expanded");
        $expand.removeClass('expand');
        $close.fadeIn();
    });
    $close.click(function() {
        $search.removeClass('search-expanded');
        $searchbar.removeClass("searchbar-expanded");
        $expand.addClass('expand');
        $close.fadeOut();
    });

    // Getting Twitch information

});
