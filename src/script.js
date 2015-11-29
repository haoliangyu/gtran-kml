'use strict';

var promiseLib = require("./promise.js");
var symbol = require('./symbol.js');
var tokml = require('tokml');
var fs = require('fs');
var et = require('elementtree');

var Promise, readFile, writeFile;

exports.setPromiseLib = setPromiseLib;

exports.toGeoJson = function(fileName, options) {
    if (!Promise) { setPromiseLib(); }

    var promise = new Promise(function(resolve, reject) {
        if(!fs.statSync(fileName)) { reject('Give KML file does not exist.'); }

        var hasOptions = (typeof options === 'object');

        var encoding = 'utf-8';
        if(hasOptions && options.encoding !== undefined) {
            encoding = options.encoding;
        }

        return readFile(fileName, encoding).then(function(data) {
            var etree = et.parse(data),
                geojson = {
                    'type': 'FeatureCollection',
                    'features': []
                };

            var schemas = findSchemas(etree);
            var placemarks = etree.findall('.//Placemark');
            placemarks.forEach(function(placemark) {
                geojson.features.push({
                    type: 'feature',
                    geometry: getGeometry(placemark),
                    properties: getProperties(placemark, schemas)
                });
            });

            resolve(geojson);
        });
    });

    return promise;
};

exports.fromGeoJson = function(geojson, fileName, options) {
    if (!Promise) { setPromiseLib(); }

    var promise = new Promise(function(resolve, reject) {
        try {
            var kmlGeoJson = JSON.parse(JSON.stringify(geojson));

            for(var feature in kmlGeoJson.feature) {
                var description = '';
                for(var key in feature.properties) {
                    description += key + '=' + feature.properties[key] + '\n';
                }
                feature.kmlDescription = description;
            }

            var kmlContent = tokml(kmlGeoJson, {
                name: options && 'name' in options ? options.name : 'name',
                description: 'kmlDescription'
            });

            if(options && 'symbol' in options) {
                var geomType = getGeomType(kmlGeoJson);
                kmlContent = symbol.addTo(kmlContent, geomType, options.symbol);
            }

            if(fileName) {
                var fileNameWithExt = fileName;
                if(fileNameWithExt.indexOf('.kml') === -1) {
                    fileNameWithExt += '.kml';
                }

                writeFile(fileNameWithExt, kmlContent);
                resolve(fileNameWithExt);
            } else {
                resolve({
                    data: kmlContent,
                    format: 'kml'
                });
            }
        } catch(ex) {
            reject(ex);
        }
    });

    return promise;
};

function getGeomType(geojson) {
    // Assume there is only one geometry type in the geojson
    switch(geojson.features[0].geometry.type) {
        case 'Point':
        case 'Polygon':
        case 'LineString':
            return geojson.features[0].geometry.type;
        default:
            throw new Error('Geometry type unsupported.');
    }
}

function getGeometry(placemark) {
    var geomTag = placemark.find('./Point');
    if(geomTag) {
        return createGeometry('Point', geomTag.findtext('./coordinates'));
    }

    geomTag = placemark.find('./LineString');
    if(geomTag) {
        return createGeometry('LineString', geomTag.findtext('./coordinates'));
    }

    geomTag = placemark.find('./Polygon');
    if(geomTag) {
        var outRingCoors = geomTag.findtext('./outerBoundaryIs/LinearRing/coordinates');

        var inRingsCoors = [];
        geomTag.findall('./innerBoundaryIs/LinearRing/coordinates').forEach(function(node) {
            inRingsCoors.push(node.text);
        });

        return createGeometry('Polygon', outRingCoors, inRingsCoors);
    }
}

function createGeometry(geomType, outerCoorStr, innerCoorStr) {
    return {
        type: geomType,
        coordinates: getCoordinates(outerCoorStr, innerCoorStr)
    };
}

function getCoordinates(outCoorsdStr, inCoordsStrs) {
    var pointStrs = outCoorsdStr.split(' ');

    if (pointStrs.length == 1) {
        var coors = pointStrs[0].split(',');
        return [parseFloat(coors[0]), parseFloat(coors[1])];
    } else {
         var outPoints = [];
        pointStrs.forEach(function(pointStr) {
            var coors = pointStr.split(',');
            outPoints.push([parseFloat(coors[0]), parseFloat(coors[1])]);
        });

        if (!inCoordsStrs) { return outPoints; }

        var allPoints = [outPoints];
        inCoordsStrs.forEach(function (coordsStr) {
            var inPoints = [],
                pointStrs = coordsStr.split(' ');

            pointStrs.forEach(function(coordsStr) {
                var coors = coordsStr.split(',');
                inPoints.push([parseFloat(coors[0]), parseFloat(coors[1])]);
            });

            allPoints.push(inPoints);
        });

        return allPoints;
    }
}

function findSchemas(rootnode) {
    var schemaNodes = rootnode.findall('./Document/Schema');

    // considering if we have more than one schema
    if(schemaNodes.length > 0) {
        var schemas = {};
        schemaNodes.forEach(function(schemaNode) {
            var schema = {};

            // get the type of field
            schemaNode.findall('./SimpleField').forEach(function(fieldNode) {
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
    var name = placemark.findtext('./name');
    if(name) { properties.name = name; }

    // description
    var description = placemark.findtext('./description');
    if(description) { properties.description = description; }

    // schema data
    if(schemas) {
        var schemaDatasets = placemark.findall('./ExtendedData/SchemaData');
        schemaDatasets.forEach(function(schemaDataset) {
            var schema = schemas[schemaDataset.attrib.schemaURl.replace('#', '')],
                fields = schemaDataset.findall('./SimpleData');
            fields.forEach(function(field) {
                properties[field.attrib.name] = convert(field.text, schema[field.attrib.name]);
            });
        });
    }

    // simple data
    var fields = placemark.findall('./ExtendedData/Data');
    fields.forEach(function(field) {
        properties[field.attrib.name] = field.findtext('./value');
    });

    return properties;
}

function setPromiseLib(lib) {
    Promise = promiseLib.set(lib);
    readFile = promiseLib.promisify(fs.readFile);
    writeFile = promiseLib.promisify(fs.writeFile);
}
