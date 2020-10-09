const util = require("util");
const fs = require("fs");
const tokml = require("@maphubs/tokml");
const et = require("elementtree");
const md5 = require("./md5");
const symbol = require("./symbol.js");
const prettifyXml = require("prettify-xml");
const os = require("os");

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

// just to provide backwards compatibility
exports.setPromiseLib = () => {};

exports.toGeoJson = async (fileName, options = {}) => {
  if (!fs.statSync(fileName)) {
    throw new Error("Give KML file does not exist.");
  }

  const encoding = options.encoding || "utf-8";
  const data = await readFileAsync(fileName, encoding);
  const etree = et.parse(data),
    geojson = {
      type: "FeatureCollection",
      features: [],
    };

  const schemas = findSchemas(etree);
  const placemarks = etree.findall(".//Placemark");
  placemarks.forEach(function (placemark) {
    geojson.features.push({
      type: "feature",
      geometry: getGeometry(placemark),
      properties: getProperties(placemark, schemas),
    });
  });

  return geojson;
};

exports.fromGeoJson = async (geojson, fileName, options = {}) => {
  geojson = JSON.parse(JSON.stringify(geojson));

  const symbols = {};
  const featureStyleKey = options.featureStyleKey || "gtran-kml-style-id";

  geojson.features.forEach((feature) => {
    const symbol = {
      geomType: feature.geometry.type,
      symbol:
        typeof options.symbol === "function"
          ? options.symbol(feature)
          : options.symbol,
    };
    const id = md5(JSON.stringify(symbol));

    if (!symbols[id]) {
      symbols[id] = symbol;
    }

    feature.properties[featureStyleKey] = id;
  });

  let kmlContent = tokml(geojson, {
    name: options.name || "name",
    documentName: options.documentName || "My KML",
    documentDescription:
      options.documentDescription || "Converted from GeoJson by gtran-kml",
  });

  if (options.symbol) {
    kmlContent = symbol.addTo(kmlContent, symbols, featureStyleKey);
  }

  if (options.pretty) {
    kmlContent = prettifyXml(kmlContent, { indent: 2, newline: os.EOL });
  }

  if (fileName) {
    let fileNameWithExt = fileName;
    if (fileNameWithExt.indexOf(".kml") === -1) {
      fileNameWithExt += ".kml";
    }

    await writeFileAsync(fileNameWithExt, kmlContent);
    return fileNameWithExt;
  } else {
    return {
      data: kmlContent,
      format: "kml",
    };
  }
};

function getGeometry(placemark) {
  var geomTag = placemark.find("./Point");
  if (geomTag) {
    return createGeometry("Point", geomTag.findtext("./coordinates"));
  }

  geomTag = placemark.find("./LineString");
  if (geomTag) {
    return createGeometry("LineString", geomTag.findtext("./coordinates"));
  }

  geomTag = placemark.find("./Polygon");
  if (geomTag) {
    var outRingCoors = geomTag.findtext(
      "./outerBoundaryIs/LinearRing/coordinates"
    );

    var inRingsCoors = [];
    geomTag
      .findall("./innerBoundaryIs/LinearRing/coordinates")
      .forEach(function (node) {
        inRingsCoors.push(node.text);
      });

    return createGeometry("Polygon", outRingCoors, inRingsCoors);
  }
}

function createGeometry(geomType, outerCoorStr, innerCoorStr) {
  return {
    type: geomType,
    coordinates: getCoordinates(outerCoorStr, innerCoorStr),
  };
}

function getCoordinates(outCoorsdStr, inCoordsStrs) {
  var pointStrs = outCoorsdStr.trim().split(/\s+/);

  if (pointStrs.length == 1) {
    var coors = pointStrs[0].split(",");
    return [parseFloat(coors[0]), parseFloat(coors[1])];
  } else {
    var outPoints = [];
    pointStrs.forEach(function (pointStr) {
      var coors = pointStr.split(",");
      outPoints.push([parseFloat(coors[0]), parseFloat(coors[1])]);
    });

    if (!inCoordsStrs) {
      return outPoints;
    }

    var allPoints = [outPoints];
    inCoordsStrs.forEach(function (coordsStr) {
      var inPoints = [],
        pointStrs = coordsStr.split(" ");

      pointStrs.forEach(function (coordsStr) {
        var coors = coordsStr.split(",");
        inPoints.push([parseFloat(coors[0]), parseFloat(coors[1])]);
      });

      allPoints.push(inPoints);
    });

    return allPoints;
  }
}

function findSchemas(rootnode) {
  var schemaNodes = rootnode.findall("./Document/Schema");

  // considering if we have more than one schema
  if (schemaNodes.length > 0) {
    var schemas = {};
    schemaNodes.forEach(function (schemaNode) {
      var schema = {};

      // get the type of field
      schemaNode.findall("./SimpleField").forEach(function (fieldNode) {
        schema[fieldNode.attrib.name] = fieldNode.attrib.type;
      });

      schemas[schemaNode.attrib.id] = schema;
    });

    return schemas;
  }
}

function getProperties(placemark, schemas) {
  var properties = {};

  // name
  var name = placemark.findtext("./name");
  if (name) {
    properties.name = name;
  }

  // description
  var description = placemark.findtext("./description");
  if (description) {
    properties.description = description;
  }

  // schema data
  if (schemas) {
    var schemaDatasets = placemark.findall("./ExtendedData/SchemaData");
    schemaDatasets.forEach(function (schemaDataset) {
      var schema = schemas[schemaDataset.attrib.schemaUrl.replace("#", "")],
        fields = schemaDataset.findall("./SimpleData");
      fields.forEach(function (field) {
        properties[field.attrib.name] = convert(
          field.text,
          schema[field.attrib.name]
        );
      });
    });
  }

  // simple data
  var fields = placemark.findall("./ExtendedData/Data");
  fields.forEach(function (field) {
    properties[field.attrib.name] = field.findtext("./value");
  });

  return properties;
}

function convert(value, toType) {
  switch (toType) {
    case "int":
    case "uint":
    case "short":
    case "ushort":
      return parseInt(value);
    case "float":
    case "double":
      return parseFloat(value);
    case "bool":
      return value.toLowerCase() === "true";
    default:
      return value;
  }
}
