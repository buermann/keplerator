//= require jquery

function Universe() {
	this.origin = {
		x: Math.ceil($(window).width() / 2),
		y: Math.ceil($(window).height() / 2)
	};

  //  We might be able to calculate something resembling a real start date from this: 
  // June 27th, 1280 planetary positions
  // http://books.google.com/books?id=PHdktsVb_X4C&pg=PA150&lpg=PA150
  this.day = Math.floor(Math.random()*3650+1)
	this.rate = 2; // in days

  this.eccentricityFactor = 1; // exaggerate the eccentricity of elliptical orbits this much
  this.max_planet_size = 20;
  this.min_planet_size = 3;
  this.max_aus = 0;
	this.min_aus = 100;


  this.label    = false;
  this.displayDay = true;
  this.shadow   = true;


  this.base_period = this.bp = 365.26;
	this.PlanetBase = {
    // ptolemy's mean distances:
    // http://books.google.com/books?id=ntZwxttZF-sC&lpg=PA34&dq=ptolemy%20distance%20deferent%20epicycle&pg=PA35#v=onepage&q&f=false
    // 360 degrees/earth days of it's year = mean motion in degrees/day,
    // tropical rather than synodic
    // size is the mean diameter of the body
		sun:    { color: "#EC0",  aus: 1, mm: 0.985626283,period: 365.26,  size: 1391000 },
		mercury:{ color: "silver",  aus: 0.387, mm: 4.09235,period: 87.97,  size: 4878, eccentricity:0.2056},
		venus:  { color: "#DCDBD6", aus: 0.723, mm: 1.60216,period: 224.7,  size: 12104, eccentricity:0.00677323 },
		earth:  { color: "#35F",    aus: 1.000, mm: 0.985600,period: 365.26,size: 12756, eccentricity:0.0167 },
      moon:   { type:'satellite', center:'earth', color: '#F9F8F9', aus:0.0026, mm: 13.35,  period:27.321,  size: 3476, eccentricity:0549 },
		mars:   { color: "red",     aus: 1.524, mm: 0.524051,period: 686.98,size: 6787, eccentricity:0.09341233 },
		jupiter:{ color: "orange",  aus: 5.203, mm: 0.083092,period: 4331,  size: 142984, eccentricity:0.04839266 },
      io:      { type:'satellite', center:'jupiter',color:'#EAE18B', aus:.0028, mm:360/1.77, size:3660},
      europa:  { type:'satellite', center:'jupiter',color:'#7C4724', aus:.0044, mm:360/3.55, size:3121},
      ganymede:{ type:'satellite', center:'jupiter',color:'#7E766A', aus:.0072, mm:360/7.15, size:5262},
      callisto:{ type:'satellite', center:'jupiter',color:'#716857', aus:.0126, mm:360/16.68,size:4820},
		saturn: { color: "pink",    aus: 9.539, mm: 0.033612,period: 10750, size: 112536, eccentricity:0.05415060 },
		uranus: { color: "green",   aus: 19.18, mm: 0.011693,period: 30660, size: 51118, eccentricity:0.04716771 },
		neptune:{ color: "purple",  aus: 30.06, mm: 0.005973,period: 60152, size: 49528, eccentricity:0.00858587 },
		pluto:  { color: "white",   aus: 39.53, mm: 0.004000,period: 90410, size: 2300, eccentricity:0.248 },
	}

}
Universe.prototype = {
	init: function init(conf) {
		this.planets = conf || this.PlanetBase;
	  // after onload...
	  var dynamic = $('#dynamic')[0];
	  var static = $('#static')[0];
    
    this.center = {};
    this.satellitePaths    = false;
    this.includeSatellites = false;
    
		this.h = static.height = dynamic.height = Math.floor($(window).height())*.95;
		this.w =  static.width = dynamic.width = Math.floor($(window).width())*.6;
		this.origin = { x: this.w / 2, y: this.h / 2 };

    //this.addPlanets();
    this.addPlanets();
    
		var that = this;
		var toggleAnimation = function() {
			that.stopped ? that.start() : that.stop();
		}
		$('#dynamic').click(toggleAnimation);
	},

  addPlanets: function() {
		for (var i in this.planets) {
      p = this.PlanetBase[i];
			p.name = i;
      // overwrite planetbase defaults with properties passed in the config object
      for (var prop in this.planets[i]) {
        p[prop] = this.planets[i][prop];
      }
      // find the center
      if (p.type == 'center') this.center = p;

		  p.origin = this.origin;
      // extend the planet config object into a Planet object
		  this.planets[p.name] = new Planet(this,p);
    }

    // Or set the center to the sun if there isn't one.
    if (Object.keys(this.center).length === 0 ) {
      this.center = this.planets.sun;
      this.planets.sun.type = 'center'
    }
    
  },

  setScale: function() {
		// find the largest orbit in the "universe"
    this.max_radius = 0;
    this.max_size   = 1;
		for (var i in this.planets) {
			p = this.planets[i];
      if (p.name != 'sun' && p.size > this.max_size) this.max_size = p.size;

      if (p.type =='center') continue; // the center doesn't move, so we don't need to scale to it's movemens

      epi_rad = 0;
      for (var c in p.cycles) {
        epi_rad += p.cycles[c].radius;
      }
      rad = p.aus+epi_rad;
			if (rad > this.max_radius) this.max_radius = rad;
			if (p.aus > 0 && p.aus < this.min_aus) this.min_radius = p.aus;
		}
		// scale to fit the largest orbit in the window
		l = (this.h > this.w) ? this.w/2 : this.h/2;
		this.scale_factor = l/(this.max_radius);
    this.scale_size_factor = (this.max_size+1)/this.max_planet_size; // the denominator here sets the max pixel size 
    
  },

  rescale: function() {
    this.setScale(); 
		for (var i in this.planets) {
      p = this.planets[i];

			// scale the sizes of the planets
			if (p.name == 'sun') { // the sun has 'special' scaling issues, just cram it in.
				p.size = p.size/(this.scale_size_factor*100);
			} else {
				p.size = Math.ceil( p.size / this.scale_size_factor );
			}
      if (p.size > this.max_planet_size) p.size = this.max_planet_size;
      if (p.size < this.min_planet_size) p.size = this.min_planet_size;

			p.meancenter = p.aus        * this.scale_factor;
      p._eccentric = p._eccentric * this.scale_factor;

      if (typeof p._equant === 'object') {
        p._equant.radius = p._equant.radius * this.scale_factor;
      }

      // the cycles won't be defined yet...
      for (var c in  p.cycles) {
        p.cycles[c].radius = p.cycles[c].radius * this.scale_factor;
      }

			// somebody has established a single eccentric for the universe
		  p.origin = this.origin;

		}
  },


/*  centerTransform: function() {
		for (var i in this.planets) {
      p = this.planets[i];

      // this makes sense in a way, but you don't end up at ptolemy at all
      this.planets[i].aus     = Math.abs(p.aus    - this.center.aus);
      this.planets[i].period  = Math.abs(p.period - this.center.period);
      // what we really need to do here is subtract its motions from 
      // the other planets...  this is definitely not that.
      if (this.planets[this.center.name].cycles) {
        this.planets[i].cycles  = p.cycles.concat(this.planets[this.center.name].cycles);
    }
    this.planets[this.center.name].cycles = [];
  },
*/


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
      if (p.type != 'satellite' ) {
        this.drawTrail(p);
      } else if (this.satellitePaths) {
        this.drawTrail(p);
      }
		}

    if (this.displayDay) {
      ctx = $('#dynamic')[0].getContext("2d");
      ctx.fillStyle = '#DDD'; 
      ctx.font = '8pt Helvetica';
      ctx.fillText('Day: '+Math.floor(this.day),this.w-60,20);
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
      ctx.moveTo(this.x/2,this.y/4);
      ctx.fillStyle = '#DDD'; 
      ctx.font = '12pt Helvetica';
      ctx.fillText(startMsg,this.w/2,this.h/6);
      ctx.closePath();
      ctx.stroke();
    }
  },
}

