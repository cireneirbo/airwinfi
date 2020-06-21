/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const markers = [];

function createMarkerOnMap(map, place, pinColor) {
	let suggestion = `
		<p>
			<strong>${place.name}</strong>
	`;

	switch (place.name) {
		case "Starbucks":
			suggestion += `
					<br />
					<br />
					<strong>Looking to be left alone?</strong>
					<br />
					<br />
					Consider buying yourself a <a href="https://www.menuwithprice.com/menu/starbucks/" target="_blank">Freshly Brewed "Tall" Coffee for $1.85!</a>
				</p>
			`;
			break;
		case "Einstein Bros. Bagels":
			suggestion += `
					<br />
					<br />
					<strong>Looking to be left alone?</strong>
					<br />
					<br />
					Consider buying yourself a <a href="https://ebcatering.com/index.cfm?fuseaction=item&item-id=2855&child-id=2582&restrictByDayPart=false#product_316" target="_blank">Bottled Water for $2.39!</a>
				</p>
			`;
			break;
		case "Panera Bread":
			suggestion += `
					<br />
					<br />
					<strong>Looking to be left alone?</strong>
					<br />
					<br />
					Consider buying yourself a <a href="https://delivery.panerabread.com/menu/category/158" target="_blank">French Baguette for $0.75!</a>
				</p>
			`;
			break;
		default:
			suggestion += `
				</p>
			`;
			break;
	}

	const marker = {
		"id": place.place_id,
		"isOpen": false,
		"infoWindow": new globalThis.google.maps.InfoWindow({
			"content": `

				${suggestion}
			`
		}),
		"marker": new globalThis.google.maps.Marker({
			"icon": {
				"url": "images/" + pinColor + "-pin.png",
				"scaledSize": new globalThis.google.maps.Size(54 / 2, 86 / 2),
				"size": new globalThis.google.maps.Size(54 / 2, 86 / 2)
			},
			"map": map,
			"position": place.geometry.location
		})
	};

	globalThis.google.maps.event.addListener(marker["marker"], "click", function() {
		// Close open window

		const markerWithOpenInfoWindow = markers.find(function(element) {
			return element.isOpen === true;
		});

		if (markerWithOpenInfoWindow !== undefined) {
			markerWithOpenInfoWindow.infoWindow.close();

			markerWithOpenInfoWindow.isOpen = false;
		}

		marker["infoWindow"].open(map, marker["marker"]);

		marker.isOpen = true;
	});

	markers.push(marker);
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

		const fragment = document.createDocumentFragment();

		function updateResults() {
			// Clear old markers

			for (const marker of markers) {
				marker.setMap(null);
			}

			function resultsHandler(results, pinColor) {
				return new Promise(function(resolve, reject) {
					// Add new markers

					for (const result of results) {
						if (result.business_status === "OPERATIONAL") {
							createMarkerOnMap(map, result, pinColor);

							const template = document.createElement("template");

							template.innerHTML = `
								<li>
									<a id="${result.place_id}" href="#" style="border-bottom: none">
										<div class="details">
											<h3>${result.name}</h3>
											${result.user_ratings_total !== undefined ? `<ul>
												<li>${"<i class=\"fa fa-star\"></i>".repeat(result.rating)}</li>
												<li>${result.user_ratings_total}</li>
											</ul>` : ""}
											<ul>
												${result.price_level ? `<li>${"<i class=\"fa fa-usd\"></i>".repeat(result.price_level)}</li>` : ""}
												<li>${result.types[0][0].toUpperCase() + result.types[0].substring(1)}</li>
												<li>${result.vicinity}</li>
											</ul>
											<p class="description active">${result.opening_hours?.open_now ? "Open now!" : "Not currently open."}</p>
										</div>
									</a>
								</li>
							`;

							fragment.appendChild(template.content.cloneNode(true));

							fragment.getElementById(result.place_id).addEventListener("click", function(event) {
								event.preventDefault();

								// Close open window

								const markerWithOpenInfoWindow = markers.find(function(element) {
									return element.isOpen === true;
								});

								if (markerWithOpenInfoWindow !== undefined) {
									markerWithOpenInfoWindow.infoWindow.close();

									markerWithOpenInfoWindow.isOpen = false;
								}

								// Open window

								const marker = markers.find(function(element) {
									return element["id"] === result.place_id;
								});

								marker["infoWindow"].open(map, marker["marker"]);

								marker["isOpen"] = true;
							});
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
							await resultsHandler(results, "blue");

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
							await resultsHandler(results, "red");

							resolve();
						}
					});
				})
			]).then(function() {
				createMarkerOnMap(map, {
					"geometry": {
						"location": location
					},
					"name": "Friendly User #8675309",
					"place_id": "8675309"
				}, "yellow");

				document.getElementById("results").innerHTML = "";

				document.getElementById("results").appendChild(fragment);
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
