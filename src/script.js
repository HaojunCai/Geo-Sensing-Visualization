// Set the requirements for using esri js functionalities
require([
  "esri/Map",
  "esri/views/MapView", // for 2D map
  "esri/layers/FeatureLayer",
  "esri/widgets/LayerList",
  "esri/widgets/Home",
  "esri/widgets/Expand",
  "esri/widgets/Legend",
  "esri/layers/GroupLayer"], function(Map, MapView, FeatureLayer, LayerList, Home, Expand, Legend, GroupLayer) 
{
  // Define a variable for the map and set it with a basemap
  var map = new Map({
    basemap: "osm"
  });
  
  // Set the view with the preset map and other parameters
  var view = new MapView({
    container: "viewDiv",
    map: map,
    scale: 3500,
    center: [8.508427, 47.408380] // set ETH Honggerberg as the center
  });
  
  // Set up all attribute layers from Sensebox
  const tempLayer = new FeatureLayer({
    url: "https://services6.arcgis.com/1QUYJuIkNCO6Wsc9/arcgis/rest/services/tempLayer/FeatureServer/0",
    id: "temp",
    title: "Temperature",
    outFields: ["*"],
    visible: true
  });

  const humiLayer = new FeatureLayer({
    url: "https://services6.arcgis.com/1QUYJuIkNCO6Wsc9/arcgis/rest/services/humiLayer/FeatureServer/0",
    id: "humi",
    title: "Humidity",
    outFields: ["*"],
    visible: false
  });

  const illuLayer = new FeatureLayer({
    url: "https://services6.arcgis.com/1QUYJuIkNCO6Wsc9/arcgis/rest/services/illuLayer/FeatureServer/0",
    id: "illu",
    title: "Illumination",
    outFields: ["*"],
    visible: false
  }); 
  
  const pm10Layer = new FeatureLayer({
    url: "https://services6.arcgis.com/1QUYJuIkNCO6Wsc9/arcgis/rest/services/pm10Layer/FeatureServer/0",
    id: "pm10",
    title: "PM10",
    outFields: ["*"],
    visible: false
  });  

  const uviLayer = new FeatureLayer({
    url: "https://services6.arcgis.com/1QUYJuIkNCO6Wsc9/arcgis/rest/services/uviLayer/FeatureServer/0",
    id: "uvi",
    title: "UVI",
    outFields: ["*"],
    visible: false
  });  
  
  // Group all above attribute layers
  var senseDistriLayer = new GroupLayer({
    title: "Sensebox data distribution",
    visible: true,
    visibilityMode: "exclusive",
    layers: [uviLayer, pm10Layer, illuLayer, humiLayer, tempLayer]
  });

  // Define the popup info when clicking on Sensebox data point 
  var popupSensebox = {
    "title": "Station from Sensebox",
    content: [{
      type: "fields",
      fieldInfos: [{
        fieldName: "temp",
        label: "Temperature (°C)",
        visible: true 
      }, {
        fieldName: "humi",
        label: "Humidity (%)",
        visible: true 
      }, {
        fieldName: "lux",
        label: "Illumination (lx)",
        visible: true
      }, {
        fieldName: "pm10",
        label: "PM10 (μg/m³)",
        visible: true
      }]
    }]
  };

  // Define the popup info when clicking on Opensensemap data point 
  var popupOSM = {
    "title": "Station from Opensensemap",
    content: [{
      type: "fields",
      fieldInfos: [{
        fieldName: "boxName",
        label: "Box Name",
        visible: true
      }, {
        fieldName: "temp",
        label: "Temperature (°C)",
        visible: true 
      }, {
        fieldName: "humi",
        label: "Humidity (%)",
        visible: true
      }, {
        fieldName: "pm10",
        label: "PM10 (μg/m³)",
        visible: true
      }]
    }]
  }
  
  // Set a const for the attribute displayed above the point features
  const labelClass = {
  symbol: {
    type: "text",  
    color: "black",
    haloColor: "black",
    font: {  // autocast as new Font()
      family: "playfair-display",
      size: 12,
      weight: "bold"
    }
  },
  labelPlacement: "above-left",
  labelExpressionInfo: {
    expression: "($feature.speed) + 'm/s'"
    }
  };
  
  // Add a featurelayer for the data collected with the Sensebox
  const senseInfoLayer = new FeatureLayer({
    url: "https://services6.arcgis.com/1QUYJuIkNCO6Wsc9/arcgis/rest/services/geosensorLayer/FeatureServer/0",
    title: "Sensebox data info",
    id: "geosensorsLayer",
    outFields: ["*"],
    popupTemplate: popupSensebox,
    labelingInfo: labelClass,
    visible: false
  });
  
  // Add a featurelayer for the data from Opensensemap
  const osmLayer = new FeatureLayer({
   url: "https://services6.arcgis.com/1QUYJuIkNCO6Wsc9/arcgis/rest/services/opensenseMap/FeatureServer/0",
   title: "Opensensemap data info",
   id: "osmLayer",
   outFields: ["*"],
   popupTemplate: popupOSM,
   labelingInfo: labelClass,
   visible: false
 });
  
  // Add all featurelayers to the map. The order shown on the map is inverse to the adding order.
  map.layers.add(osmLayer)
  map.layers.add(senseInfoLayer)
  map.layers.add(senseDistriLayer)
  
  // Define the layerlist
  var layerList = new LayerList({
    view: view
  });

  // Add to the current view
  view.ui.add(layerList, {
    position: "bottom-left"
  });

  // Add a legend widget instance to the view and the window is expandable.
  const legend = new Expand({
    content: new Legend({
    view: view,
    style: "classic" // styles: 'card', 'classic'
    }),
    view: view,
    expanded: true
  });
  
  // Add a legend widget to the current view
  view.ui.add(legend, "top-right");
  
  // Create home widget
  var homeWidget = new Home({
    view: view
  });

  // Add the home widget to the current view
  view.ui.add(homeWidget, "top-left");
  
  // Create new expand-pane (box) to display some html text
  var div = document.createElement('div')
  div.className = 'expand-pane'

  // Create toggle Element "About Map", which can be opened and add text to be displayed
  var maptext = document.createElement('div')
  maptext.className = 'item'
  maptext.onclick = function() {
    this.classList.toggle('open')
  }
  maptext.innerHTML = document.getElementById("maptextTemplate").innerHTML
  div.appendChild(maptext)
  
  // Create toggle Element "Legal Notice", which can be opened and add text to be displayed
  var legalnotice = document.createElement('div')
  legalnotice.className = 'item'
  legalnotice.onclick = function() {
    this.classList.toggle('open')
  }
  legalnotice.innerHTML = document.getElementById("legaltextTemplate").innerHTML
  div.appendChild(legalnotice)
  
  // Create toggle Element "About us", which can be opened and add text to be displayed
  var abouttext = document.createElement('div')
  abouttext.className = 'item'
  abouttext.onclick = function() {
    this.classList.toggle('open')
   }
  abouttext.innerHTML = document.getElementById("abouttextTemplate").innerHTML
  div.appendChild(abouttext)

  // Create toggle Element "Privacy Notice", which can be opened and add text to be displayed
  var privacy = document.createElement('div')
  privacy.className = 'item'
  privacy.onclick = function() {
    this.classList.toggle('open')
  }
  privacy.innerHTML = document.getElementById("privacytextTemplate").innerHTML
  div.appendChild(privacy)

  // Create expand widget for text
  var helpexpand = new Expand({
    view: view,
    content: div,
  })

  // Add Text-Expand Button to the current view
  view.ui.add(helpexpand, 'top-left')
  
});
