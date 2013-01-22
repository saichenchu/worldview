/*
 * NASA Worldview
 * 
 * Copyright (C) 2011 - 2013 United States Government as represented by the 
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 */

OpenLayers.Tile.Canvas = OpenLayers.Class(OpenLayers.Tile.Image, 
/** @lends OpenLayers.Tile.Canvas# */
{
	
	/**
	 * Element that contains the canvas to draw the tile. Initially set to 
	 * null and created after the tile has been loaded. Set back to null
	 * when clear() is invoked.
	 *
	 * @private
	 */
	canvas: null,
	
	/**
	 * FIXME
	 */
	canvasContext: null,
	
	/**
	 * Canvas tile generator.
	 * 
	 * <p>
	 * The default tile generator, <code>OpenLayers.Tile.Image</code> renders
	 * each tile in an image element. This generator is simiar except that it
	 * uses canvas elements instead. This can be used in a layer by providing
	 * an instance at instantiation:
	 * </p>
	 * 
	 * <pre>
	 * var myLayer = new OpenLayers.Layer.WMTS({
	 *     name: "My Layer",
	 *     tileClass: OpenLayers.Tile.Canvas, 
	 *     ...
	 * });
	 * </pre>
	 * 
	 * <p>
	 * To apply a lookup table to dynamically change the colors of the tile, 
	 * set the <code>lookupTable</code> property in <code>OpenLayers.Layer</code>
	 * with a mapping of RGBA integer values to RGBA integer values. Example:
	 * </p>
	 * 
	 * <pre>
	 * var grn = { r: 0x00, g: 0xff, b: 0xff, a: 0xff };
	 * var red = { r: 0xff, g: 0x00, b: 0x00, a: 0xff };
	 * 
	 * var grnInt = ( grn.a << 24 | grn.b << 16 | grn.g << 8 | grn.r );
	 * var redInt = ( red.a << 24 | grn.b << 16 | grn.g << 8 | grn.r );
	 * 
	 * // Map green to blue
	 * myLayer.lookupTable = {
	 *     grnInt: redInt
	 * };
	 * </pre>
	 * 
	 * <p>
	 * Parameter information copied directly from 
	 * <code>OpenLayers.Tile.Image</code>.
	 * </p>
	 * 
	 * @class
	 * @constructs
     * @param {OpenLayers.Layer} layer layer that the tile will go in.
     * @param {OpenLayers.Pixel} position 
     * @param {OpenLayers.Bounds} bounds 
     * @param {String} url Deprecated. Remove me in 3.0.
     * @param {OpenLayers.Size} size
     * @param {Object} options
	 */
	initialize: function(layer, position, bounds, url, size, options) {
		OpenLayers.Tile.Image.prototype.initialize.apply(this, arguments);
	},
	
	/**
	 * See <code>OpenLayers.Tile.Image</code>.
	 * 
	 * <p>
	 * Also sets the canvas element to null
	 * </p>
	 */
	destroy: function() {
		OpenLayers.Tile.Image.prototype.destroy.apply(this, arguments);	
		if ( this.canvas ) {
			this.canvas = null;
		}
	},
		
	/**
	 * See <code>OpenLayers.Tile.Image</code>.
	 * 
	 * <p>
	 * Also hides the canvas element.
	 * </p>
	 */
	clear: function() {
		OpenLayers.Tile.Image.prototype.clear(this, arguments);
		if ( this.canvas ) {
			this.canvas.style.visibility = "hidden";
			OpenLayers.Element.removeClass(this.canvas, "olImageLoadError");
		}
	},
		
	/**
	 * Returns the canvas element by creating one if necessary. Copy over the
	 * style elements that OpenLayers.Tile.Image object applies to the image 
	 * element to the canvas element.
	 * 
	 * @private
	 */
	getCanvas: function() {
		var image = this.getImage();
		var style;
		
		if ( !this.canvas ) {
			this.canvas = document.createElement("canvas");
			this.canvas.id = "OpenLayers.Tile.Canvas." + this.id;
			this.canvas.className = "olTileImage";
			
			style = this.canvas.style;
			if ( this.frame ) {
				style.left = image.style.left;
				style.top = image.style.top;
				style.width = image.style.width;
				style.height = image.style.height;
			}
			style.visibility = image.style.visibility;
			style.opacity = image.style.opacity;
			style.filter = image.style.filter;
			style.position = image.style.position;
			if ( this.frame ) {
				this.frame.appendChild(this.canvas);
			}
		}
		return this.canvas;
	},
	
	/**
	 * Returns the element that contains the canvas.
	 * 
	 * @return {element} if contained in the frame div, returns the frame div,
	 * otherwise returns the canvas element.
	 */
	getTile: function() {
		var canvas = this.getCanvas();
		return this.frame ? this.frame : canvas;
	},

	/**
	 * Draws the loaded image to the canvas and applies a lookup table if
	 * provided by the layer.
	 * 
	 * @private
	 */
	onImageLoad: function() {
        var i;
        var imageData;
        var lookup;
        var lookupTable;
 		var pixels;
 		var color;
 		 		
	    var graphics = this.canvas.getContext("2d");
         
        OpenLayers.Event.stopObservingElement(this.imgDiv);
		
		this.canvas.width = this.imgDiv.width;
		this.canvas.height = this.imgDiv.height;
		
		graphics.drawImage(this.imgDiv, 0, 0);
		
		if ( this.layer.lookUpTable ) {
			lookupTable = this.layer.lookUpTable;
			imageData = graphics.getImageData(0, 0, this.canvas.width, 
				this.canvas.height);
			pixels = new Uint32Array(imageData.data);
			
			for ( i = 0; i < pixels.length; i++ ) {
				color = lookupTable[pixels[i]];
				if ( color ) {
					pixels[i] = color;
				}
			}
		}
		
		this.canvas.style.visibility = "inherit";
		this.canvas.style.opacity = this.layer.opacity;
		
		this.isLoading = false;
		this.canvasContext = null;
		this.events.triggerEvent("loadend");
	},
	
	/**
	 * FIXME
	 * 
	 * @private
	 */
	onImageError: function() {
			
	},
	
	/**
	 * Name of this class per OpenLayers convention.
	 */
	CLASS_NAME: "OpenLayers.Tile.Canvas"
	
});