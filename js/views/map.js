//Filename: map.js
define([
  'jquery',
  'underscore',
  'backbone',
  'models/query',
  'collections/queries',
  'text!templates/tgdr_infowindow.html',
  'text!templates/sts_is_infowindow.html',
  'text!templates/try_db_infowindow.html',
  'text!templates/ameriflux_infowindow.html',
  'text!templates/table_row.html',
  'goog!maps,3,other_params:libraries=drawing&sensor=false',
], function($,_, Backbone, QueryModel, QueriesCollection, tgdrInfoWindow, sts_isInfoWindow, try_dbInfoWindow, amerifluxInfoWindow, tableRow){

  google.maps.Polygon.prototype.Contains = function(point) {
        // ray casting alogrithm http://rosettacode.org/wiki/Ray-casting_algorithm
        var crossings = 0,
            path = this.getPath();

        // for each edge
        for (var i=0; i < path.getLength(); i++) {
            var a = path.getAt(i),
                j = i + 1;
            if (j >= path.getLength()) {
                j = 0;
            }
            var b = path.getAt(j);
            if (rayCrossesSegment(point, a, b)) {
                crossings++;
            }
        }

        // odd number of crossings?
        return (crossings % 2 == 1);

        function rayCrossesSegment(point, a, b) {
            var px = point.lng(),
                py = point.lat(),
                ax = a.lng(),
                ay = a.lat(),
                bx = b.lng(),
                by = b.lat();
            if (ay > by) {
                ax = b.lng();
                ay = b.lat();
                bx = a.lng();
                by = a.lat();
            }
            // alter longitude to cater for 180 degree crossings
            if (px < 0) { px += 360 };
            if (ax < 0) { ax += 360 };
            if (bx < 0) { bx += 360 };

            if (py == ay || py == by) py += 0.00000001;
            if ((py > by || py < ay) || (px > Math.max(ax, bx))) return false;
            if (px < Math.min(ax, bx)) return true;

            var red = (ax != bx) ? ((by - ay) / (bx - ax)) : Infinity;
            var blue = (ax != px) ? ((py - ay) / (px - ax)) : Infinity;
            return (blue >= red);

        }

     };

  	var MapView = Backbone.View.extend({
        el : '#map_canvas',
        model: QueryModel,
        collection: QueriesCollection,
        tgdrInfoWindowTemplate: _.template(tgdrInfoWindow),
        sts_isInfoWindowTemplate: _.template(sts_isInfoWindow),
        try_dbInfoWindowTemplate: _.template(try_dbInfoWindow),
        amerifluxInfoWindowTemplate: _.template(amerifluxInfoWindow),
        tableRowTemplate: _.template(tableRow),

        mapOptions : {
          zoom: 4,
          minZoom: 2,
          maxZoom: 25,
          center: new google.maps.LatLng(38.5539,-121.7381), //Davis, CA
          mapTypeId: 'terrain',
          mapTypeControl: true,
          mapTypeControlOptions: { 
            mapTypeIds: [
              'terrain',
              'satellite'
            ],
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU 
          },
          navigationControl: true,
          navigationControlOptions: { 
            style: google.maps.NavigationControlStyle.ZOOM_PAN 
          },
          scrollwheel: false,
          scaleControl: true,
        },

        clearTable: function(){
          var table = document.getElementById("data_table");
          for(var i = table.rows.length - 1; i > 0; i--)
          {
            table.deleteRow(i);
          }
        },

        initMap: function() {
          this.map =  new google.maps.Map(this.el, this.mapOptions);
        },
        
        getTableQueryCircle: function(table,circle){
          var radius = circle.getRadius();
          var center = circle.getCenter();
          var lat = center.lat();
          var lng = center.lng();
          var circleQuery = " WHERE ST_INTERSECTS('lat', CIRCLE(LATLNG("+lat+","+lng+"),"+radius+"))";
          console.log(circleQuery);
          var table_id = this.collection.meta(table+"_id");
          var prefix = "SELECT icon_name,tree_id,lat,lng,num_sequences,num_genotypes,species FROM "+table_id;

          if (this.collection.meta(table+"WhereClause") == ""){
            return prefix + circleQuery;
          }
          else if (typeof(this.collection.meta(table+"WhereClause")) !== "undefined"){
            return prefix+circleQuery+" AND "+this.collection.meta(table+"WhereClause")
          }
          else{
            return prefix+" WHERE lat = 1000" // just a dumby url to return 0 on count()
          }
        },

        getTableQuery: function(table){
          var table_id = this.collection.meta(table+"_id");
          var prefix = "SELECT icon_name,tree_id,lat,lng,num_sequences,num_genotypes,species FROM "+table_id
          if (this.collection.meta(table+"WhereClause") == ""){
            return prefix
          }
          else if (typeof(this.collection.meta(table+"WhereClause")) !== "undefined"){
            return prefix+" WHERE "+this.collection.meta(table+"WhereClause")
          }
          else{
            return prefix+" WHERE lat = 1000" // just a dumby url to return 0 on count()
          }
        },

        appendToTableCircle: function(result){
          var that = this;
          _.each(result.rows,function(row,index){
              var rowObj = {
                "icon_name":row[0],
                "tree_id":row[1],
                "lat":row[2],
                "lng":row[3],
                "num_sequences":row[4],
                "num_genotypes":row[5],
                "species":row[6]
              }
              // console.log(rowObj);
              $('#data_table tbody').append(that.tableRowTemplate(rowObj));
              $('#data_table').trigger("update");
          });
        },

        appendToTable: function(result,polygon){
          var that = this;
          _.each(result.rows,function(row,index){
            var point = new google.maps.LatLng(row[2],row[3]);
            if(polygon.Contains(point)) {
              var rowObj = {
                "icon_name":row[0],
                "tree_id":row[1],
                "lat":row[2],
                "lng":row[3],
                "num_sequences":row[4],
                "num_genotypes":row[5],
                "species":row[6]
              }
              // console.log(rowObj);
              $('#data_table tbody').append(that.tableRowTemplate(rowObj));
              $('#data_table').trigger("update");
            }
          });
        },

        initDrawingManager: function() {
          var that = this;
          var url = that.model.get("fusion_table_query_url");
          var key = that.model.get("fusion_table_key");
          

          this.drawingManager = new google.maps.drawing.DrawingManager({
            drawingControl: true,
            drawingControlOptions: {
              position: google.maps.ControlPosition.TOP_CENTER,
              drawingModes: [
                google.maps.drawing.OverlayType.POLYGON,
                google.maps.drawing.OverlayType.CIRCLE,
              ]
            },
          });

          this.drawingManager.setMap(this.map);
          google.maps.event.addListener(this.drawingManager,'circlecomplete', function(circle){
            if(that.circle){
              that.circle.setMap(null);
              that.clearTable();
              // $('#data_table').dataTable().fnClearTable();
            }
            var tgdrQuery = that.getTableQueryCircle("tgdr",circle);
            var sts_isQuery = that.getTableQueryCircle("sts_is",circle);
            var try_dbQuery = that.getTableQueryCircle("try_db",circle);
            var circleQuery = ""
            that.circle = circle;
            $.getJSON(url+tgdrQuery+key).success(function(result){
              that.appendToTableCircle(result);
              $.getJSON(url+sts_isQuery+key).success(function(result){
                that.appendToTableCircle(result);
                $.getJSON(url+try_dbQuery+key).success(function(result){
                  that.appendToTableCircle(result);
                });
              });
            }); 

          });

          google.maps.event.addListener(this.drawingManager,'polygoncomplete', function(polygon){
            if(that.polygon){
              that.polygon.setMap(null);
              that.clearTable();
              // $('#data_table').dataTable().fnClearTable();
            }
            var tgdrQuery = that.getTableQuery("tgdr");
            var sts_isQuery = that.getTableQuery("sts_is");
            var try_dbQuery = that.getTableQuery("try_db");
            // var amerifluxQuery = that.getTableQuery("ameriflux");// implement later
            that.polygon = polygon;
            $.getJSON(url+tgdrQuery+key).success(function(result){
              that.appendToTable(result,polygon);
              $.getJSON(url+sts_isQuery+key).success(function(result){
                that.appendToTable(result,polygon);
                $.getJSON(url+try_dbQuery+key).success(function(result){
                  that.appendToTable(result,polygon);
                });
              });
            });
                              
            // google.maps.event.addListener(that.map,'click',function(){
            //   console.log(polygon);
            //   polygon.setMap(null);
            // });
          });

        },
      

        initLayers: function() {
          this.tgdrLayer = new google.maps.FusionTablesLayer({
            query: {
              select: "lat",
              from: this.collection.meta("tgdr_id")
            }, 
            map: this.map,
            styleId: 2,
            templateId: 2,
            suppressInfoWindows: true
          });
          this.sts_isLayer = new google.maps.FusionTablesLayer({
            query: {
              select: "lat",
              from: this.collection.meta("sts_is_id")
            }, 
            map: this.map,
            styleId: 2,
            templateId: 2,
            suppressInfoWindows: true
          });

          this.try_dbLayer = new google.maps.FusionTablesLayer({
            query: {
              select: "lat",
              from: this.collection.meta("try_db_id")
            }, 
            map: this.map,
            styleId: 2,
            templateId: 2,
            suppressInfoWindows: true
          });
          this.amerifluxLayer = new google.maps.FusionTablesLayer({
            query: {
              select: "lat",
              from: this.collection.meta("ameriflux_id"),
            }, 
            map: this.map,
            styleId: 2,
            templateId: 2,
            suppressInfoWindows: true
          });
        },

        initInfoWindows: function(){
          var that = this; //to handle closure

          var convertNumToInfoWindowOutput = function(number){
            if (number > 0){
              return "Yes ("+number+")";
            }
            else{
              return "No";
            }
          }

          var convertIconToInfoWindowOutput = function(icon_name){
            if (icon_name == 'small_green'){
              return 'Exact GPS';
            }
            else if (icon_name == 'small_yellow'){
              return 'Approximate GPS';
            }
            else if (icon_name == 'parks'){
              return 'TRY-DB';
            }
            else{
              return 'Ameriflux';
            }
          }


          this.tgdrInfoWindow = new google.maps.InfoWindow({maxWidth:250});
          this.sts_isInfoWindow = new google.maps.InfoWindow({maxWidth:250});
          this.try_dbInfoWindow = new google.maps.InfoWindow({maxWidth:250});
          this.amerifluxInfoWindow = new google.maps.InfoWindow({maxWidth:250});
          google.maps.event.addListener(this.tgdrLayer, 'click', function(e){
              that.tgdrInfoWindow.setContent(
                that.tgdrInfoWindowTemplate({
                  icon_name: e.row["icon_name"].value,//for icon images -> http://kml4earth.appspot.com/icons.html
                  icon_type: convertIconToInfoWindowOutput(e.row["icon_name"].value),
                  tree_id: e.row["tree_id"].value,
                  species: e.row["species"].value,
                  lat: e.row["lat"].value,
                  lng: e.row["lng"].value,
                  sequenced: convertNumToInfoWindowOutput(e.row["num_sequences"].value),
                  genotyped: convertNumToInfoWindowOutput(e.row["num_genotypes"].value),
                  phenotyped: convertNumToInfoWindowOutput(e.row["num_phenotypes"].value),
                  accession: e.row["accession"].value,
                  title: e.row["title"].value,
                  authors: e.row["authors"].value
                  })
              );
              that.tgdrInfoWindow.setPosition(new google.maps.LatLng(e.row["lat"].value,e.row["lng"].value));
              that.tgdrInfoWindow.open(that.map);
          });
          google.maps.event.addListener(this.sts_isLayer, 'click', function(e){
              that.sts_isInfoWindow.setContent(
                that.sts_isInfoWindowTemplate({
                  icon_name: e.row["icon_name"].value,
                  icon_type: convertIconToInfoWindowOutput(e.row["icon_name"].value),
                  tree_id: e.row["tree_id"].value,
                  family: e.row["family"].value,
                  genus: e.row["genus"].value,
                  species: e.row["species"].value,
                  lat: e.row["lat"].value,
                  lng: e.row["lng"].value,
                  sequenced: convertNumToInfoWindowOutput(e.row["num_sequences"].value),
                  genotyped: convertNumToInfoWindowOutput(e.row["num_genotypes"].value),
                  phenotyped: convertNumToInfoWindowOutput(e.row["num_phenotypes"].value),
                  })
              );
              that.sts_isInfoWindow.setPosition(new google.maps.LatLng(e.row["lat"].value,e.row["lng"].value));
              that.sts_isInfoWindow.open(that.map);
          });
          google.maps.event.addListener(this.try_dbLayer, 'click', function(e){
              that.try_dbInfoWindow.setContent(
                that.try_dbInfoWindowTemplate({
                  icon_name: e.row["icon_name"].value,
                  icon_type: convertIconToInfoWindowOutput(e.row["icon_name"].value),
                  angio_gymno: e.row["class"].value,
                  institution: e.row["institution"].value,
                  species: e.row["species"].value,
                  lat: e.row["lat"].value,
                  lng: e.row["lng"].value,
                  phenotyped: convertNumToInfoWindowOutput(e.row["num_phenotypes"].value),
                  dataset: e.row["dataset"].value,
                  })
              );
              that.try_dbInfoWindow.setPosition(new google.maps.LatLng(e.row["lat"].value,e.row["lng"].value));
              that.try_dbInfoWindow.open(that.map);
          });
          google.maps.event.addListener(this.amerifluxLayer, 'click', function(e){
              that.amerifluxInfoWindow.setContent(
                that.amerifluxInfoWindowTemplate({
                  icon_name: e.row["icon_name"].value,
                  site_id: e.row["site_id"].value,
                  src_url: e.row["src_url"].value,
                  site_name: e.row["site_name"].value,
                  type: e.row["type"].value,
                  lat: e.row["lat"].value,
                  lng: e.row["lng"].value,
                  })
              );
              that.amerifluxInfoWindow.setPosition(new google.maps.LatLng(e.row["lat"].value,e.row["lng"].value));
              that.amerifluxInfoWindow.open(that.map);
          });
        },

        initialize: function(){
          var that = this;
          this.initMap();
          this.initLayers();
          this.initInfoWindows();
          this.initDrawingManager();
          this.collection.on('add remove reset',this.refreshLayers,this);
          google.maps.event.addListener(this.map, 'click', function(){ //clears bottom table and removes polygons from map
            // $('#data_table').dataTable().fnClearTable();
            if(that.polygon){
              // console.log(that.polygon);
              that.clearTable();
              that.polygon.setMap(null);
            }
          });
        },

        getColumn: function(column){
          return (this.collection.filter(function(query){return query.get("column") === column}).map(function(query){return query.get("value")}));
        },

        genQuerySTS_IS: function(families,genuses,species,filters){
          var familiesQuery = "";
          var genusesQuery = "";
          var speciesQuery = "";
          var sequencedQuery = "";
          var genotypedQuery = "";
          var phenotypedQuery = "";
          var gpsQuery = "";
          if (families.length > 0){
            familiesQuery = "'family' IN ('"+families.join("','")+"')";
          }
          if (genuses.length > 0){
            genusesQuery = "'genus' IN ('"+genuses.join("','")+"')";
          }
          if (species.length > 0){
            speciesQuery = "'species' IN ('"+species.join("','")+"')";
          }
          if (filters.indexOf("sequenced") != -1) {
            sequencedQuery = "'num_sequences' > 0";
          }
          if (filters.indexOf("genotyped") != -1) {
            genotypedQuery = "'num_genotypes' > 0";
          }
          if (filters.indexOf("phenotyped") != -1) {
            phenotypedQuery = "'num_phenotypes' > 0";
          }
          if (filters.indexOf("exact_gps") != -1 && gpsQuery == "") {//if both or none are set shows all
            gpsQuery = "'is_exact_gps_coordinate' = 'true'";
          }
          if (filters.indexOf("approx_gps") != -1 && gpsQuery == "") {
            gpsQuery = "'is_exact_gps_coordinate' = 'false'";
          }
          return _.filter([
            familiesQuery,
            genusesQuery,
            speciesQuery,
            sequencedQuery,
            genotypedQuery,
            phenotypedQuery,
            gpsQuery],function(string){ return string != ""}).join(' AND ');          
        },

        genQuery: function(table,years,families,genuses,species_tgdr,species_sts_is,accessions,filters){
          var studiesQuery = "";
          var yearsQuery = "";
          var familiesQuery = "";
          var genusesQuery = "";
          var speciesTGDRQuery = "";
          var speciesSTS_ISQuery = "";
          var accessionsQuery = "";
          var sequencedQuery = ""; // no samples are sequenced in tgdr, may change in future
          var genotypedQuery = "";
          var phenotypedQuery = "";
          var gpsQuery = ""; // all samples are exact in tgdr, may change in future
          if (years.length > 0){
            yearsQuery = "'year' IN ('"+years.join("','")+"')";
          }
          if (families.length > 0){
            familiesQuery = "'family' IN ('"+families.join("','")+"')";
          }
          if (genuses.length > 0){
            genusesQuery = "'genus' IN ('"+genuses.join("','")+"')";
          }
          if (species_tgdr.length > 0){
            speciesTGDRQuery = "'species' IN ('"+species_tgdr.join("','")+"')";
          }
          if (species_sts_is.length > 0){
            speciesSTS_ISQuery = "'species' IN ('"+species_sts_is.join("','")+"')";
          }
          if (accessions.length > 0){ 
            accessionsQuery = "'accession' IN ('"+accessions.join("','")+"')";
          }
          if (filters.indexOf("sequenced") != -1) {
            sequencedQuery = "'num_sequences' > 0";
          }
          if (filters.indexOf("genotyped") != -1) {
            genotypedQuery = "'num_genotypes' > 0";
          }
          if (filters.indexOf("phenotyped") != -1) {
            phenotypedQuery = "'num_phenotypes' > 0";
          }
          if (filters.indexOf("exact_gps") != -1 && gpsQuery == "") {//if both or none are set shows all
            gpsQuery = "'is_exact_gps_coordinate' = 'true'";
          }
          if (filters.indexOf("approx_gps") != -1 && gpsQuery == "") {
            gpsQuery = "'is_exact_gps_coordinate' = 'false'";
          }
          if (table == "tgdr"){
            return _.filter([yearsQuery,speciesTGDRQuery,accessionsQuery,sequencedQuery,genotypedQuery,phenotypedQuery,gpsQuery],function(string){ return string != ""}).join(' AND '); 
          } 
          else if (table == "sts_is"){
            return _.filter([familiesQuery, genusesQuery, speciesSTS_ISQuery, sequencedQuery, genotypedQuery, phenotypedQuery, gpsQuery],function(string){ return string != ""}).join(' AND '); 
          }
          else {//try_db or ameriflux
            return _.filter([sequencedQuery, genotypedQuery, phenotypedQuery, gpsQuery],function(string){ return string != ""}).join(' AND '); 
          }     
        },


        refreshLayer: function(table,whereClause,layer,layer_id){
          if(typeof(whereClause) === "undefined"){
            layer.setMap(null);
          }
          else{
            this.collection.meta(table+"WhereClause",whereClause); //sets the new where clause
            layer.setOptions({
              query: {
                select: "lat",
                from: layer_id, 
                where: whereClause
              }
            });
            layer.setMap(this.map);
          }

        },

        refreshLayers: function(){
          //tree nodes
          var all = this.getColumn("all");
          var environmental = this.getColumn("environmental");
          var phenotypes = this.getColumn("phenotypes");
          var ameriflux = this.getColumn("ameriflux");
          var try_db = this.getColumn("try_db");
          var studies = this.getColumn("studies");
          var taxa = this.getColumn("taxa");
          var years = this.getColumn("year");
          var families = this.getColumn("family");
          var genuses = this.getColumn("genus");
          var species_tgdr = this.getColumn("species_tgdr");
          var species_sts_is = this.getColumn("species_sts_is");
          var accessions = this.getColumn("accession");
          var filters = this.collection.pluck("filter");
          

          if (all.length > 0 || studies.length > 0 || years.length > 0 || species_tgdr.length > 0 || accessions.length > 0 || filters > 0){
            var tgdrWhereClause = this.genQuery("tgdr",years,families,genuses,species_tgdr,species_sts_is,accessions,filters);
          }
          if (all.length > 0 || taxa.length > 0 || families.length > 0 || genuses.length > 0 || species_sts_is.length > 0 || filters > 0){
            var sts_isWhereClause = this.genQuery("sts_is",years,families,genuses,species_tgdr,species_sts_is,accessions,filters);
          }
          if (all.length > 0 || phenotypes.length > 0 || try_db.length > 0 || filters > 0){
            var try_dbWhereClause = this.genQuery("try_db",years,families,genuses,species_tgdr,species_sts_is,accessions,filters);
          }
          if (all.length > 0 || environmental.length > 0 || ameriflux.length > 0 || filters > 0){
            var amerifluxWhereClause = this.genQuery("ameriflux",years,families,genuses,species_tgdr,species_sts_is,accessions,filters);
          }

          this.refreshLayer("tgdr",tgdrWhereClause,this.tgdrLayer,this.collection.meta("tgdr_id"));
          this.refreshLayer("sts_is",sts_isWhereClause,this.sts_isLayer,this.collection.meta("sts_is_id"));
          this.refreshLayer("try_db",try_dbWhereClause,this.try_dbLayer,this.collection.meta("try_db_id"));
          this.refreshLayer("ameriflux",amerifluxWhereClause,this.amerifluxLayer,this.collection.meta("ameriflux_id"));    
          //debug
          console.log("tgdrWhereClause:"+this.collection.meta("tgdrWhereClause")+"\n"+
                  "sts_isWhereClause:"+this.collection.meta("sts_isWhereClause")+"\n"+
                  "try_dbWhereClause:"+this.collection.meta("try_dbWhereClause")+"\n"+
                  "amerifluxWhereClause:"+this.collection.meta("amerifluxWhereClause"));   
        },

        render: function(){
          return this;
    	   }
      });
    	return MapView;
  });
