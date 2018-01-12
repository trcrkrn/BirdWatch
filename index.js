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
    zoom: 10,
    center: {lat: -34.397, lng: 150.644}
  });
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
        position: results[0].geometry.location,
        title: "Location search"
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
    coordinates = JSON.parse(JSON.stringify(results[0].geometry.location));
    getDataFromApi(coordinates, displayObservationData);
    console.log(coordinates, "search location")
  });
}

// 3) create function to get data from API

const observationSearchUrl = 'http://api.inaturalist.org/v1/observations/';

function getDataFromApi(coordinates, callback) {
  const query= {
      d1: "01%2F01%2F2016",
      iconic_taxa: 'Aves',
      lat: coordinates.lat,
      lng: coordinates.lng,
      radius: 40,
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
    if(key in species){
      species[key].push(observation);
    } else {
      species[key] = [observation];
    }
  });
}

function renderSpecies(speciesName) {
    if (speciesName == "null") return;
    return `<li class="name-on-list"><img src="" alt=""><span class="species">${speciesName}</span></li>`;
}

// 5) create callback function to display the data from API

function displayObservationData(data) {
  sortObservations(data.results);
  // console.log(JSON.stringify(data));
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
    queryTarget.val("");
  });
}

$(watchSubmit);

// 7) create an array of markers which consists of observations of a given species

// let markers

// function getCoordinates()

// function 
//   var marker = new google.maps.Marker({
//   position: 
//   })
function showMarkers(speciesName) {
  const speciesArray = species[speciesName];
  if (!speciesName||!speciesName.length) return;
  let minLat = 180.0, maxLat = -180.0, minLng = 180.0, maxLng = -180.0;
  speciesArray.forEach(function(observation) {
    const latCoordinate = parseFloat(observation.geojson.coordinates[1]);
    const lngCoordinate = parseFloat(observation.geojson.coordinates[0]);
    if (maxLat < latCoordinate) maxLat = latCoordinate;
    if (minLat > latCoordinate) minLat = latCoordinate;
    if (maxLng < lngCoordinate) maxLng = lngCoordinate;
    if (minLng > lngCoordinate) minLng = lngCoordinate;
    const coordinates = {lat: latCoordinate, lng: lngCoordinate};
    console.log("maxLat", maxLat, "minLat", minLat, "maxLng", maxLng, "minLng", minLng, "coordinates", coordinates);
    var marker = new google.maps.Marker({
      map: map,
      position: coordinates,
      title: observation.place_guess
    });
  });
  var mapcoordinates = {lat: minLat + (maxLat-minLat)/2, lng: minLng + (maxLng-minLng)/2};
  map.setCenter(mapcoordinates)
  console.log(mapcoordinates)
}

function nameOrder(observation) {
  let order = observation.identifications[0].taxon.ancestors[4].name;
  if (!observation.identifications[0].taxon.ancestors[4]) return "N/A";
  if (!observation.identifications[0].taxon.ancestors[4].preferred_common_name) return order;
  return order + " (" + observation.identifications[0].taxon.ancestors[4].preferred_common_name + ")";
}

function nameFamily(observation) {
  let family = observation.identifications[0].taxon.ancestors[5].name;
  if (!observation.identifications[0].taxon.ancestors[5]) return "N/A";
  if (!observation.identifications[0].taxon.ancestors[5].preferred_common_name) return family;
  return family + " (" + observation.identifications[0].taxon.ancestors[5].preferred_common_name + ")";
}

function nameGenus(observation) {
  let genus = observation.identifications[0].taxon.ancestors[6].name;
  if (!observation.identifications[0].taxon.ancestors[6]) return "N/A";
  if (!observation.identifications[0].taxon.ancestors[6].preferred_common_name) return genus;
  return genus + " (" + observation.identifications[0].taxon.ancestors[6].preferred_common_name + ")";
}

// function addComment(observation) {
//   let comment;
//   if (observation.comments.length === 0) return "N/A";
//   for (i = 0; i < observation.comments.length; i++) {
//     let comment = 
//       `<li class="comment">
//         <p class="comment-body">${observation.comments[i].body}<p>
//         <img class="user-icon" src=${observation.comments[i].user.icon}>
//         <p class="username">${observation.comments[i].user.login}</p>
//         <p class="date">${observation.comments[i].created_at_details.date}</p>
//       </li>`;
//   $("#comments").html(comment);
//   };
//   console.log(observation.comments);
// }

function addDescription(observation) {
  let description = 
    `<section id="pd-container">
      <img id="species-pic" src="${observation.taxon.default_photo.medium_url}">
      <section id="taxonomy">
        <ul id="species-name">${observation.species_guess}</ul>
          <li class="taxonomy-info" id="scientific-name"><u>Scientific name</u>: ${observation.taxon.name}</li>
          <li class="taxonomy-info" id="order"><u>Order</u>: ${nameOrder(observation)}</li>
          <li class="taxonomy-info" id="family"><u>Family</u>: ${nameFamily(observation)}</li>
          <li class="taxonomy-info" id"genus"><u>Genus</u>: ${nameGenus(observation)}</li>
          <button id="back-to-list" type="button" onclick="goBack()">Back to List</button>
      </section>
      <section id="description">
      </section>
    </section>`;
 $("#description-container").html(description);
  console.log(observation.identifications);
}

$(function() {
  $("#list-screen").hide();
  $("#bird-and-map").hide();
  $("ul").on("click", "li", function(event) {
    $("#list-screen").hide();
    $("#bird-and-map").show();
    const speciesName = $(this).find(".species").text();
    species[speciesName].forEach(addDescription);
    google.maps.event.trigger(map, 'resize');
    showMarkers(speciesName);
    getSpeciesDescriptionHTML(speciesName,renderSpeciesDescription);
  });
});

function goBack() {
  $("#bird-and-map").hide();
  $("#list-screen").show();
}

// function findHTMLpage (speciesName) {
//   let page = "http://"
// }

function renderSpeciesDescription (data) {
  let $data = $(data);
  let description = $data.find(".bird-node section section:nth-child(1) > div:last-of-type").text();
  console.log(description);
}

function getSpeciesDescriptionHTML (speciesName, callback) {
  speciesName = speciesName.replace(/\s+/g, '-')
  .replace(/[',"]+/g, '').toLowerCase();
  const url = "http://www.audubon.org/field-guide/bird/" + speciesName;
  $.get(url, callback)
}

// #node-926 > section > div > div.large-8.columns > section:nth-child(1) > div.hide-for-tiny.hide-for-small.hide-for-medium

// #node-649 > section > div > div.large-8.columns > section:nth-child(1) > div.hide-for-tiny.hide-for-small.hide-for-medium