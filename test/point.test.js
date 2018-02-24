const gtran = require("../src");
const fs = require("fs");

const chai = require("chai");
const expect = chai.expect;

describe("KML module - Point", function() {
  const saveName = "test/result/test_point.kml";
  const saveNameSymbol = "test/result/test_point_symbol.kml";
  const kmlData = "test/data/test_point.kml";

  var pointSymbol = {
    color: [255, 0, 0],
    alpha: 255,
    scale: 1,
    icon: "http://maps.google.com/mapfiles/kml/shapes/square.png"
  };

  var geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [-70.2532459795475, 43.6399758607149]
        },
        properties: {
          id: 1,
          sdf: null,
          Name: "test"
        }
      }
    ]
  };

  it("should save the point geojson as a KML file.", done => {
    gtran
      .fromGeoJson(geojson, saveName, {
        symbol: pointSymbol,
        name: "Name"
      })
      .then(function(file) {
        expect(fs.statSync(saveName)).to.exist;
        done();
      })
      .catch(done);
  });

  it("should save the point geojson as a KML file with conditional symbols.", done => {
    gtran
      .fromGeoJson(geojson, saveNameSymbol, {
        symbol: () => pointSymbol,
        name: "Name"
      })
      .then(function(file) {
        expect(fs.statSync(saveName)).to.exist;
        done();
      })
      .catch(done);
  });

  it("should load the point kml file and convert it into a geojson.", done => {
    gtran
      .toGeoJson(kmlData)
      .then(function(geojson) {
        // Get features
        expect(geojson.features.length).to.be.equal(4);

        // Check Data tag
        expect(geojson.features[0].properties).has.property("id");
        expect(geojson.features[0].properties.id).to.be.equal("1");

        // Check name and description
        expect(geojson.features[1].properties).has.property("name");
        expect(geojson.features[1].properties.name).to.be.equal("Point2");
        expect(geojson.features[1].properties).has.property("description");
        expect(geojson.features[1].properties.description).to.be.equal("test");

        // Check SimpleData tag
        expect(geojson.features[2].properties).has.property("id");
        expect(geojson.features[2].properties.id).to.be.equal(1);

        done();
      })
      .catch(done);
  });
});
