//home screen

$("#list-screen").hide();
$("#map-screen").hide();

//list screen

//get users location search

//get results from api
const observationSearchUrl = 'http://api.inaturalist.org/v1/observations/';

function getDataFromApi(searchTerm, callback) {
    const query= {
        d1: "01%2F01%2F2017",
        iconic_taxa: 'Aves',
        lat: latitude,
        lng: longitude,
        radius: 50,
        order: 'desc',
        order_by: 'created_at'
    }
    $.getJSON(observationSearchUrl, query, callback)
} 

//initialize map
function initMap(lat, lng) {
    var map = new google.maps.Map(document.getElementById('first-map'), {
      zoom: 10,
      center: {lat, lng}
    });
  }

//geocode location
function geocodeAddress(geocoder, resultsMap) {
    var address = document.getElementById('address').value;
    geocoder.geocode({'address': address}, function(results, status) {
      if (status === 'OK') {
        resultsMap.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
          map: resultsMap,
          position: results[0].geometry.location
        });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
}

// Create the autocomplete helper, and associate it with
//   // an HTML text input box.
// var autocomplete = new google.maps.places.Autocomplete(input);
//   autocomplete.bindTo('bounds', map);

//   map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

//   var infowindow = new google.maps.InfoWindow();
//   var marker = new google.maps.Marker({
//     map: map
//   });
//   google.maps.event.addListener(marker, 'click', function() {
//     infowindow.open(map, marker);
//   });

//create object; keys are species,
//values are array containing all observations
//of that species 
const species = {};

//to center googlemap
function centerMap(highlat, lowlat, highlng, lowlng) {
    
        }

const markers = [];

function makeObservationMarker(observation) {
    let marker = new google.maps.Marker({
            lat: observation.geojson.coordinates[1],
            lng: observation.geojson.coordinates[0],
       }); 
       markers.push(marker)       
    }

function handleObservations(data) {
    if (data.results.length === 0) {
        //give feedback to user if there are no results
        return //
    }
    let highlat = data.results[0].geojson.coordinates[1];
    let lowlat = data.results[0].geojson.coordinates[1];
    let highlng = data.results[0].geojson.coordinates[0];
    let lowlng = data.results[0].geojson.coordinates[0];
    initMap(highlat,highlong);
    data.results.forEach(function(observation){
        let lat = observation.geojson.coordinates[1];
        let lng = observation.geojson.coordinates[0];
        let key = observation.species_guess;
        if (lat > highlat) highlat = lat;
        else if (lat < lowlat) lowlat = lat;
        if (lng > highlng) highlng = lng;
        else if (lng < lowlng) lowlng = lng;
        if (key in species) {
            species[key].push(observation);
        } else {
            species[key] = [observation];
        }
        makeObservationMarker(observation)

    }); 
    centerMap(highlat, lowlat, highlng, lowlng)
}

function handleSelectSpecies(event) {
    let speciesName = $(this).val();
    let observationsForThisSpecies = species[speciesName];
    observationsForThisSpecies.forEach(function(speciesObservation) {
        $('.observations').append(htmlforObs(speciesObservation));
        //filter out markers here
    })
}

function renderResults(result) {
    listofSpecies.forEach(function(){
        return `<div>
            <img src="" alt="${key}">
            <ul alt="${key}">${key}</ul>
        </div>`
    })
}

function renderObservationData(data) {
    const results= data.items.map((item, index) => renderResult(item));
    results.unshift(`<h2>Results: ${data.pageInfo.resultsPerPage} out of ${data.pageInfo.totalResults}</h2>`)
    $(".js-search-results").html(results);
}

function watchSubmit() {
    $("#toolbar").submit(event => {
        $("#home-screen").hide();
    $("#list-screen").show();
        event.preventDefault();
        const queryTarget = $(event.currentTarget).find(`.js-query`);
        const query = queryTarget.val()
        queryTarget.val("");
        getDataFromApi(query, observationSearchUrl);
    });
}

$(watchSubmit);

