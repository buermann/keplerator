PlanetBase = {
	// ptolemy's mean distances:
	// http://books.google.com/books?id=ntZwxttZF-sC&lpg=PA34&dq=ptolemy%20distance%20deferent%20epicycle&pg=PA35#v=onepage&q&f=false
	// 360 degrees/earth days of it's year = mean motion in degrees/day,
	// tropical rather than synodic
	// size is the mean diameter of the body
  //                                0.9856012177969429
	sun: { color: "#EC0", aus: 1, mm: 0.985626283, period: 365.26, size: 1391000 },
	mercury: { color: "silver", aus: 0.387, mm: 4.09235, period: 87.97, size: 4878, eccentricity: 0.2056 },
	venus: { color: "#DCDBD6", aus: 0.723, mm: 1.60216, period: 224.7, size: 12104, eccentricity: 0.00677323 },
	earth: { color: "#35F", aus: 1.000, mm: 0.985600, period: 365.26, size: 12756, eccentricity: 0.0167 },
	  moon: { type: 'satellite', center: 'earth', color: '#F9F8F9', aus: 0.0026, mm: 13.35, period: 27.321, size: 3476, eccentricity: 0549 },
	mars: { color: "red", aus: 1.524, mm: 0.524051, period: 686.98, size: 6787, eccentricity: 0.09341233 },
	jupiter: { color: "orange", aus: 5.203, mm: 0.083092, period: 4331, size: 142984, eccentricity: 0.04839266 },
	  io: { type: 'satellite', center: 'jupiter', color: '#EAE18B', aus: .0028, mm: 360 / 1.77, size: 3660 },
	  europa: { type: 'satellite', center: 'jupiter', color: '#7C4724', aus: .0044, mm: 360 / 3.55, size: 3121 },
	  ganymede: { type: 'satellite', center: 'jupiter', color: '#7E766A', aus: .0072, mm: 360 / 7.15, size: 5262 },
	  callisto: { type: 'satellite', center: 'jupiter', color: '#716857', aus: .0126, mm: 360 / 16.68, size: 4820 },
	saturn: { color: "pink", aus: 9.539, mm: 0.033612, period: 10750, size: 112536, eccentricity: 0.05415060 },
	uranus: { color: "green", aus: 19.18, mm: 0.011693, period: 30660, size: 51118, eccentricity: 0.04716771 },
	neptune: { color: "purple", aus: 30.06, mm: 0.005973, period: 60152, size: 49528, eccentricity: 0.00858587 },
	pluto: { color: "white", aus: 39.53, mm: 0.004000, period: 90410, size: 2300, eccentricity: 0.248 },
}

