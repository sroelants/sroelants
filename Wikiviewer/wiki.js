$(document).ready(function() {
    $('.search-form').submit(function(e) {
        e.preventDefault();
        $.getJSON("https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=" + $('.searchbar').val() + "srprop=snippet", function(json) {

            html = "";
            console.log("JSON FETCHED");
        });
    });
});
