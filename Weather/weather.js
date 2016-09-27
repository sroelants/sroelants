$(document).ready( function(){
    var key = "98ecd1d6e3e7b3c8f330cd242d4a2dec";
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
            var url = "//api.openweathermap.org/data/2.5/weather?lat=" +
                pos.coords.latitude + "&lon=" + pos.coords.longitude +
                "&appid=" + key;
            // var url = "https://api.darksky.net/forecast/dfcded8c4d1198883ba260c1284e77b5/" +
            //     pos.coords.latitude + "," + pos.coords.longitude + "/?" +
            //     "&exclude=minutely,hourly,daily,alerts,flags&units=si"

            $.getJSON(url, function(json) {
                $(".weather-location").html(json.name);
                $(".temperature-stat-number").html(Math.round(json.main.temp - 273.15));
                $(".wind-stat-number").html(Math.round(json.wind.speed));
                $(".humidity-stat-number").html(Math.round(json.main.humidity));
                $(".weather-graphic").css("background-image",
                        "url('img/" + json.weather[0].main + ".png')"); 
                switch ( json.weather[0].main) {
                    case "Thunderstorm":
                        $('body').css("background-color", "#555");
                        break;
                    case "Clear":
                        $('body').css("background-color", "#72CAE8");
                        break;
                    case "Snow":
                        $('body').css("background-color", "#efefef");
                        break;
                    case "Rain":
                        $('body').css("background-color", "#999");
                        break;
                    case "Drizzle":
                        $('body').css("background-color", "#9999dd");
                        break;
                    case "Clouds":
                        $('body').css("background-color", "#ddd");
                };
            });
        });
    };
    $('.temperature-stat-unit').click(function() {
        T = Number($('.temperature-stat-number').html());
        if ($('.temperature-stat-unit').html() == "°C") {
            $('.temperature-stat-number').html(Math.round(5*T/9 + 32));
            $('.temperature-stat-unit').html("°F");
        }
        else {
            $('.temperature-stat-number').html(Math.round((T-32)*1.8));
            $('.temperature-stat-unit').html("°C");
        }
    });

    $('.wind-stat-unit').click(function() {
        V = Number($('.wind-stat-number').html());
        if ($('.wind-stat-unit').html() == "m/s") {
            $('.wind-stat-number').html(Math.round(V*2.237));
            $('.wind-stat-unit').html("mi/h");
        }
        else {
            $('.wind-stat-number').html(Math.round(V/2.237));
            $('.wind-stat-unit').html("m/s");
        }
    });
});
