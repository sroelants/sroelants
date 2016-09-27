$(document).ready(function() {
    $('.search-form').submit(function(e) {
        e.preventDefault();
        if ($('.searchbar').val() != "" ) { // Don't slide up if not really searching
            $.getJSON("https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=" + $('.searchbar').val() + "&srprop=snippet&origin=*", function(json) {
                $('.top-wrapper').addClass('top'); 
                setTimeout(function() { // Delay until slide is complete.
                    for(var i = 0; i < json.query.search.length; i++) {
                        result = '<a href="https://en.wikipedia.org/wiki/' 
                            + json.query.search[i].title + 
                            '" target="_blank"><div class="result"><h1>' + 
                            json.query.search[i].title + '</h1>' +
                            '<p>' + json.query.search[i].snippet + '</p>'+
                            '</div></a>';
                        $(result).hide().appendTo($('.results')).fadeIn(500);
                    } 
                //     $('.results').children().each(function(i, el) {
                //         $(this).removeClass("hidden", 300);
                //     });
                }, 500);
            });
        };
    });
});
