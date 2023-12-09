

export const displayMap = (locations) => {
  mapboxgl.accessToken = 'pk.eyJ1IjoiZmFyemluaiIsImEiOiJjbHBxMTR6MWMwM2g4MmpwZjR3bWUwaGhzIn0.Wn52Dt98_EPzsq9Sy9j08Q';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/farzinj/clpq20jed00bo01pxf0kjbsqb',
    scrollZoom: false
    // center: [-118.113491, 34.111745],
    // zoom: 5
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(location => {
    // create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(location.coordinates)
      .addTo(map)

    //popup

    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(location.coordinates)
      .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
      .addTo(map);

    bounds.extend(location.coordinates);
  })

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });

  map.addControl(new mapboxgl.NavigationControl());
}