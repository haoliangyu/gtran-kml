# gtran-kml

Convert geojson to kml file and backwards.

This is a sub-project of [gtran](https://github.com/haoliangyu/gtran).

## Installation

``` javascript
npm install gtran-kml
```

## Functions

* **setPromiseLib(object)**

    Specify the promise library. If not, the library will use the native Promise.

* **fromGeoJson(geojson, fileName, options)**

    Save the geojson into the given file name.

    options:

    * symbol - Symbol of saved features. Supported styles:

        * Point

            * color     - HTML color code or array of RGB values, indicating feature color.

            * alpha     - An integer value (0-255), indicating the color opacity

            * scale     - Feature size, a float number.

            * icon      - Link of feature icons. Some generally used icons can be found [here](http://kml4earth.appspot.com/icons.html).

        * LineString

            * color     - HTML color code or array of RGB values, indicating feature color.

            * alpha     - An integer value (0-255), indicating the color opacity

            * width     - A float value, indicating line width.

        * Polygon

            * color     - HTML color code or array of RGB values, indicating feature color.

            * alpha     - An integer value (0-255), indicating the color opacity

            * fill      - A boolean value, indicating whether to fill the polygon.

            * outline   - A boolean value, indicating whether to outline the polygon.

    See the detail explaination at [KML format reference](https://developers.google.com/kml/documentation/kmlreference).

* **toGeoJson(fileName)**

    Read the given file into geojson.

## Use Example

``` javascript

var kml = require('gtran-kml');

// Specify promise library if necessary
kml.setPromiseLib(require('bluebird'));

// Read KML file
kml.toGeoJson('source.kml')
.then(function(object) {
    var geojson = object;
});

// Define feature symbol
var pointSymbol = {
    color: '#2dcd86',
    alpha: 255,
    scale: 1,
    icon: 'http://maps.google.com/mapfiles/kml/shapes/square.png'
};

// Save geojson into KML file
kml.fromGeoJson(geojson, 'point.kml', {
    symbol: pointSymbol
})
.then(function(fileName) {
    console.log('KML file has been saved at:' + fileName);
});


```
