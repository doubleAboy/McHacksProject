

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


function initMap() {
    boatModule.createBoat ("BoatyMcBoatFace", -25.363, 131.044);
    var boat = boatModule.getBoat();

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: boat
    });

    var marker = new google.maps.Marker({
        position: boat,
        map: map
    });
}