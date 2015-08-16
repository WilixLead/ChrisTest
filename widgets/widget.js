function Widget(name, type, properties, isPreview){
  if( typeof(name) == 'object' )
    return this.populate(name);
  
  this.name = name; // Widget name
  this.type = type; // Widget type/class can be ARRAY!
  this.properties = {};
  
  if( !isPreview )
    this.properties.wid = this._getNewWid();
};

// Prototype

Widget.prototype = {
  control: function(){
    console.warn('control not implemented yet in widget "' + this.name + '"');
  },
  update: function(){
    console.warn('update not implemented yet in widget "' + this.name + '"');
  },
  event: function(data){ // This method send event to agency
    widgets.response( $.extend({wid: this.properties.wid}, data) );
  },
  
  toWorksheet: function(){
    console.warn('toWorksheet not implemented yet in widget "' + this.name + '"');
  },
  toPreview: function(){
    console.warn('Preview not implemented yet in widget "' + this.name + '"');
  },
  toJSON: function(){
    var data = this.properties;
    data.name = this.name;
    data.fabricView = this._box.toJSON();
    delete data.fabricView.objects;
    return JSON.stringify(data);
  },
  
  populate: function(options){
    if( !options.name )
      return console.warn('Can\'t build widget. Widget name not set!');
    
    var widgetName = 'Widget' + options.name;
    var fabricProp = options.fabricView ? options.fabricView : {};
    fabricProp = $.extend({ left: 10, top: 10, width: 50, height: 50 }, fabricProp);
    
    delete options.name;
    delete fabricProp.objects;
    options.fabricView = fabricProp;
    
    var widget = new window[widgetName](options);
    
    return widget;
  },
  
  /**
   * Return true if wid exist
   * @param wid
   * @returns {Boolean}
   */
  widExist: function(wid){
    var free = true;
    widgets.mainCanvas.forEachObject(function(o){
      if( o.wid && wid == o.wid )
          free = false;
    });
    return !free;
  },
  
  /**
   * Return new StaticCanvas for preview
   * @returns Object{ canvas: fabric.StaticCanvas, dom: Object }
   */
  _getPreviewContainer: function(){
    var dom = $('<div class="widget-wrapper"><canvas id="PrevWidget' + this.name + '" class="widget-preview"></canvas></div>');
    $(widgets.previewContainer).append(dom);
    var canvas = new fabric.StaticCanvas('PrevWidget' + this.name, {});
    var _this = this;
    $(dom).on('click', function(){ new window['Widget' + _this.name](); });
    
    return {canvas: canvas, dom: dom};
  },
  
  /**
   * Return worksheet canvas
   * @returns fabric.Canvas
   */
  _getWorksheetContainer: function(){
    return widgets.mainCanvas;
  },
  
  /**
   * Return WidgetBox fabric object
   * @param objects
   * @param options
   * @returns {fabric.WidgetBox}
   */
  _getWidgetBox: function(objects, options){
    return new fabric.WidgetBox(objects, options);
  },
  
  /**
   * Return new wid for widget
   * @returns string
   */
  _getNewWid: function(){
    var wid = this.name;
    for( var i = 0; i < 1000; i++ ){
      if( !this.widExist(wid + i) ) break;
    }
    wid = wid + i;
    return wid;
  },
  
  /**
   * Return path for widget directory
   * @returns {String}
   */
  _widgetPath: function(){
    return './widgets/' + this.name.toLowerCase();
  },
  
  types: {
    // Widget types
    LIGHT: 'LIGHT',
    SWITCH: 'SWITCH',
    SENSOR: 'SENSOR',
    LIGHT_SENSOR: 'LIGHT_SENSOR',
    DIMMER: 'DIMMER',
  }
};

// fabric coustom class for widget group
fabric.WidgetBox = fabric.util.createClass(fabric.Group, {
  type: 'widget-box',

  initialize: function(element, options) {
    this.callSuper('initialize', element, options);
    options && this.set('wid', options.wid);
  },

  toObject: function() {
    return fabric.util.object.extend(this.callSuper('toObject'), { wid: this.wid });
  }
});
fabric.WidgetBox.fromObject = function(object){
  return new fabric.WidgetBox();
};
fabric.WidgetBox.setupState = function(){  }