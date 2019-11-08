const et = require("elementtree");

exports.addTo = function (kmlContent, symbols, featureStyleKey) {
  var kml = et.parse(kmlContent);

  for (const id in symbols) {
    addSymbol(kml, symbols[id].geomType, symbols[id].symbol, id);
  }

  addFeatureSymbol(kml, featureStyleKey);

  return kml.write();
};

function addFeatureSymbol(kml, featureStyleKey) {
  kml.findall(".//Placemark").forEach(place => {
    const styleId = place.findtext(
      `./ExtendedData/Data[@name="${featureStyleKey}"]/value`
    );
    const placeStyle = et.SubElement(place, "styleUrl");
    placeStyle.text = '#' + (styleId || featureStyleKey);

    // Clean up ExtendedData styleId.
    let extendedData = place.find('./ExtendedData');
    extendedData.remove(extendedData.find(`./Data[@name="${featureStyleKey}"]`));
    if (extendedData.findall('./*').length === 0) {
      place.remove(extendedData);
    }
  });
}

function addSymbol(kml, geomType, symbol, id = "kml_symbol") {
  const style = et.SubElement(kml.find("Document"), "Style");
  style.attrib.id = id;

  switch (geomType) {
    case "Point":
      addPointSymbol(et.SubElement(style, "IconStyle"), symbol);
      break;
    case "Polygon":
      addPolygonSymbol(et.SubElement(style, "PolyStyle"), symbol);
      break;
    case "LineString":
      addLineStringSymbol(et.SubElement(style, "LineStyle"), symbol);
      break;
    default:
      throw new Error("Geometry type unsupported.");
  }
}

function addPointSymbol(styleNode, symbol) {
  if ("color" in symbol) {
    var colorNode = et.SubElement(styleNode, "color");
    colorNode.text = toKmlColor(symbol);
  }

  if ("scale" in symbol) {
    var scaleNode = et.SubElement(styleNode, "scale");
    scaleNode.text = symbol.scale.toString();
  }

  if ("icon" in symbol) {
    var iconNode = et.SubElement(styleNode, "Icon");
    var hrefNode = et.SubElement(iconNode, "href");
    hrefNode.text = symbol.icon;
  }

  return styleNode;
}

function addPolygonSymbol(styleNode, symbol) {
  if ("color" in symbol) {
    var colorNode = et.SubElement(styleNode, "color");
    colorNode.text = toKmlColor(symbol);
  }

  if ("fill" in symbol) {
    var fillNode = et.SubElement(styleNode, "fill");
    fillNode.text = symbol.fill ? "1" : "0";
  }

  if ("outline" in symbol) {
    var outlineNode = et.SubElement(styleNode, "outline");
    outlineNode.text = symbol.outline ? "1" : "0";
  }

  return styleNode;
}

function addLineStringSymbol(styleNode, symbol) {
  if ("color" in symbol) {
    var colorNode = et.SubElement(styleNode, "color");
    colorNode.text = toKmlColor(symbol);
  }

  if ("width" in symbol) {
    var widthNode = et.SubElement(styleNode, "width");
    widthNode.text = symbol.width.toString();
  }

  return styleNode;
}

function toKmlColor(symbol) {
  switch (typeof symbol.color) {
    case "string":
      if (symbol.color.length === 4) {
        symbol.color = symbol.color.slice(0, 1) + "0" + symbol.color.slice(1);
        symbol.color = symbol.color.slice(0, 3) + "0" + symbol.color.slice(2);
        symbol.color = symbol.color.slice(0, 5) + "0" + symbol.color.slice(3);
      }
      var color =
        symbol.color.substr(5, 2) +
        symbol.color.substr(3, 2) +
        symbol.color.substr(1, 2);
      break;
    case "object":
      var color =
        getFullHexagonValue(symbol.color[2]) +
        getFullHexagonValue(symbol.color[1]) +
        getFullHexagonValue(symbol.color[0]);

      break;
    default:
      throw new Error("Given color is invalid.");
  }

  color = "alpha" in symbol ? symbol.alpha.toString(16) + color : "ff" + color;

  return color;
}

function getFullHexagonValue(integer) {
  var str = integer.toString(16);
  return str.length < 2 ? "0" + str : str;
}
