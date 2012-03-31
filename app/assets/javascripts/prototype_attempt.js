var Universe = {};
Universe.prototype = {
    
    // track the last frame time, we only draw the static layer while the animation is moving smoothly.
   lasttime: {},

    Planets: {
      mercury:  {color:"silver",aus:0.387,period:87.97, size:4878   },
      venus:    {color:"yellow",aus:0.723,period:224.7, size:12104  },
      earth:    {color:"blue",  aus:1.000,period:365.26,size:12756  },
      mars:     {color:"red",   aus:1.524,period:686.98,size:6787   },
      jupiter:  {color:"orange",aus:5.203,period:4331,  size:142984 },
      saturn:   {color:"pink",  aus:9.539,period:10750, size:112536},
      uranus:   {color:"green", aus:19.18,period:30660, size:51118  },
      neptune:  {color:"purple",aus:30.06,period:60152, size:49528  },
      pluto:    {color:"white", aus:39.53,period:90410, size:2300   }
    },

  onload: function() {
    var canvas = $('#canvas');
    $('body').height = canvas.height = static_canvas = $(window).height();
    $('body').width  = canvas.width  = static_canvas = $(window).width();
    $(window).resize( function() { scaleUniverse() });
    
    var stage        = new Kinetic.Stage("canvas", canvas.width, canvas.height);
    var staticLayer  = new Kinetic.Layer({name:'static'});
    var layer        = new Kinetic.Layer({name:"dynamic"});
    stage.stop();
    var toggleAnimation = function(){ stage.isAnimating ? stage.stop() : stage.start(); }
    stage.on("click", toggleAnimation );

    var center = new Kinetic.Circle({
      x: stage.width / 2,
      y: stage.height / 2,
      radius: 1391000/300000,
      fill: "yellow",
      stroke: "yellow",
      strokeWidth: 0
    });
    layer.add(center);

    stage.add(layer);
    stage.add(staticLayer);

    staticLayer.setZIndex(0);
    layer.setZIndex(1);

    for (var i in Planets ) { //= 0; i <= Planets.length; i++) {
      addPlanet(layer, Planets[i]);
    }
      // Each method would take {label:...,offset:float,degrees:int,radians:float,draw:bool}
    //  The angel in degrees/radians from the east provide the initial condition
    // Planet.eccentric({label:...,offset:float,degrees:int,radians:float,draw:bool})
    // Planet.epicycle({ radius:float, period:float }
    // Planet.equant...
    // Planet.tusi({radius:float}) // 
    // Planet.urdi({  }) // urdi is a particular kind of offset epicycle on an epicycle

    // We also need "vertical" tusi couples and epicycles along the z-axis.

    // Add a "static" canvas for drawing immobile points?
    stage.onFrame(function(frame){
      animate(stage, frame);
    });
    stage.start();
  },

   path: function (layer,p) {
      ctx = layer.context
      ctx.lineWidth   = 1;
      ctx.strokeStyle = "#050";
      ctx.beginPath;
      ctx.moveTo(p.lastPoint[0],p.lastPoint[1]);
      ctx.lineTo(p.x,p.y);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
  },

  animate: function(stage, frame) {
    var layer         = stage.childrenNames['dynamic'];
    var staticLayer   = stage.childrenNames['static'];
    var planets       = layer.getChildren();
    var origin        = {x:stage.width / 2, y:stage.height/2 };

    //if (frame.time>1000) console.log(frame.time);

    for (var n = 0; n < planets.length; n++ ) {
      p = planets[n];
      if (p.type != 'planet') continue;

      p.lastPoint = [p.x,p.y]; 

      // tusi couple parametric http://mathworld.wolfram.com/Hypocycloid.html
      //
      var t = frame.time * 2 * Math.PI / p.period;
      p.x = origin.x + p.au*Math.cos(t);
      p.y = origin.y + p.au*Math.sin(t);

      if (frame.time-lasttime < 200) {
         path(staticLayer,p);
      }
    }
    lasttime = frame.time; 
    layer.draw();
  },

  scaleUniverse: function() {
    var canvas = $('#canvas');
    $('body').height = canvas.height = $(window).height();
    $('body').width  = canvas.width  = $(window).width();
  },

  addPlanet: function (layer, P ) {
      //array ||= [color:"blue",aus:1,period:365,size:12756];
      meansun = P.aus*35;
      h = $(window).height();
      w = $(window).width();
 
      var planet = new Kinetic.Circle({
        x: meansun+ w/2,
        y: h / 2,
        radius: Math.ceil(P.size/6000),
        name:P.name,
        type:'planet',
        au:meansun,
        period:P.period*20,
        lastPoint: [],

        fill: P.color,
        stroke: P.color,
        strokeWidth: 0,
      });
      layer.add(planet);
   }

}
