

//boat module
var boatModule = (function(){
    var boat_array = [];

    function Boat (name, lat, lng) {
        this.name = name;
        this.colour = "rgb(255, 77, 77)"
        this.col_size = 10; //pixels radius
        this.lat = lat;
        this.lng = lng;
        this.velx = 0;
        this.vely = 0;
    };

    return {
        createBoat: function (name, lat, lng){
            var boat = new Boat (name, lat, lng);
            boat_array.push(boat);
        },

        getBoat: function (){
            return boat_array[0];
        }
    }
}());

//fish module
var fishModule = (function(){
    var fish_array = [];

    function Fish (name, lat, lng) {
        this.name = name;
        this.colour = "rgb(255, 77, 77)"
        this.col_size = 10; //pixels radius
		this.weight = 5;
        this.lat = lat;
        this.lng = lng;
        this.velx = 0;
        this.vely = 0;
    };

    return {
        createFish: function (name, lat, lng){
            var fish = new Fish (name, lat, lng);
            fish_array.push(fish);
        },

        getFish: function (ind){
            return fish_array[ind];
        },
		
		/*getFishPos: function(){
			return {lat: this.lat, lng: this.lng};
		}*/
    }
}());


function initMap() {
    boatModule.createBoat ("BoatyMcBoatFace", -25.363, 131.044);
	fishModule.createFish ("Phish1", -25.345, 131.933);
    var boat = boatModule.getBoat();
	var fish = fishModule.getFish(0);
	//var myLatLng = {lat: -26.345, lng: 132.933};
	//var myLatLng2 = {lat: -28.345, lng: 134.933};

	//var pos = fishModule.getFishPos;

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: boat
    });

    var marker = new google.maps.Marker({
        position: boat,
        map: map
    });
	
	var marker_fish = new google.maps.Marker({
        position: fish,
        map: map
    });
	/*
	var marker3 = new google.maps.Marker({
        position: myLatLng2,
        map: map
    });
	*/
}