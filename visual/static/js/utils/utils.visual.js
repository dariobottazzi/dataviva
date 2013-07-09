var visual = {};
visual.slide = {};
visual.popover = {};
visual.slide.timing = 0.75, // timing of page slides, in seconds

visual.format = {};
visual.format.text = function(text) {
  if (text.indexOf("cp_bra") == 0) {
    var arr = text.split("_")
    arr.shift()
    var loc = arr.shift()
    text = arr.join("_")
    return window[loc].name + " ("+format_name(text)+")"
  }
  else {
    return format_name(text)
  }
}

visual.format.number = function(obj) {
  if (typeof obj === "object") {
    var value = obj.value, name = obj.name
  }
  else {
    var value = obj, name = ""
  }
  
  var smalls = ["rca","rca_bra","rca_wld","distance","complexity"]
  
  if (smalls.indexOf(name) >= 0) {
    return d3.round(value,2)
  }
  else if (name == "year") {
    return value
  }
  else if (value.toString().split(".")[0].length > 4) {
    var symbol = d3.formatPrefix(value).symbol
    symbol = symbol.replace("G", "B") // d3 uses G for giga
    
    // Format number to precision level using proper scale
    value = d3.formatPrefix(value).scale(value)
    value = parseFloat(d3.format(".3g")(value))
    return value + symbol;
  }
  else {
    return d3.format(",f")(value)
  }
  
}

visual.ui = {}

visual.ui.tooltip = function(id,state) {
  if (state) {
    
    var text = {
      "controls_toggle": "Show/Hide Controls",
      "file_select": "Download this App",
      "help_select": "Show App Tutorial",
      "refresh": "Refresh the App",
      "starred": "Save this App"
    }
    
    var desc = text[id] ? text[id] : id
    
    var item = document.getElementById(id),
        size = item.getBoundingClientRect()
    vizwhiz.tooltip.remove(id);
    vizwhiz.tooltip.create({
      "x": size.left+size.width/2,
      "y": size.top+size.height/2,
      "offset": size.height/2,
      "arrow": true,
      "description": desc,
      "width": "auto",
      "id": id
    })
  }
  else {
    vizwhiz.tooltip.remove(id);
  }
}

