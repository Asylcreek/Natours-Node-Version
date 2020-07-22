/*eslint-disable */
export const displayMap = (locations) => {
    mapboxgl.accessToken =
        'pk.eyJ1IjoiYXN5bGNyZWVrIiwiYSI6ImNrY3V2Nmt5czF5OW4ycnQ2NGJpbHR5eHgifQ.s2D0-dNq0to4nNyR9TofiA';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/asylcreek/ckcuvn4vg02ta1hqb83eh4z9y',
        scrollZoom: false,
        // center: [-118.113491, 34.111745],
        // zoom: 4,
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((location) => {
        //Create marker
        const el = document.createElement('div');
        el.className = 'marker';

        //Add marker
        new mapboxgl.Marker({
                element: el,
                anchor: 'bottom',
            })
            .setLngLat(location.coordinates)
            .addTo(map);

        //Add popup
        new mapboxgl.Popup({ offset: 30 })
            .setLngLat(location.coordinates)
            .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
            .addTo(map);

        //Extend map bounds to include the current location
        bounds.extend(location.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100,
        },
    });
};