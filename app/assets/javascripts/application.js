function Universe() {
	this.origin = {
		x: Math.ceil($(window).width() / 2),
		y: Math.ceil($(window).height() / 2)
	};

  this.day = Math.floor(Math.random()*3650+1)
	this.rate = 2; // in days
  this.max_planet_size = 20;
  this.min_planet_size = 3;
  this.max_aus = 0;
	this.min_aus = 100;

  this.label    = false;
  this.displayDay = true;
  this.shadow   = true;

	this.PlanetBase = {
    // ptolemy's mean distances:
    // http://books.google.com/books?id=ntZwxttZF-sC&lpg=PA34&dq=ptolemy%20distance%20deferent%20epicycle&pg=PA35#v=onepage&q&f=false
    // 360 degrees/earth days of it's year = mean motion in degrees/day,
    // tropical rather than synodic
    // size is the mean diameter of the body
		sun:    { color: "#EC0",  aus: 1,     mm: 0.985626283,period: 365.26,  size: 1391000 },
		mercury:{ color: "silver",  aus: 0.387, mm: 4.09235,period: 87.97,  size: 4878 },
		venus:  { color: "#DCDBD6", aus: 0.723, mm: 1.60216,period: 224.7,  size: 12104 },
		earth:  { color: "#35F",    aus: 1.000, mm: 0.985600,period: 365.26,size: 12756 },
      moon:   { center:'earth', color: '#F9F8F9', aus:0.0026, mm: 13.35,  period:27.321,  size: 3476, },
		mars:   { color: "red",     aus: 1.524, mm: 0.524051,period: 686.98,size: 6787 },
		jupiter:{ color: "orange",  aus: 5.203, mm: 0.083092,period: 4331,  size: 142984 },
      io:      { center:'jupiter',color:'#EAE18B', aus:.0028, mm:1.77/365.2, size:3660},
      europa:  { center:'jupiter',color:'#7C4724', aus:.0044, mm:3.55/365.2, size:3121},
      ganymede:{ center:'jupiter',color:'#7E766A', aus:.0072, mm:7.15/365.2, size:5262},
      callisto:{ center:'jupiter',color:'#716857', aus:.0126, mm:16.68/365.2,size:4820},
		saturn: { color: "pink",    aus: 9.539, mm: 0.033612,period: 10750, size: 112536 },
		uranus: { color: "green",   aus: 19.18, mm: 0.011693,period: 30660, size: 51118 },
		neptune:{ color: "purple",  aus: 30.06, mm: 0.005973,period: 60152, size: 49528 },
		pluto:  { color: "white",   aus: 39.53, mm: 0.004000,period: 90410, size: 2300 },
	}

}
Universe.prototype = {
	init: function init(conf) {
		this.planets = conf || this.PlanetBase;
	  // after onload...
	  var dynamic = $('#dynamic')[0];
	  var static = $('#static')[0];

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

      p._eccentric = p._eccentric * this.scale_factor;
			p.meancenter = p.aus * this.scale_factor;

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
		console.log("stop");
		this.stopped = true;
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

			p.lastPoint = [p.x, p.y];
			p.nextPoint(this.day);

			// draw a path behind the planet
			this.drawTrail(p);
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
    }
  },
}

Planet = function(universe,p) {
  this.name     = p.name;
  this.universe = universe;
  this.shadow   = true;
  this.offset   = 0;

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
    this.mm  = mm;
    this.aus = distance;
    return this;
  }

  this.cycles = [];

  this.epicycles = function(es) {
    // type = tusi, epicycle, urdi, ellipse
    if (es == undefined) { return this.cycles; }
    es.type = es.type || "epicycle";
    this.cycles.push( es );
    return this;
  };
  this.couple = function(es) {
    // type = tusi, epicycle, urdi, ellipse
    if (es == undefined) { return this.cycles; }
    es.type = es.type || "tusi";
    this.cycles.push( es );
    return this;
  };

};

Planet.prototype = {
  ctx: function() {
    return $('#dynamic')[0].getContext("2d");
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

  equant: function(_equant) {
    if (_equant != undefined ) {
      this._equant = (_equant) ? true : false;
      return this;
    }
    // if there's no equant we move uniformly around the center
    if (!this._equant) return this.meancenter;

      // draw the line to the equant
      this.drawLine(this.origin.x, this.origin.y, this.origin.x, this.origin.y-2*this._eccentric);

      // via http://people.sc.fsu.edu/~dduke/mars.as
      var gam = 180/Math.PI * Math.asin( this._eccentric / this.meancenter * Math.sin( this.t ) )
      var rho = Math.sqrt(this.meancenter*this.meancenter+this._eccentric*this._eccentric-2*this._eccentric*this.meancenter*Math.cos((this.mm*this.day-gam)*Math.PI/180))
      return rho; 
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
    this.ex = ox + a*Math.cos(t)*Math.cos(phi) - b*Math.sin(t)*Math.sin(phi);
    this.ey = oy + a*Math.cos(t)*Math.sin(phi) - b*Math.sin(t)*Math.cos(phi);
    this.drawCircle(this.ex, this.ey, 1, {color:'#FF0'});
    return this;
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

  renderToCanvas: function (width, height, renderFunction) {
    var buffer = document.createElement('canvas');
    buffer.width = width;
    buffer.height = height;
    renderFunction(buffer.getContext('2d'));
    return buffer;
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

    // rotate the planet image so the sunny side faces the sun
    dctx = this.disc.getContext('2d');
    offset_x = -dctx.canvas.width/2;
    offset_y = -dctx.canvas.height/2;

    angle = Math.atan2(this.universe.planets.sun.y-y, this.universe.planets.sun.x-x);
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

    // find the deferent
    eq = this.equant();
    this.last_eq = eq;
    var def_x = this.x = ox -                   eq * Math.sin( this.t );
    var def_y = this.y = oy - this._eccentric - eq * Math.cos( this.t );

    // draw the line to the eccentric
    if (this._eccentric) this.drawLine(this.origin.x, this.origin.y, this.origin.x, this.origin.y-this._eccentric);
      // draw the line from the center of the deferent to the point
      this.drawLine(ox, oy-this._eccentric, def_x, def_y);

      if (this._equant) {
        // draw the equant line to the deferent center
        this.drawLine(this.origin.x,this.origin.y-2*this._eccentric, def_x, def_y);
      }

      var last_x, last_y;
      for (var e = 0; e < this.cycles.length; e++) {
        epi = this.cycles[e];
        if (!epi || !epi.radius ) { break; }
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