Planet = function(universe,p) {
  this.name     = p.name;
  this.universe = universe;
  this.shadow   = true;
  this.offset   = 0;

  this._deferent = 'circle';

  this.drawEccentric = true; // draw line from the eccentric to the deferent
  this.drawEquant    = true; // draw line from the equant to the deferent
  this.drawDeferent  = true; // draw the deferent circle

  this.ctx = $('#dynamic')[0].getContext("2d");

  // create object methods for any given shit that is passed until we think of everything:
  for (i in p) {
    this[i] = p[i];
  }

  this._eccentric = 0;
  this.eccentric = function(e) {
    if (e == undefined) {
      return this._eccentric;
    }
    this._eccentric = e;
    return this;
  };

  this.deferent = function(mm, distance) {
    this._deferent = 'circle';
    this.mm  = mm;
    this.aus = distance;
    return this;
  };

  this.elliptic = function(eccentricity) {
    this._deferent = 'ellipse';
    this.eccentricty  = eccentricity || this.eccentricty;
    return this;
  };

  this.cycles = [];

  this.epicycles = function(es) {
    // type = tusi, epicycle, urdi, ellipse
    if (es == undefined) { return this.cycles; }
    if (!( es instanceof Array)) {
      es = [es];
    }
    for (i in es) {
      var epi = es[i];
      epi.type = epi.type || "epicycle";
      this.cycles.push( epi );
    }
    return this;
  };

  this.couple = function(es) {
    if (es == undefined) { return this.cycles; }
    // type = tusi, epicycle, urdi, hippopede
    es.type = es.type || "tusi";
    this.cycles.push( es );
    return this;
  };

};