// Returns a random number between the min and max passed to the function
visual.random = function(min,max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

visual.download = function(type, title) {
  
  var form = document.getElementById("svgform");
  
  if(type == "csv"){
    // console.log(app.csv_data()[0])
    // console.log(tooltip_info)
    
    var columns = app.csv_data()[0].filter(function(e,i,a){
      return tooltip_info.indexOf(e) > -1;
    })
    
    // console.log(app.csv_columns(columns).csv_data())
    // d3.csv.format([{'asdf':4, 'wwww':45}])
    
    form['data'].value = d3.csv.formatRows(app.csv_columns(columns).csv_data());
  }
  else {
    // Add necessary name space junk and get raw node
    var svg = d3.select("svg")
      .attr("version", 1.1)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .node()
    // Extract the data as SVG text string
    var svg_xml = (new XMLSerializer).serializeToString(svg);
    form['data'].value = svg_xml;
  }
  // Submit the <FORM> to the server.
  // The result will be an attachment file to download.
  form['output_format'].value = type;
  form['title'].value = title;
  form.submit();
}

visual.displayID = function(id,type) {

  if (id) {
    if (["hs","wld"].indexOf(type) >= 0 && id.length > 2) {
      return id.slice(2).toUpperCase();
    }
    else if (["isic"].indexOf(type) >= 0) return id.slice(1);
    else return id;
  }
  else {
    return id;
  }
  
}

visual.icon = function(id,type) {
  
  if (["isic","cbo","hs","bra"].indexOf(type) >= 0 && id != "all"){
    var depth = visual.depths(type)[0],
        id = id.slice(0,depth);
  }
  else {
    var id = id;
  }
  
  return "/static/img/icons/"+type+"/"+type+"_"+id+".png";
  
}

visual.depths = function(type,flatten) {
  if (type == "isic") var array = [1,3,5];
  else if (type == "cbo") var array = [1,2,3,4];
  else if (type == "hs") var array = [2,4,6];
  else if (type == "bra") var array = [2,4,6,8];
  else if (type == "wld") var array = [2,5];
  else var array = [0];
  
  if (flatten && array.length > 1) {
    return [array[0],array[array.length-1]];
  }
  else {
    return array;
  }
  
}

visual.popover.create = function(params) {
  
  var id = params.id ? params.id : "popover",
      pop_width = params.width ? params.width : "50%",
      pop_height = params.height ? params.height : "50%";
  
  if (d3.select("#popover_mask").empty()) {
    d3.select("body").append("div")
      .attr("id","popover_mask")
      .on(vizwhiz.evt.click,function(){
        visual.popover.hide();
      })
  }
  
  document.onkeyup = function(e) {
    if (e.keyCode == 27) { visual.popover.hide(); }   // esc
  };
  
  if (typeof pop_width == "string") {
    if (pop_width.indexOf("%") > 0) {
      var w_px = (parseFloat(pop_width,10)/100)*window.innerWidth
    }
    else {
      var w_px = parseFloat(pop_width,10)
    }
  }
  else {
    var w_px = pop_width;
  }
  if (pop_height.indexOf("%") > 0) {
    h_px = (parseFloat(pop_height,10)/100)*window.innerHeight;
  }
  else {
    var h_px = pop_height;
  }
  
  d3.select("body").append("div")
    .attr("id",id)
    .attr("class","popover")
    .style("width",w_px+"px")
    .style("height",h_px+"px")
    .style("left","50%")
    .style("top","50%")
    .style("margin-left",-w_px/2+"px")
    .style("margin-top",-h_px/2+"px")
  
}

visual.popover.show = function(id) {
  
  d3.select("#popover_mask")
    .style("display","block")
    .style("opacity",0.8);
    
  d3.select(id)
    .style("display","block")
    .style("opacity",1);
  
  
  
}

visual.popover.hide = function(id) {
  
  if (id) var popover = d3.select(id)
  else var popover = d3.selectAll(".popover")

  popover.each(function(){
    
      if (d3.select(this).style("display") != "none") {
        
        var p = d3.select(this)

        d3.select("#popover_mask").style("opacity",0);
        p.style("opacity",0);
    
        setTimeout(function(){
          p.style("display","none")
          d3.select("#popover_mask").style("display","none")
        },250)
        
      }
      
    })

}

visual.breadcrumbs = function() {
  
  var path_array = window.location.pathname.split("/"),
      window_path = path_array.slice(1,path_array.length-1),
      attr_lookup = ["guide","profiles"].indexOf(window_path[0]) >= 0 ? true : false,
      crumbs = [],
      waiting = [];
      
  window_path.forEach(function(p,i){
    
    crumbs.push({
      "id": p,
      "text": p.toTitleCase()
    })
    
    if (attr_lookup && [2,4].indexOf(i) >= 0) {
      
      if (["location","potential","growth","industries","wages"].indexOf(window_path[i-1]) >= 0) {
        var type = "bra";
        if (p == "all") {
          var type = "wld", id = "sabra";
        }
        else {
          var type = "bra", id = p;
        }
      }
      else if (["industry","attract"].indexOf(window_path[i-1]) >= 0) {
        if ([1,5].indexOf(p.length) >= 0) var type = "isic";
        else var type = "hs";
        var id = p;
      }
      else if (["career","occupation"].indexOf(window_path[i-1]) >= 0) {
        var type = "cbo", id = p;
      }
      else if (["product"] == window_path[i-1]) {
        var type = "hs", id = p;
      }
      else if (["partner"] == window_path[i-1]) {
        var type = "wld", id = p;
      }

      if (id == "all") {
        crumbs[i].text = "Suggestions"
      }
      else if (id) {
        
        if (id.indexOf(".") >= 0) {
          var split = id.split("."),
              distance = split[1]
          id = split[0]
        }
        else {
          var distance = 0
        }
        waiting.push(p);
        d3.json("/attrs/"+type+"/"+id, function(data){
          
          if (distance == 0) var name = data.data[0].name.toTitleCase();
          else var name = data.data[0].name.toTitleCase() + " (within "+distance+"km)"
          
          crumbs[i].text = name;
          
          waiting.splice(waiting.indexOf(p),1);
          if (waiting.length == 0) create_breadcrumb();
          
        })
      }
    }
    
  })
  
  if (waiting.length == 0) create_breadcrumb();
  
  function create_breadcrumb() {

    var breadcrumbs = d3.select("#site_breadcrumbs")
    breadcrumbs.html("")
  
    crumbs.forEach(function(c,i){

      if (i == crumbs.length-1) {
        breadcrumbs.append("span")
          .attr("class","site_crumb")
          .html(c.text)
          
      }
      else {
        
        var new_path = window_path.slice(0,i+1)
        new_path = "/"+new_path.join("/")+"/";
        breadcrumbs.append("a")
          .attr("class","site_crumb")
          .attr("href",new_path)
          .html(c.text)
          
        breadcrumbs.append("span")
          .attr("class","site_crumb_divider")
          .html("/")
          
      }
    
    })
    
  }
  
}