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
    var maxPop = 20;

    var fish_array = [];

    function posneg(){
        if (Math.round(Math.random()) == 0){
            return -1;
        } else {
            return 1;
        }
    }

    function numFishInRange(fish, fish_arr, n){
        var num_fish_in_range = 0;
        for (j = 0; j < fish_arr.length; j++){
            if (Math.sqrt(Math.pow(fish_arr[j].lng - fish.lng, 2) + Math.pow(fish_arr[j].lat - fish.lat, 2)) < n){
                num_fish_in_range += 1;
            }
        }
        return num_fish_in_range;
    }

    function Fish (name, lat, lng) {
        this.name = name;
        this.colour = "rgb(255, 77, 77)"
        this.col_size = 10; //pixels radius
		this.weight = 5;
        this.lat = lat;
        this.lng = lng;
        this.velx = 0.05*posneg(); //speedx and speedy between -0.1 and 0.1
        this.vely = 0.05*posneg();
        this.maxvel = Math.sqrt(Math.pow(this.velx, 2) + Math.pow(this.vely, 2));
        this.age = 0,
        this.dead = false,
        this.repelling = 1, //2 = repel, 1 = neutral, 0 = attract
        this.repelEpsilon = 7,  //distance for density for repelling
        this.canMate = false,
        this.mateRange = 3,
        this.timeSinceLastMate = 0,
        this.litterSize = 5,
        this.libido = Math.random()*4 + 4,
        this.attractionLimit = 5
    };

    function repelWeight(dist){
        return 1/Math.sqrt(dist);
    }

    function attractWeight(dist){
        return Math.sqrt(dist);
    }

    function calcAllFishMovement(fish_arr){
        for (i = 0; i < fish_arr.length; i++){
            for (j = 0; j < fish_arr.length; j++){
                if ( i == j ) continue;
                if (fish_arr[i].repelling == 2){
                    var dvx = repelWeight(Math.abs(fish_arr[i].lng - fish_arr[j].lng));
                    var dvy = repelWeight(Math.abs(fish_arr[i].lat - fish_arr[j].lat));
                    if (fish_arr[i].lng - fish_arr[j].lng > 0){
                        fish_arr[i].velx += dvx;
                    } else {
                        fish_arr[i].velx -= dvx;
                    }

                    if (fish_arr[i].lat - fish_arr[j].lat > 0){
                        fish_arr[i].vely += dvy;
                    } else {
                        fish_arr[i].vely -= dvy;
                    }
                    var tvel = Math.sqrt(Math.pow(fish_arr[i].velx, 2) + Math.pow(fish_arr[i].vely, 2));
                    fish_arr[i].velx = (fish_arr[i].velx/tvel) * fish_arr[i].maxvel;
                    fish_arr[i].vely = (fish_arr[i].vely/tvel) * fish_arr[i].maxvel;
                } else if (fish_arr[i].repelling == 1){
                    continue;
                } else {
                    var dvx = attractWeight(Math.abs(fish_arr[i].lng - fish_arr[j].lng));
                    var dvy = attractWeight(Math.abs(fish_arr[i].lat - fish_arr[j].lat));
                    if (fish_arr[i].lng - fish_arr[j].lng > 0){
                        fish_arr[i].velx -= dvx;
                    } else {
                        fish_arr[i].velx += dvx;
                    }

                    if (fish_arr[i].lat - fish_arr[j].lat > 0){
                        fish_arr[i].vely -= dvy;
                    } else {
                        fish_arr[i].vely += dvy;
                    }
                    var tvel = Math.sqrt(Math.pow(fish_arr[i].velx, 2) + Math.pow(fish_arr[i].vely, 2));
                    fish_arr[i].velx = (fish_arr[i].velx/tvel) * fish_arr[i].maxvel;
                    fish_arr[i].vely = (fish_arr[i].vely/tvel) * fish_arr[i].maxvel;
                }

            }
        }
    }

    Fish.prototype.isRepel = function(fish_arr){
        if (numFishInRange(this, fish_arr, this.repelEpsilon) > 3){ //4 is the number of fish in range before repel, it includes itself
            this.repelling = 2;
        } else if (this.timeSinceLastMate < this.libido) {
            this.repelling = 2;
        } else if (numFishInRange(this, fish_arr, this.attractionLimit) > 2){
            this.repelling = 0;
        } else {
            this.repelling = 1;
        }
    }

    Fish.prototype.isDead = function(){
        if (this.age > 50){
            this.dead = true;
            this.velx = 0;
            this.vely = 0;
            this.repelling = 1;
            this.canMate = false;
        }
    }

    Fish.prototype.readyToMate = function(){
        if (this.age > 10 && this.age < 42 && this.timeSinceLastMate > 8){
            this.canMate = true;
        } else {
            this.canMate = false;
        }
    }

    function mateFish(fish1, fish2, marker_arr, map){
        if (fish1.canMate && fish2.canMate){
            if (Math.sqrt(Math.pow(fish1.lng - fish2.lng, 2) + Math.pow(fish1.lat - fish2.lat, 2)) < fish1.mateRange){
                fish1.canMate = false;
                fish2.canMate = false;
                fish1.timeSinceLastMate = 0;
                fish2.timeSinceLastMate = 0;
                for (i = 0; i < Math.round(Math.random()*fish1.litterSize + 2); i++){
                    var baby_fish = new Fish ("babyFish", (fish1.lat + fish2.lat)/2 + Math.random()*0.02, (fish1.lng + fish2.lng)/2 + Math.random()*0.02);
                    fish_array.push( baby_fish );


                    //Add in to resize smaller fish

                    var icon = {
                        url: "../Images/FishUp.gif",
                        optimized: false,
                        scaledSize: new google.maps.Size(12, 25), // scaled size
                        origin: new google.maps.Point(0,0), // origin
                        anchor: new google.maps.Point(6, 12) // anchor
                    };
                    
                    
                    var fish_marker = new google.maps.Marker({
                        position: fishModule.getFishPos(baby_fish),
                        map: map,
                        optimized: false,
                        //icon: "../Images/FishUp.gif"
                        icon: icon
                    });
                    marker_arr.push(fish_marker);
                }
            }
        }
        return;
    }

    function mateAllFish(fish_array, marker_arr, map, maxPop){
        for (i = 0; i < fish_array.length-1; i++){
            for (j = i+1; j < fish_array.length; j++){
                if (fish_array.length < maxPop){
                    mateFish(fish_array[i], fish_array[j], marker_arr, map);
                }
            }
        }
        return;
    }

    return {
        calcAllFish: function(fish_arr, marker_arr, map){
            for (i = 0; i < fish_arr.length; i++){
                fish_arr[i].age += 30/1000;
                fish_arr[i].timeSinceLastMate += 30/1000;
                fish_arr[i].isDead();
                fish_arr[i].readyToMate();
                fish_arr[i].isRepel(fish_arr);
            }
            mateAllFish(fish_arr, marker_arr, map, maxPop);
            calcAllFishMovement(fish_arr);
        },

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
        frameAction: function(boat, fish_arr, marker_arr, map){  //calculates differences for each frame
            fishModule.calcAllFish(fish_arr, marker_arr, map);
            calcAllBoats(boat, fish_arr, marker_arr);
        }
    }
}(boatModule, fishModule));

