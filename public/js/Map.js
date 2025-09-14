
const apiKey = process.env.MAP_TOKEN;

// Initialize map centered roughly in India by default
const map = new maplibregl.Map({
    container: "map",
    style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${apiKey}`,
    center: [77.209, 28.6139], // New Delhi default center
    zoom: 5,
});

map.addControl(new maplibregl.NavigationControl());

let marker = null;

// Fetch autocomplete suggestions from Geoapify
function getSuggestions(query) {
    const suggestionsBox = document.getElementById("suggestions");

    if (!query) {
    suggestionsBox.style.display = "none";
    return;
    }

    const autocompleteUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
    query
    )}&limit=5&apiKey=${apiKey}`;

    fetch(autocompleteUrl)
    .then((res) => res.json())
    .then((data) => {
        suggestionsBox.innerHTML = "";

        if (!data.features.length) {
        suggestionsBox.style.display = "none";
        return;
        }

        data.features.forEach((feature) => {
        const div = document.createElement("div");
        div.textContent = feature.properties.formatted;
        div.style.padding = "8px";
        div.style.cursor = "pointer";
        div.onclick = () => {
            document.getElementById("addressInput").value =
            feature.properties.formatted;
            suggestionsBox.style.display = "none";

            const [lon, lat] = feature.geometry.coordinates;

            // Set marker on map
            if (marker) marker.remove();

            marker = new maplibregl.Marker()
            .setLngLat([lon, lat])
            .addTo(map);

            map.flyTo({ center: [lon, lat], zoom: 15 });

            // Save coordinates and formatted address to hidden inputs
            document.getElementById("latitude").value = lat;
            document.getElementById("longitude").value = lon;
            document.getElementById("formattedAddress").value =
            feature.properties.formatted;

            // Mark inputs as valid
            document
            .getElementById("addressInput")
            .classList.remove("is-invalid");
            document.getElementById("addressInput").classList.add("is-valid");
        };
        suggestionsBox.appendChild(div);
        });

        suggestionsBox.style.display = "block";
    })
    .catch(console.error);
}

// Optional: Remove marker if user clears input
document
    .getElementById("addressInput")
    .addEventListener("input", function () {
    if (!this.value && marker) {
        marker.remove();
        marker = null;
        document.getElementById("latitude").value = "";
        document.getElementById("longitude").value = "";
        document.getElementById("formattedAddress").value = "";
        this.classList.remove("is-valid");
    }
    });

// Optional: On form submit, validate that coordinates are set
document.querySelector("form").addEventListener("submit", (e) => {
    const lat = document.getElementById("latitude").value;
    const lon = document.getElementById("longitude").value;
    if (!lat || !lon) {
    e.preventDefault();
    alert("Please select a valid location from the search box.");
    document.getElementById("addressInput").classList.add("is-invalid");
    }
});