/* esLint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations);
const mapBox = document.getElementById('map')

mapboxgl.accessToken =
  'pk.eyJ1IjoidHN0dG9ueTg1IiwiYSI6ImNrdjVmcnc4bTJuMDUybnF3MGkwY2RycmgifQ.sdSSEMBALgXYVF55mJOq3g';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/tsttony85/ckv5h9d553xj515qqoj1u5iol',
  scrollZoom: false
  // center: [-118.113491,34.111745],
  // zoom: 4,
  // interactive: false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
  // Create marker
  const el = document.createElement('div');
  el.className = 'marker';

  // Add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom'
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add popup
  new mapboxgl.Popup({
    offset: 30
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  // Extend map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100
  }
});

