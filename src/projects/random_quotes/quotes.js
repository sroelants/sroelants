var buttonLines = [ "Got it!",
                     "Next!",
                     "What else you got?",
                     "Tell me more",
                     "One more",
                     "Another one!",
                     "That's cool",
                     "Nice",
                     "Smart",
                     "Hit me",
                     "Smart me up!",
                     "Quote?"];

var wallpapers = ["22P83TKB1S.jpg",  "9NXWG2V0F6.jpg",  "A0444339E9.jpg",  
    "bonsai.jpg",  "KPGB8IQQGC.jpg",  "LKY8ZD462Q.jpg",
    "U3LYNRYZY3.jpg"];

$(document).ready(function() {
    $("#next-button").click(generateQuote); //generateQuote, not generateQuote()...
    generateQuote();
});

function generateQuote() {
    $.getJSON("quotes.json", function(json) {
        var entry = json[Math.floor(Math.random()*json.length)];

        // Substitute the quote
        $(".text-wrapper").fadeToggle(500, "swing", function () {
            $(".quote").html("<p>" + entry.quote + "</p>");
            $(".author").html("<p>" + entry.author + "</p>");
            $(".text-wrapper").fadeToggle(500);
        });

        // Update the tweet link.
        document.getElementsByClassName("tweet-link")[0].setAttribute("href",
                "https://twitter.com/intent/tweet?" + //
                "text=" + entry.quote + //
                "&hashtags=quote," + entry.author.replace(/\s/g,''));
    });
    $(".next-button").html(buttonLines[Math.floor(Math.random()*buttonLines.length)]);
    $(".top-wrapper").css("background-image","url('img/" +
            wallpapers[Math.floor(Math.random()*wallpapers.length)] + "')");

};
