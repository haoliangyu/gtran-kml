var gtran = require('../src/script.js');
var fs = require('fs');
var logger = require('log4js').getLogger();

var chai = require('chai');
var expect = chai.expect;

describe('KML module', function() {

    var saveName = 'test/result/test.kml';

    var kmlData = 'test/data/test.kml';

    var geojson = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {"type":"Point","coordinates":[-70.2532459795475,43.6399758607149]},
            'properties': {
              'id': 1,
              'name': 'test'
            }
        }]
    };

    it('should save the geojson as a KML file with Q.', function() {
        gtran.setPromiseLib(require('q'));
        gtran.fromGeoJson(geojson, saveName).then(function(file) {
            expect(file).to.be.equal(saveName);

            // if(fs.statSync(saveName)) { fs.unlinkSync(saveName); }
        })
        .catch(function(err) {
            logger.error(err);
        });
    });

    it('should load the kml file and convert it into a geojson.', function() {
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