Universe = function(conf) {
	this.planets = conf || PlanetBase;

	this.satellitePaths    = false;
	this.includeSatellites = false;
	//  We might be able to calculate something resembling a real start date from this: 
	// June 27th, 1280 planetary positions
	// http://books.google.com/books?id=PHdktsVb_X4C&pg=PA150&lpg=PA150
  // random start date, overridden if passed a value in universe.setup()
	this.day = Math.floor(Math.random() * 3650 + 1)
	this.rate = 2; // in days
	this.eccentricityFactor = 1; // exaggerate the eccentricity of elliptical orbits this much
	this.max_planet_size = 20;
	this.min_planet_size = 3;

	this.label = false;
	this.displayDay = true;
	this.shadow = true;

	var dynamic = $('#dynamic')[0];
	var static  = $('#static')[0];

	this.center = {};

	this.h = static.height = dynamic.height = Math.floor($(window).height()) * .95;
	this.w = static.width  = dynamic.width  = Math.floor($(window).width())  * .50;
	this.origin = { x: this.w / 2, y: this.h / 2 };

	this.addPlanets();

	var that = this;
	var toggleAnimation = function() {
		that.stopped ? that.start() : that.stop();
	}
	$('#dynamic').click(toggleAnimation);


}
Universe.prototype = {
	addPlanets: function() {
		for (var i in this.planets) {
			p = PlanetBase[i];
			p.name = i;
			// overwrite planetbase defaults with properties passed in the config object
			for (var prop in this.planets[i]) {
				p[prop] = this.planets[i][prop];
			}
			// find the center
			if (p.type == 'center') this.center = p;

			p.origin = this.origin;
			// extend the planet config object into a Planet object
			this.planets[p.name] = new Planet(this, p);
		}

		// Or set the center to the sun if there isn't one.
		if (Object.keys(this.center).length === 0) {
			this.center = this.planets.sun;
			this.planets.sun.type = 'center'
		}

	},

	setScale: function() {
		this.max_radius = 0;
		this.max_size = 1;

		for (var i in this.planets) {
			p = this.planets[i];
			if (p.name != 'sun' && p.size > this.max_size) this.max_size = p.size;

			if (p.type == 'center') continue; // the center doesn't move, so we don't need to scale to it :P

      // give the planet the default deferent if there are no cycles defined at all
      if (p._cycles.length == 0) p.deferent();

			rad = p._eccentric;
			for (var c in p._cycles) {
				rad += p._cycles[c].radius;
			}
			if (rad > this.max_radius) this.max_radius = rad;
			if (p.aus > 0 && p.aus < this.min_aus) this.min_radius = p.aus;
		}
		// scale to fit the largest orbit in the window
		l = (this.h > this.w) ? this.w / 2: this.h / 2;
		this.scale_factor = l / (this.max_radius);
		this.scale_size_factor = (this.max_size + 1) / this.max_planet_size; // the denominator here sets the max pixel size 
	},

	rescale: function() {
		this.setScale();
		for (var i in this.planets) {
			p = this.planets[i];

			// scale the sizes of the planets
			if (p.name == 'sun') { // just cram it in, it's a little big
				p.size = p.size / (this.scale_size_factor * 100);
			} else {
				p.size = Math.ceil(p.size / this.scale_size_factor);
			}
			if (p.size > this.max_planet_size) p.size = this.max_planet_size;
			if (p.size < this.min_planet_size) p.size = this.min_planet_size;

			p.meancenter = p.aus * this.scale_factor;
			p._eccentric = p._eccentric * this.scale_factor;

			for (var c in p._cycles) {
				p._cycles[c].radius = p._cycles[c].radius * this.scale_factor;
				p._cycles[c].equant = p._cycles[c].equant * this.scale_factor;
			}

			// somebody has established a single eccentric for the universe
			p.origin = this.origin;

		}
	},

	eccentric: function(e) {
		// set a universal eccentric
		for (p in this.planets) {
			this.planets[p].eccentric(e);
		}
	},

	setup: function(day) {
		day = day || this.day
		this.rescale();
		if (day > 0) this.animate(day);
		console.log("stop");
		this.stopped = true;
	},

	start: function(day) {
		console.log("start");
		if (day > 0) this.animate(day);
		this.stopped = false;
		var universe = this;

		requestAnimFrame(function() {
			universe.animate();
		});
	},

	stop: function(day) {

		if (day > 0) this.animate(day);
		this.stopped = true;
		console.log("stop");
	},

	drawTrail: function(disc) {
		ctx = $('#static')[0].getContext("2d");
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#050";
		ctx.beginPath();
		ctx.moveTo(disc.lastPoint[0], disc.lastPoint[1]);
		ctx.lineTo(disc.x, disc.y);
		ctx.closePath();
		ctx.stroke();
	},

	animate: function animate(day) {
		if (day > 0) this.day = day;

		ctx = $('#static')[0].getContext("2d");
		for (var n in this.planets) {
			p = this.planets[n];

			if (!this.includeSatellites & p.type == 'satellite') continue;

			p.lastPoint = [p.x, p.y];
			p.nextPoint(this.day);

			// draw a path behind the planet
			if (p.type != 'satellite') {
				this.drawTrail(p);
			} else if (this.satellitePaths) {
				this.drawTrail(p);
			}
		}

		if (this.displayDay) {
			ctx = $('#dynamic')[0].getContext("2d");
			ctx.fillStyle = '#DDD';
			ctx.font = '8pt Helvetica';
			ctx.fillText('Day: ' + Math.floor(this.day), this.w - 60, 20);
		}
		this.day += this.rate; // increment the day by 1.
		if (!this.stopped) {
			universe = this;
			requestAnimFrame(function() {
				$('#dynamic')[0].getContext('2d').clearRect(0, 0, universe.w, universe.h);
				universe.animate();
			});
		} else {
			startMsg = "Click to Start";
			ctx = $('#dynamic')[0].getContext("2d");
			ctx.moveTo(this.x / 2, this.y / 4);
			ctx.fillStyle = '#DDD';
			ctx.font = '12pt Helvetica';
			ctx.fillText(startMsg, this.w / 2, this.h / 6);
			ctx.closePath();
			ctx.stroke();
		}
	},
}

window.requestAnimFrame = (function(callback) {
	return (false || window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
		window.setTimeout(callback, 1000 / 60);
	});
})();

