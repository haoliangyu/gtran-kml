var gtran = require('../src/script.js');
var fs = require('fs');
var logger = require('log4js').getLogger();

var chai = require('chai');
var expect = chai.expect;

describe('KML module - Polygon', function() {

    var saveName = 'test/result/test_polygon.kml';

    var kmlData = 'test/data/test_polygon.kml';

    var polygonSymbol = {
        color: '#2dcd86',
        fill: true,
        outline: false
    };

    var geojson = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {"type":"Polygon","coordinates":[[[-70.2,43.6],
                                                          [-74.2,40.6],
                                                          [-62, 35],
                                                          [-70.2,43.6]]]},
            'properties': {
              'id': 1,
              'name': 'test'
            }
        }]
    };

    it('should save the polygon geojson as a KML file with Q.', function() {
        gtran.setPromiseLib(require('q'));
        gtran.fromGeoJson(geojson, saveName, {
            symbol: polygonSymbol
        }).then(function(file) {
            expect(fs.statSync(saveName)).to.exist;
        })
        .catch(function(err) {
            logger.error(err);
        });
    });

    it('should load the polygon kml file and convert it into a geojson.', function() {
        gtran.toGeoJson(kmlData).then(function(geojson) {
            // Get features
            expect(geojson.features.length).to.be.equal(1);

            // Check name and description
            expect(geojson.features[0].properties).has.property('name');
            expect(geojson.features[0].properties.name).to.be.equal('test');
            expect(geojson.features[0].properties).has.property('description');
            expect(geojson.features[0].properties.description).to.be.equal('test3');
        })
        .catch(function(err) {
            logger.error(err);
        });
    });

});
