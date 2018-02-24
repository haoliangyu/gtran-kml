const gtran = require("../src");
const fs = require("fs");

const chai = require("chai");
const expect = chai.expect;

describe("KML module - Polyline", function() {
  var saveName = "test/result/test_polyline.kml";

  var kmlData = "test/data/test_polyline.kml";

  var polylineSymbol = {
    color: "#2dcd86",
    width: 2
  };

  var geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [[-70.2, 43.6], [-74.2, 40.6]]
        },
        properties: {
          id: 1,
          name: "test"
        }
      }
    ]
  };

  it("should save the polyline geojson as a KML file.", done => {
    gtran
      .fromGeoJson(geojson, saveName, {
        symbol: polylineSymbol
      })
      .then(function(file) {
        expect(fs.statSync(saveName)).to.exist;
        done();
      })
      .catch(done);
  });

  it("should load the polyline kml file and convert it into a geojson.", done => {
    gtran
      .toGeoJson(kmlData)
      .then(function(geojson) {
        // Get features
        expect(geojson.features.length).to.be.equal(1);

        // Check name and description
        expect(geojson.features[0].properties).has.property("name");
        expect(geojson.features[0].properties.name).to.be.equal("test");
        expect(geojson.features[0].properties).has.property("description");
        expect(geojson.features[0].properties.description).to.be.equal("test2");

        done();
      })
      .catch(done);
  });
});
