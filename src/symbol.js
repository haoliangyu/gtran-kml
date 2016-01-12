var et = require('elementtree');

exports.addTo = function(kmlContent, geomType, symbol) {
    var kml = et.parse(kmlContent);

    // Add symbol style
    var style = et.SubElement(kml.find('Document'), 'Style');
    style.attrib.id = 'kml_symbol';

    if(symbol) {
        switch (geomType) {
            case 'Point':
                var geomStyle = et.SubElement(style, 'IconStyle');
                addPointSymbol(geomStyle, symbol);
                break;
            case 'Polygon':
                var geomStyle = et.SubElement(style, 'PolyStyle');
                addPolygonSymbol(geomStyle, symbol);
                break;
            case 'LineString':
                var geomStyle = et.SubElement(style, 'LineStyle');
                addLineStringSymbol(geomStyle, symbol);
                break;
            default:
                throw new Error('Geometry type unsupported.');
        }
    }

    kml.findall('.//Placemark').forEach(function(place) {
        var placeStyle = et.SubElement(place, 'styleUrl')
        placeStyle.text = '#kml_symbol';
    });

    return kml.write();
};

function addPointSymbol(styleNode, symbol) {
    if('color' in symbol) {
        var colorNode = et.SubElement(styleNode, 'color');
        colorNode.text = toKmlColor(symbol);
    }

    if('scale' in symbol) {
        var scaleNode = et.SubElement(styleNode, 'scale');
        scaleNode.text = symbol.scale.toString();
    }

    if('icon' in symbol) {
        var iconNode = et.SubElement(styleNode, 'Icon');
        var hrefNode = et.SubElement(iconNode, 'href');
        hrefNode.text = symbol.icon;
    }

    return styleNode;
}

function addPolygonSymbol(styleNode, symbol) {
    if('color' in symbol) {
        var colorNode = et.SubElement(styleNode, 'color');
        colorNode.text = toKmlColor(symbol);
    }

    if('fill' in symbol) {
        var fillNode = et.SubElement(styleNode, 'fill');
        fillNode.text = symbol.fill ? '1' : '0';
    }

    if('outline' in symbol) {
        var outlineNode = et.SubElement(styleNode, 'outline');
        outlineNode.text = symbol.outline ? '1' : '0';
    }

    return styleNode;
}

function addLineStringSymbol(styleNode, symbol) {
    if('color' in symbol) {
        var colorNode = et.SubElement(styleNode, 'color');
        colorNode.text = toKmlColor(symbol);
    }

    if('width' in symbol) {
        var widthNode = et.SubElement(styleNode, 'width');
        widthNode.text = symbol.width.toString();
    }

    return styleNode;
}

function toKmlColor(symbol) {
    switch (typeof symbol.color) {
        case 'string':
            if (symbol.color === 4) {
                symbol.color.splice(1, 0, '0');
                symbol.color.splice(2, 0, '0');
                symbol.color.splice(3, 0, '0');
            }
            var color = symbol.color.substr(5, 2) +
                        symbol.color.substr(3, 2) +
                        symbol.color.substr(1, 2);
            break;
        case 'object':
            var color = getFullHexagonValue(symbol.color[2]) +
                        getFullHexagonValue(symbol.color[1]) +
                        getFullHexagonValue(symbol.color[0]);

            break;
        default:
            throw new Error('Given color is invalid.');
    }

    color = 'alpha' in symbol ? symbol.alpha.toString(16) + color : 'ff' + color;

    return color;
}

function getFullHexagonValue(integer) {
  var str = integer.toString(16);
  return str.length < 2 ? '0' + str : str;
}
