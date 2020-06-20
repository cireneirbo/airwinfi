/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const markers = [];

function createMarkerOnMap(map, place) {
	markers.push(new globalThis.google.maps.Marker({
		"map": map,
		"position": place.geometry.location
	}));

	globalThis.google.maps.event.addListener(markers[markers.length - 1], "click", function() {
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

		function updateResults() {
			const service = new globalThis.google.maps.places.PlacesService(map);

			service.nearbySearch({
				"bounds": map.getBounds(),
				"keyword": "free wifi"
			}, function(results, status) {
				if (status === globalThis.google.maps.places.PlacesServiceStatus.OK) {
					const buffer = [];

					// Clear old markers

					for (const marker of markers) {
						marker.setMap(null);
					}

					// Add new markers

					for (const result of results) {
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
										<li>${result.types[0]}</li>
										<li>${result.vicinity}</li>
									</ul>
									<p class="description active">${result.business_status === "OPERATIONAL" ? result.opening_hours.open_now : ""}</p>
								</div>
							</li>
						`);
					}

					document.getElementById("results").innerHTML = buffer.join("");
				}
			});
		}

		function updateResultsOnIdle() {
			return new Promise(function(resolve, reject) {
				globalThis.google.maps.event.addListenerOnce(map, "idle", updateResults);

				resolve();
			});
		}

		globalThis.google.maps.event.addListenerOnce(map, "tilesloaded", updateResults);

		globalThis.google.maps.event.addListenerOnce(map, "dragend", async function onCenterChanged() {
			console.log("Center changed!");

			await updateResultsOnIdle();

			globalThis.google.maps.event.addListenerOnce(map, "dragend", onCenterChanged);
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
