Planet = function(universe,p) {
  this.name     = p.name;
  this.universe = universe;
  this.shadow   = true; // turn off the sun
  this.offset   = 0; // time offset for the planet from the universe, in days

  this.drawDeferent  = true;  // draw the deferent circle

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

  this.elliptic = function(eccentricity) {
    var c = {type:'ellipse',radius:this.aus,mm:this.mm};
    c.eccentricity = eccentricity || this.eccentricity || 0;
    this.cycle(c);
    return this;
  };

  this._cycles = [];
  this.cycle = function(e) {
    if (e == undefined) { return this._cycles.shift; }
    else { this._cycles.push( e ); }
    e.type = e.type || 'epicycle';
    return this;
  };

  this.cycles = function(es) {
    // type = tusi, epicycle, urdi, ellipse
    if (es == undefined) { return this._cycles; }
    if (!( es instanceof Array)) {
      es = [es];
    }
    for (i in es) {
      var epi = es[i];
      epi.type = epi.type || "epicycle";
      this._cycles.push( epi );
    }
    return this;
  };

  this.equant   = function(eq) {
    if (eq) this._equant = eq;
    return this;
  };
  this.deferent = function(d) {
    d = d || {type:'epicycle',mm:this.mm,radius:this.aus};
    if (this._equant === true) { d.equant = this._eccentric*2; }
    else if (this._equant)     { d.equant = _equant; }
    this.cycle(d);
    return this;
  };

  this.couple = function(es) {
    if (es == undefined) { return this._cycles; }
    // type = tusi, epicycle, urdi, hippopede
    es.type = es.type || "tusi";
    this._cycles.push( es );
    return this;
  };

};

Planet.prototype = {
  ctx: function() {
    return $('#dynamic')[0].getContext("2d");
  },

  renderToCanvas: function (width, height, renderFunction) {
    var buffer = document.createElement('canvas');
    buffer.width = width;
    buffer.height = height;
    renderFunction(buffer.getContext('2d'));
    return buffer;
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

  hippopede: function(e) {
    // eodoxus will have to wait for a 3D canvas to be demonstrated properly
    a = e.radius*20; b = a*1; 
    et = this.day * e.mm * Math.PI/180 ;

    //epi_x = this.x - 2*Math.cos(et)*Math.sqrt( Math.abs( a - b * Math.sin(et)*Math.sin(et) ) );
    //epi_y = this.y - 2*Math.sin(et)*Math.sqrt( Math.abs( a - b * Math.sin(et)*Math.sin(et) ) );
    
    epi_x = this.x - 3*e.radius*Math.sin(et);
    epi_y = this.y - e.radius*Math.sin(2*et);

    //this.drawLine(this.x, this.y, epi_x, epi_y);
    this.x = epi_x; this.y = epi_y;
  },

  tusi: function(e) {
    var t = this.t+3*Math.PI/2;  // elipse along x-axis, add PI/2, 3PI/2 along the y-axis
    var a = 0.5*e.radius;
    var b = 0.5*a;

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
    this.x = cx; this.y = cy;
    return this;
  },

  urdi: function(e) {
    var t = this.t;
    return this;
  },

  ellipse: function(el) {
    var t = this.t;
    phi = 90*Math.PI/180;
   
    var a = el.radius || this.meancenter; // major axis is equal the mean distance to the focus
    var e = el.eccentricity*this.universe.eccentricityFactor;
    var b = a*Math.sqrt(Math.abs(1-e*e));
    this.last_ex = this.ex; this.lastey = this.ey;
    this.x = this.origin.x + a*Math.cos(t)*Math.cos(phi) - b*Math.sin(t)*Math.sin(phi);
    this.y = this.origin.y + a*Math.cos(t)*Math.sin(phi) - b*Math.sin(t)*Math.cos(phi);
    return this;

  },

  epicycle: function (e) {
    // This function defines the behavior of both deferents and epicycles.
    // draw the epicycle unless it's the first one
    if (!(!this.drawDeferent && e.cycle_number == 0)) {
      this.drawCircle(this.x, this.y, e.radius);
    }

    // calculate the epicyclic position
    equant = this.equant_angle(); 
    epi_x = this.x - e.radius * Math.sin(equant);
    epi_y = this.y - e.radius * Math.cos(equant);

    // draw line from equant point to the point of rotation on the epicyle
    this.drawLine(this.current_cycle.equant_x, this.current_cycle.equant_y, epi_x, epi_y);

    // draw line to the point of rotation on the epicyle
    this.drawLine(this.x, this.y, epi_x, epi_y);
    this.x = epi_x; this.y = epi_y;
  },

  equant_angle: function(c) {
    c = c || this.current_cycle;

    var t = c.mm * this.day * Math.PI/180; // the angle from the equant point
    var r = c.radius || this.meancenter;
    var e = c.equant || 0;
    var k = e/r;

    if (!e) return t;

    c.equant_x = this.origin.x; c.equant_y = this.origin.y - e;
    // draw line from the origin to the equant point
    this.drawLine(this.origin.x, this.origin.y, c.equant_x, c.equant_y);

    // http://www.mathpages.com/home/kmath639/kmath639.htm equation (8)
    alpha = t - Math.asin(k*Math.sin(t)); // the angle from the center point
    return alpha ; 
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

    if (this.type == 'center') {
      // draw the center and get out of here
      this.x = ox; this.y = oy; 
      this.drawPlanet(this.x, this.y, this.size, { fill: true, color: this.color });
      return;
    }

    // The angle on the circle for the day
    this.t = t = this.day * this.mm * Math.PI/180;

    // start at the deferent center, which is offset by the eccentric, save the true center
    this.x = this.ox = ox;
    this.y = this.oy = oy - this._eccentric;

    // draw the line to the eccentric
    if (this._eccentric) this.drawLine(ox, oy, this.x, this.y);

    for (var e = 0; e < this._cycles.length; e++) {
      epi = this._cycles[e];
      epi.cycle_number = e;
      this.current_cycle = epi;
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

