var widgets = { 
  previewContainer: '#widget-list',
  worksheetContainer: '#worksheet',
  editorMode: true,
  
  registred: [
    'Light',
  ],
  
  worksheetWidgets: {},
  
  init: function(){
    // Configure main canvas
    widgets.mainCanvas = new fabric.Canvas('worksheet-canvas', {
      hoverCursor: 'pointer',
      selection: false
    });
    
    widgets.mainCanvas.on('object:selected', function(object){
      if( object.target.wid ){
        var widget = widgets.worksheetWidgets[object.target.wid];
        $('#prop-list .form-group').remove();
        $.each(widget.properties, function(prop, val){
          if( prop == 'fabricView' )
            return ;
          var tpl = $('<div class="form-group"><!-- PROP ' + prop + ' -->\
                <label class="col-sm-6 control-label text-right">' + prop + '</label>\
                <div class="col-sm-6">\
                  <input type="text" class="form-control input-sm"\
                    name="' + prop + '" value="' + val + '" data-wid="' + widget.properties.wid + '">\
                </div>\
            </div><!-- END GROUP -->');
          $(tpl).find('input').on('change', function(){
            var props = {};
            $('#prop-list .form-group input').each(function(i, obj){
              props[$(obj).attr('name')] = $(obj).val();
            });
            
            if( widget.properties.wid != props.wid && Widget.prototype.widExist(props.wid) ){
              $('#prop-list [name="wid"]').parents('.form-group').addClass('has-error');
              return;
            }else
              $('#prop-list [name="wid"]').parents('.form-group').removeClass('has-error');
            
            widgets.worksheetWidgets[$(this).attr('data-wid')].update(props);
          })
          $('#prop-list').append(tpl);
        })
      }else{
        $('#prop-list .form-group').remove();
      }
    })
    
    $(window).on('resize', function(){
      var w = $(window).width() - $('#prop-list-wrap').outerWidth();
      $('#worksheet').width(w - 25);
      $('#worksheet').height( $(window).innerHeight() - $('#toolbar').height() - 10 );
      
      widgets.mainCanvas.setWidth($('#worksheet').width());
      widgets.mainCanvas.setHeight($('#worksheet').height());;
      widgets.mainCanvas.renderAll();
    });
    
    setTimeout(function(){
      $(window).trigger('resize');
      $(window).trigger('resize');
      widgets.loadWorksheet(widgets.disableEditor);
    }, 1000);

    widgets.registred.forEach(function(winame){
      widgets.initWidget(winame);
    });
    
    $(document).on('keyup', function(event){
      if( event.keyCode != 46 ) // 46 - is delete key
        return ;
      
      var activeObject = widgets.mainCanvas.getActiveObject(),
          activeGroup = widgets.mainCanvas.getActiveGroup();

      if (activeGroup) {
        var objectsInGroup = activeGroup.getObjects();
        widgets.mainCanvas.discardActiveGroup();
        objectsInGroup.forEach(function(object) {
          widgets.mainCanvas.remove(object);
        });
      }
      else if (activeObject) {
        widgets.mainCanvas.remove(activeObject);
      }
    })
  },
  
  enableEditor: function(){
    widgets.editorMode = true;
    widgets.mainCanvas.selection = true;
    widgets.mainCanvas.forEachObject(function(o) {
      o.selectable = true;
    });
    $('#editorModeBtn').addClass('btn-success').removeClass('btn-warning');
    $('#editorModeBtn span').addClass('fa-play').removeClass('fa-pause');
  },
  
  disableEditor: function(){
    widgets.editorMode = false;
    widgets.mainCanvas.discardActiveObject();
    widgets.mainCanvas.selection = false;
    widgets.mainCanvas.forEachObject(function(o) {
      o.selectable = false;
    });
    $('#editorModeBtn').addClass('btn-warning').removeClass('btn-success');
    $('#editorModeBtn span').addClass('fa-pause').removeClass('fa-play');
  },

  toggleEditorMode: function(){
    $('#prop-list .form-group').remove();
    if( widgets.editorMode )
      widgets.disableEditor();
    else
      widgets.enableEditor();
  },
 
  saveWorksheet: function(callback){
    var data = { widgets: {}, objects: {} };
    widgets.mainCanvas.forEachObject(function(o) {
      if( o.wid ) // Object is widget
        data.widgets[o.wid] = widgets.getWidgetByWid(o.wid).toJSON();
    });
    data.canvas = widgets.mainCanvas.toJSON();
    
    $.post('/storage.php', {'save': data}, function(data){
      if( callback )
        callback(data == 'ok' ? true : false);
    });
  },
  
  loadWorksheet: function(callback){
    var widsArray = [];

    $.get('/storage.php', function(data){
      var json = JSON.parse(data);
      widgets.mainCanvas.loadFromJSON(json.canvas, 
      function(){ // When load done
        widgets.mainCanvas.forEachObject(function(o) {
          if( o.wid ) o.remove();
        });
        widsArray.forEach(function(wi){ new Widget(wi) });
        widgets.mainCanvas.renderAll();
        callback && callback();
      }, 
      function(o, object) { // when object ready
        // `o` = json object
        // `object` = fabric.Object instance
        if( o.wid )
          widsArray.push(JSON.parse(json.widgets[o.wid]));
      });
    });
  }
};

widgets.getWidgetByWid = function(wid){
  var found = undefined;
  $.each(widgets.worksheetWidgets, function(id, object){
    if( id == wid )
      found = object;
  });
  return found;
}

widgets.initWidget = function(name){
  //$.getScript("/widgets/" + name.toLowerCase() + "/" + name.toLowerCase() + ".js" ).done(function(script) {
    var widgetFnName = 'Widget' + name;
    if( typeof window[widgetFnName] != 'undefined' ){
      var wi = new window[widgetFnName]({}, true);
    }
  //});
};

widgets.exec = function(command){
  var wid = command.wid;
  if( !widgets.worksheetWidgets[wid] )
    return widgets.response({ error: widgets.errors.WIDGET_NOT_FOUND() });
  
  return widgets.worksheetWidgets[wid].control(command);
}

widgets.response = function(data){
  console.info('RESPONSE', data);
}

widgets.errors = {
  WIDGET_NOT_FOUND: function(msg){ return {code: 1, message: !msg ? 'Widget not found' : msg} },
};

$(function(){ // On document ready
  widgets.init();
});
