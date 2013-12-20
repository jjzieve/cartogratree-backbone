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
  'goog!maps,3,other_params:libraries=drawing&sensor=false',
], function($,_, Backbone, QueryModel, QueriesCollection, tgdrInfoWindow, sts_isInfoWindow, try_dbInfoWindow, amerifluxInfoWindow){

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


         initMap: function() {
          this.map =  new google.maps.Map(this.el, this.mapOptions);
        },
        

        initDrawingManager: function() {
          var that = this;
          this.drawingManager = new google.maps.drawing.DrawingManager({
            drawingControl: true,
            drawingControlOptions: {
              position: google.maps.ControlPosition.TOP_CENTER,
              drawingModes: [
                google.maps.drawing.OverlayType.POLYGON,
              ]
            },
          });

          this.drawingManager.setMap(this.map);

          google.maps.event.addListener(this.drawingManager,'polygoncomplete', function(polygon){
            if(that.polygon){
              that.polygon.setMap(null);
              $('#data_table').dataTable().fnClearTable();
            }
            that.polygon = polygon;
            var markersInPolygon = [];
            //  $url="https://www.googleapis.com/fusiontables/v1/query?sql=SELECT%20count()%20FROM%201AV4s_xvk7OQUMCvxoKjnduw3DjahoRjjKM9eAj8%20WHERE%20ST_INTERSECTS('lat',%20CIRCLE(LATLNG($lat,$lng),%2025000))&key=AIzaSyCuYOWxwU8zbT5oBvHKOAgRYE08Ouoy5Us";
            if (that.collection.meta("tgdrWhereClause")){
              $.getJSON(
                that.model.get("fusion_table_query_url")+
                "SELECT icon_name,tree_id,lat,lng,num_sequences,num_genotypes,species FROM "+
                that.collection.meta("tgdr_id")+" WHERE "+
                that.collection.meta("tgdrWhereClause")+that.model.get("fusion_table_key")
                ).success(function(result){
                  _.each(result.rows,function(row){
                    // console.log(row);
                    var point = new google.maps.LatLng(row[2],row[3]);
                    if(polygon.Contains(point)) {
                      markersInPolygon.push(row);
                    }
                  });
                  _.each(markersInPolygon,function(marker){
                    icon_name =  marker[0];
                    tree_id =  marker[1];
                    lat =  marker[2];
                    lng =  marker[3];
                    num_sequences =  marker[4];
                    num_genotypes =  marker[5];
                    species =  marker[6];
                    $("#data_table").dataTable().fnAddData([
                     icon_name,tree_id,lat,lng,num_sequences,num_genotypes,species
                  ]);
                  // console.log(points);

                  });
              });
            }
            google.maps.event.addListener(that.map,'click',function(){
              console.log(polygon);
              polygon.setMap(null);
            });
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
              from: this.collection.meta("trydb_id")
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
            if (icon_name = 'small_green'){
              return 'Exact GPS';
            }
            else if (icon_name = 'small_yellow'){
              return 'Approximate GPS';
            }
            else if (icon_name = 'parks'){
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
          google.maps.event.addListener(this.map, 'click', function(){
            $('#data_table').dataTable().fnClearTable();
            if(that.polygon){
              // console.log(that.polygon);
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
            gpsQuery = "'is_exact_gps_rowinate' = 'true'";
          }
          if (filters.indexOf("approx_gps") != -1 && gpsQuery == "") {
            gpsQuery = "'is_exact_gps_rowinate' = 'false'";
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

        genQueryTGDR: function(years,species,accessions,filters){
          var studiesQuery = "";
          var yearsQuery = "";
          var speciesQuery = "";
          var accessionsQuery = "";
          // var sequencedQuery = ""; // no samples are sequenced in tgdr, may change in future
          var genotypedQuery = "";
          var phenotypedQuery = "";
          // var gpsQuery = ""; // all samples are exact in tgdr, may change in future
          if (years.length > 0){
            yearsQuery = "'year' IN ('"+years.join("','")+"')";
          }
          if (species.length > 0){
            speciesQuery = "'species' IN ('"+species.join("','")+"')";
          }
          if (accessions.length > 0){ 
            accessionsQuery = "'accession' IN ('"+accessions.join("','")+"')";
          }
          if (filters.indexOf("genotyped") != -1) {
            genotypedQuery = "'num_genotypes' > 0";
          }
          if (filters.indexOf("phenotyped") != -1) {
            phenotypedQuery = "'num_phenotypes' > 0";
          }
                             
          return _.filter([
            yearsQuery,
            speciesQuery,
            accessionsQuery,
            genotypedQuery,
            phenotypedQuery],function(string){ return string != ""}).join(' AND ');          
        },

        refreshLayer: function(table,whereClause,layer,layer_id){
          if(typeof(whereClause) === "undefined"){
            layer.setMap(null);
          }
          else{
            this.collection.meta(table+"WhereClause",whereClause); //sets the new where clause, should be implemented in collection but haven't figured out how...       
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
          var species_is_sts = this.getColumn("species_is_sts");
          var filters = this.collection.pluck("filter");
          var accessions = this.getColumn("accession"); // uncomment when fusion table is fixed
          if (all.length > 0){
            var tgdrWhereClause = "";
            var sts_isWhereClause = "";
            var phenotypesWhereClause = "";
            var environmentalWhereClause = "";
          }
          if (studies.length > 0 || years.length > 0 || species_tgdr.length > 0 || accessions.length > 0){
            var tgdrWhereClause = this.genQueryTGDR(years,species_tgdr,accessions,filters);
          }  
          if (taxa.length > 0 || families.length > 0 || genuses.length > 0 || species_is_sts.length > 0){
            var sts_isWhereClause = this.genQuerySTS_IS(families,genuses,species_is_sts,filters);
          }
          if (phenotypes.length > 0 || try_db.length > 0){
            var phenotypesWhereClause = "";
          }
          if (environmental.length > 0 || ameriflux.length > 0){
            var environmentalWhereClause = "";
          }
          this.refreshLayer("tgdr",tgdrWhereClause,this.tgdrLayer,this.collection.meta("tgdr_id"));
          this.refreshLayer("sts_is",sts_isWhereClause,this.sts_isLayer,this.collection.meta("sts_is_id"));
          this.refreshLayer("phenotypes",phenotypesWhereClause,this.try_dbLayer,this.collection.meta("trydb_id"));
          this.refreshLayer("environmental",environmentalWhereClause,this.amerifluxLayer,this.collection.meta("ameriflux_id"));       
        },

        render: function(){
          return this;
    	   }
      });
    	return MapView;
  });