var movementModule = (function(boatModule, fishModule, actionModule){

    function moveMarker(map, marker, item, velx, vely){
        item.lng += velx;
        if (item.lng > 180) {
            item.velx = (-1)*item.velx;
        } else if (item.lng < -180) {
            item.velx = (-1)*item.velx;
        }
        item.lat += vely;
        if (item.lat > 85) {
            item.vely = (-1)*item.vely;
        } else if (item.lat < -85) {
            item.vely = (-1)*item.vely;
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
        var up_icon = {
            url: "../Images/BoatUp.gif",
            optimized: false,
            scaledSize: new google.maps.Size(35, 50), // scaled size
            origin: new google.maps.Point(0,0), // origin
            anchor: new google.maps.Point(17,25) // anchor
        };

        var down_icon = {
            url: "../Images/BoatDown.gif",
            optimized: false,
            scaledSize: new google.maps.Size(35, 50), // scaled size
            origin: new google.maps.Point(0,0), // origin
            anchor: new google.maps.Point(17,25) // anchor
        };

        var left_icon = {
            url: "../Images/BoatLeft.gif",
            optimized: false,
            scaledSize: new google.maps.Size(50, 35), // scaled size
            origin: new google.maps.Point(0,0), // origin
            anchor: new google.maps.Point(25,17) // anchor
        };

        var right_icon = {
            url: "../Images/BoatRight.gif",
            optimized: false,
            scaledSize: new google.maps.Size(50, 35), // scaled size
            origin: new google.maps.Point(0,0), // origin
            anchor: new google.maps.Point(25,17) // anchor
        };

        window.addEventListener("keydown", function(e){
            switch (event.keyCode){
                case 65: //left 
                    moveMarker(map, marker, boat, -0.5, 0); //moves boat marker
                    marker.setIcon(left_icon);
                    moveCircle(map, boat_circle, boat); //moves circle
                    panToMarker(map, boat); //pans map to boat marker
			        break;
			    case 87: //up
                    moveMarker(map, marker, boat, 0, 0.5);
                    marker.setIcon(up_icon);
                    moveCircle(map, boat_circle, boat);
                    panToMarker(map, boat);
			        break;
			    case 68: //right
                    moveMarker(map, marker, boat, 0.5, 0);
                    marker.setIcon(right_icon);
                    moveCircle(map, boat_circle, boat);
                    panToMarker(map, boat);
			        break;
			    case 83: //down
                    moveMarker(map, marker, boat, 0, -0.5);
                    marker.setIcon(down_icon);
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
                fillOpacity: 0.00,
                map: map,
                center: boat_marker.position,
                radius: 333000
            });
            boatController(boat, boat_marker, boat_circle, map);

            var fish_movement = setInterval( function(){ //the setInterval
                actionModule.frameAction(boat, fish_arr, marker_arr, map);
                for (i = 0; i < fish_arr.length; i++){
                    //alert(i);
                    moveMarker(map, marker_arr[i], fish_arr[i], fish_arr[i].velx, fish_arr[i].vely);
                }
            }, 1000/30);
        }
    }
}(boatModule, fishModule, actionModule));

function setMarkers(map, num_fish, marker_arr){

     var icon = {
        url: "../Images/FishUp.gif",
        optimized: false,
        scaledSize: new google.maps.Size(12, 25), // scaled size
        origin: new google.maps.Point(0,0), // origin
        anchor: new google.maps.Point(6, 12) // anchor
    };

    for (i = 0; i < num_fish; i++){
        var fish = fishModule.getFish(i);
        var fish_marker = new google.maps.Marker({
            position: fishModule.getFishPos(fish),
            map: map,
            optimized: false,
            //icon: "../Images/FishUp.gif"
            icon: icon
        });
        marker_arr.push(fish_marker);
    }
}

function isWater(pointLat, pointLong){ 
		var img = document.getElementById('mapImg');
		// Bypass the security issue : drawing a canvas from an external URL.
		img.crossOrigin='anonymous';
		img.src = "http://maps.googleapis.com/maps/api/staticmap?center=" + pointLat + "," + pointLong + "&zoom=7&size=10x10&maptype=roadmap&sensor=false&key=AIzaSyBlgvy0fzNQ1YihpqsBMg9afTrJhYTMeBo";
		//add to canvas
		var canvas = document.getElementById("myCanvas");	
		canvas.width = img.width;
		canvas.height = img.height;			
		canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
		var pixelData = canvas.getContext('2d').getImageData(1, 1, 1, 1).data;
		//check color
		if (pixelData[0] == 163 &&
			pixelData[1] == 204 &&
			pixelData[2] == 255) {
			return true;
		} else {
			return false;
	}
}

function initMap(){
    //boatModule.createBoat ("BoatyMcBoatFace", -25.363, 131.044);
    boatModule.createBoat ("BoatyMcBoatFace", -25.363, 170.044);
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

    var down_icon = {
        url: "../Images/BoatDown.gif",
        optimized: false,
        scaledSize: new google.maps.Size(35, 50), // scaled size
        origin: new google.maps.Point(0,0), // origin
        anchor: new google.maps.Point(17,25) // anchor
    };

    var boat_marker = new google.maps.Marker({
        position: boat,
        map: map,
        optimized: false,
        icon: down_icon
    });

    setMarkers(map, num_fish, marker_arr);

    movementModule.init(boat, boat_marker, fish_arr, marker_arr, map);
};

window.addEventListener("onload", initMap());
