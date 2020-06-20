/* eslint-disable @typescript-eslint/no-unsafe-assignment */

function createMarkerOnMap(map, place) {
	const marker = new globalThis.google.maps.Marker({
		"map": map,
		"position": place.geometry.location
	});

	globalThis.google.maps.event.addListener(marker, "click", function() {
		const infoWindow = new globalThis.google.maps.InfoWindow();

		infoWindow.setContent(place.name);
		infoWindow.open(map, this);
	});
}

globalThis.googleMapsResponseHandler = function() {
	navigator.geolocation.getCurrentPosition(function(position) {
		const location = new globalThis.google.maps.LatLng({
			"lat": position.coords.latitude,
			"lng": position.coords.longitude
		});

		const map = new globalThis.google.maps.Map(document.getElementById("viewer"), {
			"zoom": 10,
			"center": location
		});

		globalThis.google.maps.event.addListenerOnce(map, "tilesloaded", function(event) {
			const service = new globalThis.google.maps.places.PlacesService(map);

			service.nearbySearch({
				"bounds": map.getBounds(),
				"minPriceLevel": 0,
				"maxPriceLevel": 1,
				"keyword": "free wifi"
			}, function(results, status) {
				if (status === globalThis.google.maps.places.PlacesServiceStatus.OK) {
					for (const result of results) {
						console.log(result);
						createMarkerOnMap(map, result);
					}
				}
			});
		});
	}, function(error) {
		const response = prompt("I see you didn't want to share your location with us. Fair enough. Can we have your ZIP code instead?", "90210");

		if (response.length === 5 && !isNaN(parseInt(response, 10))) {
			//data["zip"] = response;
		} else {
			alert("An error occurred. Sorry about that.");
		}
	});
};

document.addEventListener("DOMContentLoaded", function(event) {

});
