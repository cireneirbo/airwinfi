/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const markers = [];

let openInfoWindow;

function createMarkerOnMap(map, place) {
	markers.push(new globalThis.google.maps.Marker({
		//"icon": "",
		"map": map,
		"position": place.geometry.location
	}));

	globalThis.google.maps.event.addListener(markers[markers.length - 1], "click", function() {
		const infoWindow = new globalThis.google.maps.InfoWindow();

		// Close open window

		if (openInfoWindow !== undefined) {
			openInfoWindow.close();
		}

		// Open new window

		infoWindow.setContent(`
			<p>
            	${place.name} <br />
        	</p>
        	<a href="https://www.google.com/search?q=${place.name.toLowerCase().replace(' ', '+')}+menu" target="_blank">Search for the cheapest item!</a>
		`);

		infoWindow.open(map, this);

		openInfoWindow = infoWindow;
	});
}

globalThis.googleMapsResponseHandler = function() {
	navigator.geolocation.getCurrentPosition(function(position) {
		const location = new globalThis.google.maps.LatLng({
			"lat": position.coords.latitude,
			"lng": position.coords.longitude
		});

		const map = new globalThis.google.maps.Map(document.getElementById("viewer"), {
			"zoom": 11,
			"center": location
		});

		function updateResults() {
			// Clear old markers

			for (const marker of markers) {
				marker.setMap(null);
			}

			const buffer = [];

			function resultsHandler(results) {
				return new Promise(function(resolve, reject) {
					// Add new markers

					for (const result of results) {
						if (result.business_status === "OPERATIONAL") {
							createMarkerOnMap(map, result);

							buffer.push(`
								<li>
									<div class="details">
										<h3>${result.name}</h3>
										<ul>
											<li>${"<i class=\"fa fa-star\"></i>".repeat(result.rating)}</li>
											<li>${result.user_ratings_total}</li>
										</ul>
										<ul>
											<li>${"<i class=\"fa fa-usd\"></i>".repeat(result.price_level)}</li>
											<li>${result.types[0][0].toUpperCase() + result.types[0].substring(1)}</li>
											<li>${result.vicinity}</li>
										</ul>
										<p class="description active">${result.opening_hours?.open_now ? "Open now!" : "Not currently open."}</p>
									</div>
								</li>
							`);
						}
					}

					resolve();
				});
			}

			const service = new globalThis.google.maps.places.PlacesService(map);

			Promise.all([
				new Promise(function(resolve, reject) {
					service.nearbySearch({
						"bounds": map.getBounds(),
						"type": "library"
					}, async function(results, status) {
						if (status === globalThis.google.maps.places.PlacesServiceStatus.OK) {
							await resultsHandler(results);

							resolve();
						}
					});
				}),
				new Promise(function(resolve, reject) {
					service.nearbySearch({
						"bounds": map.getBounds(),
						"keyword": "free wifi"
					}, async function(results, status) {
						if (status === globalThis.google.maps.places.PlacesServiceStatus.OK) {
							await resultsHandler(results);

							resolve();
						}
					});
				})
			]).then(function() {
				document.getElementById("results").innerHTML = buffer.join("");
			});
		}

		function updateResultsOnIdle() {
			return new Promise(function(resolve, reject) {
				globalThis.google.maps.event.addListenerOnce(map, "idle", updateResults);

				resolve();
			});
		}

		globalThis.google.maps.event.addListenerOnce(map, "tilesloaded", updateResults);

		async function updateMap() {
			await updateResultsOnIdle();

			globalThis.google.maps.event.addListenerOnce(map, "dragend", updateMap);
		}

		globalThis.google.maps.event.addListenerOnce(map, "dragend", updateMap);

		//globalThis.google.maps.event.addListenerOnce(map, "zoom_changed", updateMap);
	}, function(error) {
		const response = prompt("I see you didn't want to share your location with us. Fair enough. Can we have your ZIP code instead?", "90210");

		if (response.length === 5 && !isNaN(parseInt(response, 10))) {
			//data["zip"] = response;
		} else {
			alert("An error occurred. Sorry about that.");
		}
	});
};
