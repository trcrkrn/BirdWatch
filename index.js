//home page
$("#list-screen").hide();
$("#bird-and-map").hide();

//geocode address and retrieve information from iNaturalist API
  // 1) initialize map first
  // 2) create function to geocode address
  // 3) create function to get data from API
  // 4) create function to create a list
    // a) create object which contains species as keys and observations as values
  // 5) create callback function to display the data from API
  // 6) create function that watches when we click the submit button
  // 7) create an array of markers which consists of observations of a given species
  // 8) create function that  displays markers on map 


// 1) initialize map

var geocoder;

var map;

function initMap() {
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById('map'), {
    zoom: 9,
    center: {
      lat: -34.397,
      lng: 150.644
    }
  });

  // document.getElementById('submit').addEventListener('click', function () {
  //   geocodeAddress(geocoder, map);
  // });
}

// 2) create function to geocode address

let coordinates

function geocodeAddress(geocoder, resultsMap) {
  var address = document.getElementById('address').value;
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      coordinates = results[0].geometry.location;
      resultsMap.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
    coordinates = JSON.parse(JSON.stringify(results[0].geometry.location));
    getDataFromApi(coordinates, displayObservationData)
    console.log(coordinates)
  });
}

// 3) create function to get data from API

const observationSearchUrl = 'http://api.inaturalist.org/v1/observations/';

function getDataFromApi(coordinates, callback) {
  const query= {
      d1: "01%2F01%2F2017",
      iconic_taxa: 'Aves',
      lat: coordinates.lat,
      lng: coordinates.lng,
      radius: 30,
      order: 'desc',
      order_by: 'created_at'
  }
  jQuery.getJSON(observationSearchUrl, query, callback)
} 

// 4) create function to create a list
  // a) create object which contains species as keys and observations as values

const species = {};

function sortObservations(data) {
  data.forEach(function(observation){
    let key = observation.species_guess;
    if( key in species ){
      species[key].push(observation);
    } else {
      species[key] = [observation];
    }
  });
}

function renderSpecies(speciesName) {
      return `<li ><img src="" alt="">${speciesName}</li>`;
}

// 5) create callback function to display the data from API

function displayObservationData(data) {
  sortObservations(data.results);
  console.log(JSON.stringify(data));
  var names = Object.keys(species).map(renderSpecies);
  $(".js-search-results").html(`<ul class="species">${names.join("")}</ul>`);
}

// 6) create function that watches when we click the submit button

function watchSubmit() {
  $(".js-search-form").submit(event => {
    event.preventDefault();
    $("#home-screen").hide();
    $("#list-screen").show();
    geocodeAddress(geocoder, map);
    
    const queryTarget = $(event.currentTarget).find(`.js-query`);
    // const query = queryTarget.val()
    queryTarget.val("");
    // getDataFromApi(query, displayObservationData);
  });
}

$(watchSubmit);

// 7) create an array of markers which consists of observations of a given species

// let markers = [];

// $()