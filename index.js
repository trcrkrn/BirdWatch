// 1) initialize map

var geocoder;

var map;

function initMap() {
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
  });
}

// 2) create function to geocode address

let address;

function geocodeAddress(callback, form) {
  let coordinates;
  let queryTarget = $(form).find(".js-query");
  address = queryTarget.val();
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      coordinates = results[0].geometry.location;
      map.setCenter(results[0].geometry.location);
      coordinates = JSON.parse(JSON.stringify(results[0].geometry.location));
      getDataFromApi(coordinates, callback);
      queryTarget.val("")
    } else {
      $("#error-message").html("Please enter a valid location!");
      return;
    };
  });
}


// 3) create function to get data from API

const observationSearchUrl = 'https://api.inaturalist.org/v1/observations/';

function getDataFromApi(coordinates, callback) {
  const query= {
      d1: "01%2F01%2F2015",
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
  for (var member in species) delete species[member];
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
    return `<li class="name-on-list"><span class="species">${speciesName}</span></li>`;
  }

//create and store markers that will be filtered and shown on map

let markers = [];

function showMarkers(speciesName) {
  const speciesArray = species[speciesName];
  if (!speciesName||!speciesName.length) return;
  speciesArray.forEach(function(observation) {
    const latCoordinate = parseFloat(observation.geojson.coordinates[1]);
    const lngCoordinate = parseFloat(observation.geojson.coordinates[0]);
    const coordinates = {lat: latCoordinate, lng: lngCoordinate};     
    let marker = new google.maps.Marker({
      map: map,
      position: coordinates,
      title: observation.species_guess,
    });
    markers.push(marker);
    google.maps.event.trigger(map, 'resize')
  });    
}

// 5) create callback function to display the data from API

function showResultsList() {
  $("#error-message").html("");  
  $("#home-screen").hide();
  $("#search-results").show();
  $("#new-search-form").show();
  $("#list").show();
  $("#description-container").hide();
  $("#map").show();
}


//removes all keys of species

function displayObservationData(data) {
  markers.length = 0;
  showResultsList();
  sortObservations(data.results);
  var names = Object.keys(species).map(renderSpecies);
  Object.keys(species).forEach(showMarkers);  
  filterMarkers();
  $("#results").html("Found " + names.length + " bird species near " + address + ". Click on a species for more info:");
  $("#list").html(names.join(""));
}

// 6) create function that watches when we click the submit button

function watchSubmit() {
  $("form").submit(event => {
    event.preventDefault();
    $("#list").html("");
    geocodeAddress(displayObservationData, event.currentTarget);    
  });
}

$(watchSubmit);

//functions that access the taxonomy for each species

function nameOrder(observation) {
  if (!observation.identifications[0].taxon.ancestors[4]) return "N/A";
    let order = observation.identifications[0].taxon.ancestors[4].name;
  if (!observation.identifications[0].taxon.ancestors[4].preferred_common_name) return order;
  return order + " (" + observation.identifications[0].taxon.ancestors[4].preferred_common_name + ")";
}

function nameFamily(observation) {
  if (!observation.identifications[0].taxon.ancestors[5]) return "N/A";
  let family = observation.identifications[0].taxon.ancestors[5].name;
  if (!observation.identifications[0].taxon.ancestors[5].preferred_common_name) return family;
  return family + " (" + observation.identifications[0].taxon.ancestors[5].preferred_common_name + ")";
}

function nameGenus(observation) {
  if (!observation.identifications[0].taxon.ancestors[6]) return "N/A";
  let genus = observation.identifications[0].taxon.ancestors[6].name;
  if (!observation.identifications[0].taxon.ancestors[6].preferred_common_name) return genus;
  return genus + " (" + observation.identifications[0].taxon.ancestors[6].preferred_common_name + ")";
}

function addDescription(observation) {
  let speciesNameUrl = observation.species_guess.replace(/\s+/g, '-').replace(/[',"]+/g, '').toLowerCase();
  const audubonUrl = "http://www.audubon.org/field-guide/bird/" + speciesNameUrl;
  let description = 
    `<section id="pd-container">
      <img id="species-pic" alt="${observation.species_guess}" src="${observation.taxon.default_photo.medium_url}">
      <section id="taxonomy" aria-live="assertive">
        <dl>
          <dt id="species-name">${observation.species_guess}</dt>
          <dt>Scientific name</dt><dd>${observation.taxon.name}</dd>
          <dt>Order</dt><dd>${nameOrder(observation)}</dd>
          <dt>Family</dt><dd>${nameFamily(observation)}</dd>
          <dt>Genus</dt><dd>${nameGenus(observation)}</dd>
        </dl>
        <p id="audubon">
        For more info: <a href="${audubonUrl}">audubon</a>
        </p>
      <button id="back-to-list" type="button" onclick="goBack()">Back to List</button>
      </section>
    </section>`;
  $("#description-container").html(description);
}

//handles click event for species name

$(function handleSpeciesClick() {
  $("ul").on("click", "li", function(event) {
    $("#search-results").hide();
    $("#list").hide();
    $("#description-container").show();
    const speciesName = $(this).find(".species").text();
    species[speciesName].forEach(addDescription);
    filterMarkers(speciesName);
    google.maps.event.trigger(map, 'resize');
    // getSpeciesDescriptionHTML(speciesName,renderSpeciesDescription);
  });
});

function goBack() {
  filterMarkers();
  $("#description-container").hide();
  $("#search-results").show();
  $("#list").show();
}





//functions to get ddescription of individual species using scrapers

// function renderSpeciesDescription (data) {
//   let $data = $(data);
//   let description = $data.find(".bird-node section section:nth-child(1) > div:last-of-type").text();
//   console.log(description);
// }

// function getSpeciesDescriptionHTML (speciesName, callback) {
//   const audubonUrl = "http://www.audubon.org/field-guide/bird/" + speciesNameUrl;
//   var url = "http://anyorigin.com/go?url=" + encodeURIComponent(audubonUrl) + "&callback=?";
//   $.get(url, callback);
// }

//show markers function only gets called once at the same time list of species
//gets built and remove species specific code from showmarkers so it always shows 
//all species
//need new function filtermarkers forEach markers (gets built by showmarkers)
//code thats about building lat and lng should be in filtermarkers or another
// function called centerOnVisibleMarkers
//showmarkers should call filter markers, calls centeronvisiblemarkers
// goBack should call filtermarkers()
//handler for click on speciesname should call filtermarkers(speciesName)
//showmarkers needs to set species name on marker

//if species name is blank, show all markers; otherwise, show selected species amrker(s)
//min and max find geobox containing all given coordinates that will be visible

function filterMarkers(speciesName) {
  let minLat = 180.0, maxLat = -180.0, minLng = 180.0, maxLng = -180.0;
  for (i=0; i < markers.length; i++) {
    let marker = markers[i];
    let latCoordinate = marker.position.lat();
    let lngCoordinate = marker.position.lng();
    if (marker.title == speciesName || !speciesName) {
      if (maxLat < latCoordinate) maxLat = latCoordinate;
      if (minLat > latCoordinate) minLat = latCoordinate;
      if (maxLng < lngCoordinate) maxLng = lngCoordinate;
      if (minLng > lngCoordinate) minLng = lngCoordinate;
      marker.setVisible(true)
    }
    else marker.setVisible(false);
  }
  var mapcoordinates = {lat: minLat + (maxLat-minLat)/2, lng: minLng + (maxLng-minLng)/2};
  if (!speciesName) map.setCenter(mapcoordinates);
} 

//reset results if doing new search
