# gtran-kml

[![npm](https://img.shields.io/npm/v/gtran-kml.svg)](https://www.npmjs.com/package/gtran-kml) [![Build Status](https://travis-ci.org/haoliangyu/gtran-kml.svg?branch=master)](https://travis-ci.org/haoliangyu/gtran-kml)

Convert geojson to kml file and backwards.

This is a sub-project of [gtran](https://github.com/haoliangyu/gtran).

## Installation

```javascript
npm install gtran-kml
```

## Functions

- **fromGeoJson(geojson, fileName, options)**

  Save the geojson into the given file name.

  Since **1.1.11**, it also supports Mapbox's [simplestyle-spec](https://github.com/mapbox/simplestyle-spec).

  options:

  - documentName - Specify the name of the full document. The Default value is **'My KML'**.

  - documentDescription - Specify the description of the full document. The Default value is **'Converted from GeoJson by gtran-kml'**.

  - name - Specify the feature name using a geojson property. The Default value is **'name'**.

  - featureStyleKey - Specify the xml style key in the xml feature properties.

  - symbol - Specify feature Symbol. It accepts an symbol object or a function to return the symbol per feature.

    Supported styles:

    - Point

      - color - HTML color code or array of RGB values, indicating feature color.

      - alpha - An integer value (0-255), indicating the color opacity

      - scale - Feature size, a float number.

      - icon - Link of feature icons. Some generally used icons can be found [here](http://kml4earth.appspot.com/icons.html).

    - LineString

      - color - HTML color code or array of RGB values, indicating feature color.

      - alpha - An integer value (0-255), indicating the color opacity

      - width - A float value, indicating line width.

    - Polygon

      - color - HTML color code or array of RGB values, indicating feature color.

      - alpha - An integer value (0-255), indicating the color opacity

      - fill - A boolean value, indicating whether to fill the polygon.

      - outline - A boolean value, indicating whether to outline the polygon.

  See the detail explaination at [KML format reference](https://developers.google.com/kml/documentation/kmlreference).

  - pretty - Pretty print the output KML. The default value is **false**.

- **toGeoJson(fileName)**

  Read the given file into geojson.

## Use Example

```javascript
const kml = require('gtran-kml');

// Specify promise library if necessary
kml.setPromiseLib(require('bluebird'));

// Read KML file
kml
  .toGeoJson('source.kml')
  .then((object) {
    const geojson = object;
  });

const geojson = {
  'type': 'FeatureCollection',
  'features': [{
    'type': 'Feature',
    'geometry': {"type":"Point","coordinates":[-70.2532459795475,43.6399758607149]},
    'properties': {
      'id': 1,
      'Name': 'test'
    }
  }]
};

// Define a symbol for all features in the layer
const pointSymbol = {
  color: '#2dcd86',
  alpha: 255,
  scale: 1,
  icon: 'http://maps.google.com/mapfiles/kml/shapes/square.png'
};

// Save geojson into KML file
kml.fromGeoJson(geojson, 'point.kml', {
  symbol: pointSymbol,
  name: 'Name'
})

// Define a symbol for each individual feature
kml.fromGeoJson(geojson, 'point.kml', {
  symbol: (feature) => {
    return {
      color: '#2dcd86',
      alpha: 255 * Math.random(),
      scale: 1,
      icon: 'http://maps.google.com/mapfiles/kml/shapes/square.png'
    }
  },
  name: 'Name'
})
```
