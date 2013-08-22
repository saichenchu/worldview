/*
 * NASA Worldview
 * 
 * This code was originally developed at NASA/Goddard Space Flight Center for
 * the Earth Science Data and Information System (ESDIS) project. 
 *
 * Copyright (C) 2013 United States Government as represented by the 
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 */
Worldview.namespace("DataDownload.Layers");

Worldview.DataDownload.Layers.Button = function(model, maps, config) {

    var LAYER_NAME = "DataDownload_Button";

    var IMAGE_SELECT = "images/data-download-plus-button-cyan.svg";
    var IMAGE_UNSELECT = "images/data-download-minus-button-blue.svg";  
    
    var LABEL_STYLE = {
        fontFamily: "helvetica, sans-serif",
        fontColor: "#ffffff",
        fontWeight: "bold",
        labelOutlineColor: "black",
        labelOutlineWidth: 2,
        labelOutlineOpacity: 0.7,    
    };
    
    var self = {};
    
    self.EVENT_HOVER_OVER = "hoverover";
    self.EVENT_HOVER_OUT = "hoverout";
    
    self.events = Worldview.Events();
    
    var init = function() {
        $.each(maps.projections, function(index, map) {
            map.events.register("zoomend", self, resize);
        });
    };
    
    self.update = function(results) {
        var layer = getLayer();
        layer.removeAllFeatures();
        var features = [];
        $.each(results.granules, function(index, granule) {
            var centroid = granule.centroid[model.crs];
            if ( centroid ) {
                var feature = new OpenLayers.Feature.Vector(centroid, {
                    granule: granule,
                    label: granule.label
                });
                features.push(feature);    
            }
        });
        layer.addFeatures(features);
    };
    
    self.clear = function() {
        var layer = Worldview.Map.getLayerByName(maps.map, LAYER_NAME);
        if ( layer ) {
            layer.removeAllFeatures();
        }
    };
    
    self.dispose = function() {
        $.each(maps.projections, function(index, map) {
            var layer = Worldview.Map.getLayerByName(map, LAYER_NAME);
            if ( layer ) {
                map.removeControl(layer.hoverControl);
                map.removeLayer(layer);   
            }  
        });     
    };
    
    var createLayer = function() {
        size = getSize();
        var styleMap = {
            externalGraphic: IMAGE_SELECT
        };
        
        layer = new OpenLayers.Layer.Vector(LAYER_NAME, {
            styleMap: new OpenLayers.StyleMap(getStyle())
        });
        layer.div.setAttribute("data-layer-name", LAYER_NAME);
        maps.map.addLayer(layer);
        
        var hoverControl = new Worldview.Map.HoverControl(layer);
        hoverControl.events.on({
            "hoverover": function(event) {
                self.events.trigger(self.EVENT_HOVER_OVER, event);
                onHoverOver(event);
            },
            "hoverout": function(event) {
                self.events.trigger(self.EVENT_HOVER_OUT, event);
                onHoverOut(event);
            }
        });
        maps.map.addControl(hoverControl);
        hoverControl.activate();
        layer.hoverControl = hoverControl;
       
        return layer;       
    };
    
    var getLayer = function(map) {
        map = map || maps.map;
        var layer = Worldview.Map.getLayerByName(map, LAYER_NAME);
        if ( !layer ) {
            layer = createLayer();
        }
        return layer;
    };
    
    var getSize = function() {
        var zoom = maps.map.getZoom();
        // Minimum size of the button is 15 pixels
        var base = 15;
        // Double the size for each zoom level
        var add = Math.pow(2, zoom);
        // But 32 pixels is the maximum size
        var size = Math.min(base + add, base + 32);
        return new OpenLayers.Size(size, size);
    };
    
    var getStyle = function(withLabel) {
        var size = getSize();
        var symbolizer = {
            externalGraphic: IMAGE_SELECT,
            graphicWidth: size.w,
            graphicHeight: size.h,
        };
        if ( withLabel ) {
            $.extend(true, symbolizer, LABEL_STYLE);
            symbolizer.labelYOffset = getLabelOffset();
        }
        return symbolizer;
    };
    
    var resize = function() {
        getLayer().styleMap = new OpenLayers.StyleMap(getStyle());
        layer.redraw();
    };
    
    var onHoverOver = function(event) {
        var style = getStyle(true);
        style.label = event.feature.attributes.granule.label;
        event.feature.style = style;
        getLayer().drawFeature(event.feature);    
    };
    
    var onHoverOut = function(event) {
        event.feature.style = undefined;
        getLayer().drawFeature(event.feature);
    };
        
    var getLabelOffset = function() {
        var buttonHeight = getSize().h;
        return ( buttonHeight / 2.0 ) + 10;
    };
    
    init();
    return self;
      
};