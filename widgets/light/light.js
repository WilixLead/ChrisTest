function WidgetLight(properties, isPreview){
  Widget.call(this, 'Light', this.types.LIGHT, properties, isPreview);
  
  this.properties.state = false;
  
  this.properties = $.extend(this.properties, properties);
  
  // -------------------------------------------------
  
  this.control = function(params){
    this.properties.state = params.state;
    this.update();
  }
  
  this.update = function(prop){
    if( prop ){
      if( prop.wid && prop.wid != this.properties.wid ){
        this._box.wid = prop.wid;
        widgets.worksheetWidgets[prop.wid] = this;
        delete widgets.worksheetWidgets[this.properties.wid];
      }
      this.properties = $.extend(this.properties, prop);
    }
    this.light(this.properties.state);
  }

  this.light = function(mode){
    if( widgets.editorMode )
      return;
    
    console.log('Light!', mode);
    if( mode == false )
      this.properties.state = false;
    else if( mode == true )
      this.properties.state = true;
    else if( mode == undefined )
      this.properties.state = !this.properties.state;
    
    if( this.properties.state ) // If light should be ON 
      this._vLightRect.fill.offsetX = -50;
    else
      this._vLightRect.fill.offsetX = 0;
    
    this.canvas.renderAll();
    this.event({state: this.properties.state});
  }

  // Service functions
  this.toWorksheet = function(viewOptions){
    var _this = this;
    _this.canvas = this._getWorksheetContainer();
    _this._vLightRect = new fabric.Rect({left: 0, right: 0, width: 50, height: 50});

    viewOptions = $.extend({ wid: _this.properties.wid }, viewOptions);
    
    _this._box = this._getWidgetBox([_this._vLightRect], viewOptions);
    _this.canvas.add(_this._box);

    fabric.util.loadImage(this._widgetPath() + '/img/light.png', function(img) {
      _this._vLightRect.fill = new fabric.Pattern({
        source: img,
        repeat: 'no-repeat',
        offsetX: 0,
        offsetY: 0,
      });
      _this.update();
      _this.canvas.renderAll();
    });
    
    _this._box.on('mousedown', function(){ _this.light() });
    _this._box.on('mouseup', function(){  });
    
    widgets.worksheetWidgets[_this.properties.wid] = this;
  }

  this.toPreview = function(){
    var container = this._getPreviewContainer();
    container.canvas.setWidth(50);
    container.canvas.setHeight(50);
    $(container.dom).width(50).height(50);
    
    var rect = new fabric.Rect({top: 0, left: 0, width: 50, height: 50, fill: 'grey'});
    
    fabric.util.loadImage(this._widgetPath() + '/img/light.png', function(img) {
      rect.fill = new fabric.Pattern({
        source: img,
        repeat: 'no-repeat',
        offsetX: 0,
        offsetY: 0,
      });
      container.canvas.renderAll();
    }); 
    container.canvas.add(rect);
  }
  
  if( isPreview )
    this.toPreview();
  else
    this.toWorksheet( this.properties.fabricView ? this.properties.fabricView : undefined );
  
};
Object.setPrototypeOf(WidgetLight.prototype, Widget.prototype);