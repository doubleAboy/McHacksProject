

//boat module
var boatModule = (function(){
    var boat_array = [];

    function Boat (name, lat, lng){
        this.name = name;
        this.colour = "rgb(255, 77, 77)"
        this.col_size = 10; //pixels radius
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

    function Fish (name, lat, lng) {
        this.name = name;
        this.colour = "rgb(255, 77, 77)"
        this.col_size = 10; //pixels radius
		this.weight = 5;
        this.lat = lat;
        this.lng = lng;
        this.velx = Math.random()*1;
        this.vely = Math.random()*1;
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
                var fish = new Fish ("FishyMcFishFace", boat.lat + Math.random()*bounds, boat.lng + Math.random()*bounds);
                fish_array.push(fish);
            }
        },

        getFishArr: function(){
            return fish_array;
        },
		
		getFishPos: function(fish){
			return {lat: fish.lat, lng: fish.lng};
		}
    }
}());
/*
var actionModule = (function(boatModule, fishModule){

    function calcDistance (x, y){
        return Math.sqrt(Math.pow((x.lat - y.lat), 2) + Math.pow((x.lng - y.lng), 2));
    }

    function collision (boat, fish_arr){
        for (i = 0; i < fish_arry.length; i++){
            if (calcDistance (boat, fish_arr[i]) < boat.col_size){
                return i; //index of fish
            }
        }
        return -1;
    }

    function catchFish (boat, fish_arr) {
        var fish_index = collision (boat, fish_arr)
        //TODO:remove fish from fish_arr
        boat.caught_fish += 1;
        boat.weight += fish_arr[fish_index].weight;
    }

    function calcAllBoats (boat_arr, fish_arr){
        for (j = 0; j < boat_arr.length; j++){
            catchFish(boat_arr[j], fish_arr);
        }
        boatModule.updateBoats(boat_arr);
    }

    return {

    }

}(boatModule, fishModule));
*/

var movementModule = (function(boatModule, fishModule){

    function moveMarker(map, marker, item, velx, vely){
        item.lng += velx;
        item.lat += vely;
        marker.setPosition( new google.maps.LatLng( item.lat, item.lng ) );
    }

    function panToMarker(map, item){
        map.panTo( new google.maps.LatLng( item.lat, item.lng ) );
    }

    function boatController(boat, marker, map){
        window.addEventListener("keydown", function(e){
            switch (event.keyCode){
                case 37: 
                    moveMarker(map, marker, boat, -0.1, 0);
                    panToMarker(map, item);
			        break;
			    case 38: 
                    moveMarker(map, marker, boat, 0, 0.1);
                    panToMarker(map, item);
			        break;
			    case 39: 
                    moveMarker(map, marker, boat, 0.1, 0);
                    panToMarker(map, item);
			        break;
			    case 40: 
                    moveMarker(map, marker, boat, 0, -0.1);
                    panToMarker(map, item);
			        break;
			    default: 
                    return; // exit this handler for other keys
            }
        });
    }

    return{

        init: function(boat, boat_marker, fish_arr, marker_arr, map){
            boatController(boat, boat_marker, map);
            var fish_movement = setInterval( function(){
                for (i = 0; i < fish_arr.length; i++){
                    moveMarker(map, marker_arr[i], fish_arr[i], fish_arr[i].velx, fish_arr[i].vely);
                }
            }, 1000/30);
        }
    }
}(boatModule, fishModule));

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

    var boat_marker = new google.maps.Marker({
        position: boat,
        map: map
    });

    setMarkers(map, num_fish, marker_arr);

    movementModule.init(boat, boat_marker, fishModule.getFishArr(), marker_arr, map);
};

window.addEventListener("onload", initMap());