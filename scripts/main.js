

//boat module
var boatModule = (function(){
    var boat_array = [];

    function Boat (name, lat, lng){
        this.name = name;
        this.colour = "rgb(255, 77, 77)"
        this.col_size = 3; //pixels radius
        this.lat = lat;
        this.lng = lng;
        this.velx = 0;
        this.vely = 0;
        this.caught_fish = 0;
        this.weight = 0;
    };

    return {
        createBoat: function (name, lat, lng){
            var boat = new Boat (name, lat, lng);
            boat_array.push(boat);
        },

        getBoat: function (){
            return boat_array[0];
        },

        updateBoats: function (boat_arr){
            boat_array = boat_arr;
        }
    }
}());

//fishModule
var fishModule = (function(){
    var fish_array = [];

    function posneg(){
        if (Math.round(Math.random()) == 0){
            return -1;
        } else {
            return 1;
        }
    }

    function Fish (name, lat, lng) {
        this.name = name;
        this.colour = "rgb(255, 77, 77)"
        this.col_size = 10; //pixels radius
		this.weight = 5;
        this.lat = lat;
        this.lng = lng;
        this.velx = Math.random()*0.1*posneg(); //speedx and speedy between -0.1 and 0.1
        this.vely = Math.random()*0.1*posneg();
    };

    return {
        createFish: function (name, lat, lng){
            var fish = new Fish (name, lat, lng);
            fish_array.push(fish);
        },

        getFish: function (ind){
            return fish_array[ind];
        },

        generateFishes: function (n, boat, bounds){
            for (i = 0; i < n; i++){
                var fish = new Fish ("FishyMcFishFace", (boat.lat - bounds) + Math.random()*2*bounds, (boat.lng - bounds) + Math.random()*2*bounds);
                fish_array.push(fish);
            }
        },

        getFishArr: function(){
            return fish_array;
        },

        updateFishArr: function(fish_arr){
            fish_array = fish_arr;
        },
		
		getFishPos: function(fish){
			return {lat: fish.lat, lng: fish.lng};
		}
    }
}());

var actionModule = (function(boatModule, fishModule){

    function calcDistance (x, y){
        return Math.sqrt(Math.pow((x.lat - y.lat), 2) + Math.pow((x.lng - y.lng), 2));
    }

    function collision (boat, fish_arr){
        for (i = 0; i < fish_arr.length; i++){
            if (calcDistance (boat, fish_arr[i]) < boat.col_size){
                //alert("caught");
                return i; //index of fish
            }
        }
        return -1;
    }

    function catchFish (boat, fish_arr, marker_arr) {
        var fish_index = collision (boat, fish_arr);
        if (fish_index == -1){
            return
        }
        boat.caught_fish += 1;
        boat.weight += fish_arr[fish_index].weight;

        fish_arr.splice(fish_index, 1);
        marker_arr[i].setMap(null);
        marker_arr.splice(fish_index, 1);
        //alert(fish_arr);
        //alert(marker_arr);
    }

    function calcAllBoats (boat, fish_arr, marker_arr){
        catchFish(boat, fish_arr, marker_arr);
        var boat_arr = [boat]; //patch fix one -> updateBoats take in a boat arr, but right now we only have one boat, and it's called with a boat as input up the chain
        boatModule.updateBoats(boat_arr);
        fishModule.updateFishArr(fish_arr);
    }

    return {
        frameAction: function(boat, fish_arr, marker_arr){
            calcAllBoats(boat, fish_arr, marker_arr);
        }
    }
}(boatModule, fishModule));

var movementModule = (function(boatModule, fishModule, actionModule){

    function moveMarker(map, marker, item, velx, vely){
        item.lng += velx;
        if (item.lng > 180) {
            item.lng = item.lng - 360;
        } else if (item.lng < -180) {
            item.lng = 360 + item.lng;
        }
        item.lat += vely;
        if (item.lat > 90) {
            item.lat = item.lat - 180;
        } else if (item.lng < -90) {
            item.lat = item.lat + 180;
        }
        marker.setPosition( new google.maps.LatLng( item.lat, item.lng ) );
    }

    function moveCircle(map, circle, item){
        circle.setCenter(new google.maps.LatLng(item.lat, item.lng));
    }

    function panToMarker(map, item){
        map.panTo( new google.maps.LatLng( item.lat, item.lng ) );
    }

    function boatController(boat, marker, boat_circle, map){
        window.addEventListener("keydown", function(e){
            switch (event.keyCode){
                case 37: 
                    moveMarker(map, marker, boat, -0.3, 0);
                    moveCircle(map, boat_circle, boat);
                    panToMarker(map, boat);
			        break;
			    case 38: 
                    moveMarker(map, marker, boat, 0, 0.3);
                    moveCircle(map, boat_circle, boat);
                    panToMarker(map, boat);
			        break;
			    case 39: 
                    moveMarker(map, marker, boat, 0.3, 0);
                    moveCircle(map, boat_circle, boat);
                    panToMarker(map, boat);
			        break;
			    case 40: 
                    moveMarker(map, marker, boat, 0, -0.3);
                    moveCircle(map, boat_circle, boat);
                    panToMarker(map, boat);
			        break;
			    default: 
                    return; // exit this handler for other keys
            }
        });
    }

    return{
        init: function(boat, boat_marker, fish_arr, marker_arr, map){
            var boat_circle = new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.5,
                strokeWeight: 1,
                fillColor: '#FF0000',
                fillOpacity: 0.05,
                map: map,
                center: boat_marker.position,
                radius: 333000
            });
            boatController(boat, boat_marker, boat_circle, map);
            var fish_movement = setInterval( function(){
                actionModule.frameAction(boat, fish_arr, marker_arr);
                for (i = 0; i < fish_arr.length; i++){
                    //alert(i);
                    moveMarker(map, marker_arr[i], fish_arr[i], fish_arr[i].velx, fish_arr[i].vely);
                }
            }, 1000/30);
        }
    }
}(boatModule, fishModule, actionModule));

function setMarkers(map, num_fish, marker_arr){
    for (i = 0; i < num_fish; i++){
        var fish = fishModule.getFish(i);
        var fish_marker = new google.maps.Marker({
            position: fishModule.getFishPos(fish),
            map: map
        });
        marker_arr.push(fish_marker);
    }
}

function initMap(){
    boatModule.createBoat ("BoatyMcBoatFace", -25.363, 131.044);
    var boat = boatModule.getBoat();
    var num_fish = 10;
    var bounds = 10;
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: boat
    });
    
    var marker_arr = [];

    fishModule.generateFishes(num_fish, boat, bounds);
    fish_arr = fishModule.getFishArr();

    var boat_marker = new google.maps.Marker({
        position: boat,
        map: map
    });

    setMarkers(map, num_fish, marker_arr);

    movementModule.init(boat, boat_marker, fish_arr, marker_arr, map);
};

window.addEventListener("onload", initMap());