        function initMap() {
            var map;
		    var locations;
            map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: 40.712776, lng: -74.005974},
				zoom: 11}),
				locations = [
	{
		title: 'Hanover',
		position: {lat: 42.1131600, lng: -70.8119900},
		icon: {
			url: "assets/img/icon.png",
			
		}

	},
	{
		title: 'Elizabeth',
		position: {lat: 40.663994, lng: -74.210701},
		icon: {
			url: "assets/img/icon.png",
			
		}
	},
	{
		title: 'Jersey City',
		position: {lat: 40.728157, lng: -74.077644},
		icon: {
			url: "assets/img/icon.png",
			
		}
	},
	{
		title: 'East New York',
		position: {lat: 40.6667700, lng: -73.8823600},
		icon: {
			url: "assets/img/icon.png",
			
		}
	},	
	{
		title: 'Mineola',
		position: {lat: 40.749268, lng: -73.640684},
		icon: {
			url: "assets/img/icon.png",
			
		}
	},						
];
locations.forEach( function( element ) {
	var marker = new google.maps.Marker({
			position: element.position,
			map: map,
			title: element.title,
			icon: element.icon,		
		});
	});	
}
		