Planet.prototype = {
  ctx: function() {
    return $('#dynamic')[0].getContext("2d");
  },

  drawLine: function(x1, y1, x2, y2, p) {
    p = p || {};
    p.color = p.color  || '#DDD';
    var canvas  = p.canvas || 'dynamic';
    var ctx = this.ctx;
    this.drawCircle(x1, y1, 1, p);
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
    this.drawCircle(x2, y2, 1);
  },

  drawCircle: function(x, y, r, p) {
    if (!x || !y || !r) return; // don't bother if there's nothing to draw
      p = p || {}
    p.color = p.color || '#FFF';
    var ctx = this.ctx;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1;
    ctx.moveTo(x, y);
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI * 2, 0, false);
    ctx.closePath();
    ctx.stroke();
  },
  drawPlanet: function(x, y, r, p) {
    if (!x || !y || !r) return; // don't bother if there's nothing to draw
      p = p || {}
    p.color = this.color || '#FFF';

    var ctx  = this.ctx;
    that = this;
    this.disc = this.disc || this.renderToCanvas(2*r,2*r,function(ctx) {
      x = ctx.canvas.width/2; y = ctx.canvas.height/2;
      ctx.moveTo(x, y);
      ctx.beginPath();
      ctx.arc(x, y, r, Math.PI * 2, 0, false);
      ctx.closePath();
      if (that.name == 'sun' || that.shadow == false) {
        var grd = ctx.createRadialGradient(x,y,r/8,x,y,r);
        grd.addColorStop(0, p.color);
        grd.addColorStop(.8, "#FF0");
        grd.addColorStop(1, "#FFE");
        ctx.fillStyle = grd;
        ctx.fill();
      } else { 
        var grd = ctx.createRadialGradient(x,y,r,x,y-r,r);
        grd.addColorStop(0, "#222");
        grd.addColorStop(.6, "#100");
        grd.addColorStop(1, p.color);
        ctx.fillStyle = grd;
        ctx.fill();
      }
    });

    // rotate the planet image so the sunny side faces the sun, or the center if there is no sun
    dctx = this.disc.getContext('2d');
    offset_x = -dctx.canvas.width/2;
    offset_y = -dctx.canvas.height/2;

    var cx,cy;
    if ( this.universe.planets.sun ) {
      cx = this.universe.planets.sun.x;
      cy = this.universe.planets.sun.y;
    } else { 
      cx = this.origin.x;
      cy = this.origin.y;
    }
    angle = Math.atan2(cy-y, this.universe.planets.cx-x);
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(Math.PI/2+angle);
    ctx.drawImage(dctx.canvas,offset_x,offset_y);
    ctx.restore();

    if (this.universe.label) {
      var fs = 8;
      var that = this;
      this.label = this.label || this.renderToCanvas(this.name.length*fs,fs,function(ctx) {
        ctx.fillStyle = p.color; 
        ctx.font = fs+'pt Helvetica';
        ctx.fillText(that.name,0,ctx.canvas.height);
      });
      ctx.drawImage(this.label,x+r+5,y+offset_y);
    }
  },


  renderToCanvas: function (width, height, renderFunction) {
    var buffer = document.createElement('canvas');
    buffer.width = width;
    buffer.height = height;
    renderFunction(buffer.getContext('2d'));
    return buffer;
  },


  hippopede: function(e) {
    a = e.radius*20; b = a*1; 
    et = this.day * e.period * Math.PI/180 ;

    //epi_x = this.x - 2*Math.cos(et)*Math.sqrt( Math.abs( a - b * Math.sin(et)*Math.sin(et) ) );
    //epi_y = this.y - 2*Math.sin(et)*Math.sqrt( Math.abs( a - b * Math.sin(et)*Math.sin(et) ) );
    
    epi_x = this.x - 3*e.radius*Math.sin(et);
    epi_y = this.y - e.radius*Math.sin(2*et);

    //this.drawLine(this.x, this.y, epi_x, epi_y);
    this.x = epi_x; this.y = epi_y;
  },

  epicycle: function (e) {
    // draw the epicycle
    this.drawCircle(this.x, this.y, e.radius);

    // calculate the epicyclic position
    // The outer planets should be using the sun's mean motion for e.period
    et = this.day * e.period * Math.PI/180 ;

    epi_x = this.x - e.radius * Math.sin(et);
    epi_y = this.y - e.radius * Math.cos(et);

    // draw line to the point of rotation on the epicyle
    this.drawLine(this.x, this.y, epi_x, epi_y);
    this.x = epi_x; this.y = epi_y;
  },

  tusi: function(e) {
    var t = this.t+3*Math.PI/2;  // elipse along x-axis, add PI/2, 3PI/2 along the y-axis
    var a = 0.5*e.radius;
    var b = 0.5*a;
    p.aus = p.aus - e.radius; // if we're using the actual AUs to scale the universe, to maintain that same scale we need to forshorten the deferent of the planet's orbit by the total elongation of the tusi couple

    // draw the tusi couple
    this.drawCircle(this.x, this.y, e.radius);
    // draw the connecting point of the couple
    var ix = this.x + b*Math.cos(t) + b*Math.cos(t) 
    var iy = this.y + b*Math.sin(t) + b*Math.sin(t)
    this.drawCircle(ix, iy, .5*e.radius);

    // draw the lines linking its bits up
    var cx = this.x + a*Math.cos(t) - a*Math.cos(t) 
    var cy = this.y + a*Math.sin(t) + a*Math.sin(t)
    this.drawLine(ix,iy,cx,cy);
    this.drawLine(this.x,this.y,cx,cy);
    /* if you wanted to add an extension onto the couple:
    this.drawLine(this.x,this.y,cx,cy-radius);
*/
    this.x = cx; this.y = cy;
    return this;
  },

  urdi: function(e) {
    var t = this.t;
    return this;
  },

  ellipse: function(e) {
    var t = this.t;
    phi = 90*Math.PI/180;
    this.last_ex = this.ex; this.lastey = this.ey;
    a = e.radius+this.meancenter; b = this.meancenter;

    this.ex = this.origin.x + a*Math.cos(t)*Math.cos(phi) - b*Math.sin(t)*Math.sin(phi);
    this.ey = this.origin.y + a*Math.cos(t)*Math.sin(phi) - b*Math.sin(t)*Math.cos(phi);
    //this.drawCircle(this.ex, this.ey, 1, {color:'#FF0'});
    return this;
  },


  equant: function(_equant) {
    if (_equant != undefined ) {
      this._equant = (_equant) ? _equant : false;
      return this;
    }

    // if there's no equant we move uniformly around the center
    if (!this._equant) return this.meancenter;

    // draw the short line to the equant
    this.drawLine(this.origin.x, this.origin.y, this.origin.x, this.origin.y-2*this._eccentric);

    de = (typeof this._equant === 'boolean') ? this._eccentric : this._equant;

    if (typeof this._equant === 'object') {
      // If the equant is passed as an object we have a further complication, the equant is moving on an auxillary circle as in Ptolemy's model of Mercury.
      eper = this._equant.period;
      erad = this._equant.radius;

      eqt = this.day * eper * Math.PI/180 ;
      aux_x = this.origin.x - erad * Math.sin(eqt);
      aux_y = this.origin.y-2*this._eccentric - erad * Math.cos(eqt);

      this.drawCircle( this.origin.x, this.origin.y-2*this._eccentric, erad );

      this.drawLine(this.origin.x, this.origin.y-2*this._eccentric, aux_x, aux_y );

      this.x = aux_x; this.y = aux_y;

      // so instead of using the _eccentric distance in our equant calculation we need
      // to calculate the distance between the rotating equant and the center.
      // Maybe?
      dx = this.x - this.origin.x;
      dy = this.y - this.origin.y;
      de = Math.sqrt( dx*dx+dy*dy ) / 2;

      this.equant_x = this.x;
      this.equant_y = this.y;

    } else {
      this.equant_x = this.x;
      this.equant_y = this.y - this._eccentric;

      // shift the present y to the equant point
      this.y = this.y - this._eccentric;
    }

      // calculate the point on the deferent circle from the equant point 
      // via http://people.sc.fsu.edu/~dduke/mars.as
      var gam = 180/Math.PI * Math.asin( de / this.meancenter * Math.sin( this.t ) )
      // If the meancenter/deferent has the same radius as the eccentric, in say a mercury or moon model, you'll get a NaN here
      var rho = Math.sqrt(this.meancenter*this.meancenter+de*de-2*de*this.meancenter*Math.cos((this.mm*this.day-gam)*Math.PI/180))
      return rho; 
  },
  nextPoint: function(day) {
    this.day = day +this.offset;
    var ox,oy;

    if (typeof this.center === 'undefined') {
      ox = this.origin.x
      oy = this.origin.y;
    } else {
      // for moons and geoheliocentric systems
      ox = this.universe.planets[this.center].x
      oy = this.universe.planets[this.center].y
    }

    if (this.type == 'center') { // == this.origin.y && this.x == this.origin.x) {
      // draw the center and get out of here
      this.x = ox; this.y = oy; 
      this.drawPlanet(this.x, this.y, this.size, { fill: true, color: this.color });
      return;
    }

    // http://farside.ph.utexas.edu/syntaxis/Almagest/node57.html#vf8
    // The period component calculated for the day:
    this.t = t = this.day * this.mm * Math.PI/180;

    // start drawing from the origin outward...

    // start at the deferent center, which is offset by the eccentric
    this.x = ox;
    this.y = oy - this._eccentric;

    // draw the line to the eccentric
    if (this._eccentric) this.drawLine(ox, oy, this.x, this.y);

    // find the equant parameter for the movement of the deferent,
    // and shift y to the equant point
    eq = this.equant();

    if (this._deferent == 'circle') {
      // draw the deferent 
      if (this.drawDeferent) {
        if (typeof this._equant == 'boolean') { 
          this.drawCircle(ox,oy-this._eccentric, this.meancenter);
        } else {
          this.drawCircle(this.x,this.y, this.meancenter);
        }
      }

      this.x = this.x - eq * Math.sin( this.t );
      this.y = this.y - eq * Math.cos( this.t );

      // draw the line from the center of the deferent to the deferent point
      if (this.drawEccentric) this.drawLine(ox, oy-this._eccentric, this.x, this.y);


      
    } else if (this._deferent == 'ellipse') {
      // if the planet has an elliptical path let it hang, unattached, in space
      phi = 90*Math.PI/180;

      var a = this.meancenter; // major axis is equal the mean distance to the focus
      var e = this.eccentricity*this.universe.eccentricityFactor;
      var b = a*Math.sqrt(Math.abs(1-e*e));

      this.x = this.x + a*Math.cos(t)*Math.cos(phi) - b*Math.sin(t)*Math.sin(phi);
      this.y = this.y + a*Math.cos(t)*Math.sin(phi) - b*Math.sin(t)*Math.cos(phi);
      //this.drawCircle(this.ex, this.ey, 1, {color:'#FF0'});
    }

    // draw the line from the equant to the center to the deferent
    if (this.drawEquant && this._equant) this.drawLine(this.equant_x,this.equant_y, this.x, this.y); 

    for (var e = 0; e < this.cycles.length; e++) {
      epi = this.cycles[e];
      if (!epi ) { break; }
      this[epi.type]( epi );
    }

    // draw the planet
    this.drawPlanet(this.x, this.y, this.size, { fill: true, color: this.color });
  },

}

window.requestAnimFrame = (function(callback) {
  return (false || window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
    window.setTimeout(callback, 1000 / 60);
  });
})();

