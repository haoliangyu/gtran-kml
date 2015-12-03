var gtran = require('../src/script.js');
var fs = require('fs');
var logger = require('log4js').getLogger();

var chai = require('chai');
var expect = chai.expect;

describe('KML module - Point', function() {

    var saveName = 'test/result/test_point.kml';

    var kmlData = 'test/data/test_point.kml';

    var pointSymbol = {
        color: [255, 0, 0],
        alpha: 255,
        scale: 1,
        icon: 'http://maps.google.com/mapfiles/kml/shapes/square.png'
    };

    var geojson = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {"type":"Point","coordinates":[-70.2532459795475,43.6399758607149]},
            'properties': {
              'id': 1,
              'sdf': null,
              'Name': 'test'
            }
        }]
    };

    it('should save the point geojson as a KML file with Q.', function() {
        gtran.setPromiseLib(require('q'));
        gtran.fromGeoJson(geojson, saveName, {
            symbol: pointSymbol,
            name: 'Name'
        }).then(function(file) {
            expect(fs.statSync(saveName)).to.exist;
        })
        .catch(function(err) {
            logger.error(err);
        });
    });

    it('should load the point kml file and convert it into a geojson.', function() {
        gtran.toGeoJson(kmlData).then(function(geojson) {
            // Get features
            expect(geojson.features.length).to.be.equal(4);

            // Check Data tag
            expect(geojson.features[0].properties).has.property('id');
            expect(geojson.features[0].properties.id).to.be.equal('1');

            // Check name and description
            expect(geojson.features[1].properties).has.property('name');
            expect(geojson.features[1].properties.name).to.be.equal('Point2');
            expect(geojson.features[1].properties).has.property('description');
            expect(geojson.features[1].properties.description).to.be.equal('test');

            // Check SimpleData tag
            expect(geojson.features[2].properties).has.property('id');
            expect(geojson.features[2].properties.id).to.be.equal(1);
        })
        .catch(function(err) {
            logger.error(err);
        });
    });

});
