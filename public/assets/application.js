function Universe(){this.origin={x:Math.ceil($(window).width()/2),y:Math.ceil($(window).height()/2)},this.day=Math.floor(Math.random()*3650+1),this.rate=2,this.max_planet_size=20,this.min_planet_size=3,this.max_aus=0,this.min_aus=100,this.label=!1,this.displayDay=!0,this.shadow=!0,this.PlanetBase={sun:{color:"#EC0",aus:1,mm:.985626283,period:365.26,size:1391e3},mercury:{color:"silver",aus:.387,mm:4.09235,period:87.97,size:4878},venus:{color:"#DCDBD6",aus:.723,mm:1.60216,period:224.7,size:12104},earth:{color:"#35F",aus:1,mm:.9856,period:365.26,size:12756},moon:{center:"earth",color:"#F9F8F9",aus:.0026,mm:13.35,period:27.321,size:3476},mars:{color:"red",aus:1.524,mm:.524051,period:686.98,size:6787},jupiter:{color:"orange",aus:5.203,mm:.083092,period:4331,size:142984},io:{center:"jupiter",color:"#EAE18B",aus:.0028,mm:1.77/365.2,size:3660},europa:{center:"jupiter",color:"#7C4724",aus:.0044,mm:3.55/365.2,size:3121},ganymede:{center:"jupiter",color:"#7E766A",aus:.0072,mm:7.15/365.2,size:5262},callisto:{center:"jupiter",color:"#716857",aus:.0126,mm:16.68/365.2,size:4820},saturn:{color:"pink",aus:9.539,mm:.033612,period:10750,size:112536},uranus:{color:"green",aus:19.18,mm:.011693,period:30660,size:51118},neptune:{color:"purple",aus:30.06,mm:.005973,period:60152,size:49528},pluto:{color:"white",aus:39.53,mm:.004,period:90410,size:2300}}}Universe.prototype={init:function(b){this.planets=b||this.PlanetBase;var c=$("#dynamic")[0],d=$("#static")[0];this.h=d.height=c.height=Math.floor($(window).height())*.95,this.w=d.width=c.width=Math.floor($(window).width())*.6,this.origin={x:this.w/2,y:this.h/2},this.addPlanets();var e=this,f=function(){e.stopped?e.start():e.stop()};$("#dynamic").click(f)},addPlanets:function(){for(var a in this.planets){p=this.PlanetBase[a],p.name=a;for(var b in this.planets[a])p[b]=this.planets[a][b];p.type=="center"&&(this.center=p),p.origin=this.origin,this.planets[p.name]=new Planet(this,p)}Object.keys(this.center).length===0&&(this.center=this.planets.sun)},setScale:function(){this.max_radius=0,this.max_size=1;for(var a in this.planets){p=this.planets[a],p.name!="sun"&&p.size>this.max_size&&(this.max_size=p.size);if(p.type=="center")continue;epi_rad=0;for(var b in p.cycles)epi_rad+=p.cycles[b].radius;rad=p.aus+epi_rad,rad>this.max_radius&&(this.max_radius=rad),p.aus>0&&p.aus<this.min_aus&&(this.min_radius=p.aus)}l=this.h>this.w?this.w/2:this.h/2,this.scale_factor=l/this.max_radius,this.scale_size_factor=(this.max_size+1)/this.max_planet_size},rescale:function(){this.setScale();for(var a in this.planets){p=this.planets[a],p.name=="sun"?p.size=p.size/(this.scale_size_factor*100):p.size=Math.ceil(p.size/this.scale_size_factor),p.size>this.max_planet_size&&(p.size=this.max_planet_size),p.size<this.min_planet_size&&(p.size=this.min_planet_size),p._eccentric=p._eccentric*this.scale_factor,p.meancenter=p.aus*this.scale_factor;for(var b in p.cycles)p.cycles[b].radius=p.cycles[b].radius*this.scale_factor;p.origin=this.origin}},eccentric:function(a){for(p in this.planets)this.planets[p].eccentric(a)},setup:function(a){a=a||this.day,this.rescale(),a>0&&this.animate(a),console.log("stop"),this.stopped=!0},start:function(a){console.log("start"),a>0&&this.animate(a),this.stopped=!1;var b=this;requestAnimFrame(function(){b.animate()})},stop:function(a){a>0&&this.animate(a),console.log("stop"),this.stopped=!0},drawTrail:function(a){ctx=$("#static")[0].getContext("2d"),ctx.lineWidth=1,ctx.strokeStyle="#050",ctx.beginPath(),ctx.moveTo(a.lastPoint[0],a.lastPoint[1]),ctx.lineTo(a.x,a.y),ctx.closePath(),ctx.stroke()},animate:function(b){b>0&&(this.day=b),ctx=$("#static")[0].getContext("2d");for(var c in this.planets)p=this.planets[c],p.lastPoint=[p.x,p.y],p.nextPoint(this.day),this.drawTrail(p);this.displayDay&&(ctx=$("#dynamic")[0].getContext("2d"),ctx.fillStyle="#DDD",ctx.font="8pt Helvetica",ctx.fillText("Day: "+Math.floor(this.day),this.w-60,20)),this.day+=this.rate,this.stopped||(universe=this,requestAnimFrame(function(){$("#dynamic")[0].getContext("2d").clearRect(0,0,universe.w,universe.h),universe.animate()}))}},Planet=function(a,b){this.name=b.name,this.universe=a,this.shadow=!0,this.offset=0,this.ctx=$("#dynamic")[0].getContext("2d");for(i in b)this[i]=b[i];this._eccentric=0,this.eccentric=function(a){return a==undefined?this._eccentric:(this._eccentric=a,this)},this.deferent=function(a,b){return this.mm=a,this.aus=b,this},this.cycles=[],this.epicycles=function(a){return a==undefined?this.cycles:(a.type=a.type||"epicycle",this.cycles.push(a),this)},this.couple=function(a){return a==undefined?this.cycles:(a.type=a.type||"tusi",this.cycles.push(a),this)}},Planet.prototype={ctx:function(){return $("#dynamic")[0].getContext("2d")},epicycle:function(a){this.drawCircle(this.x,this.y,a.radius),et=this.day*a.period*Math.PI/180,epi_x=this.x-a.radius*Math.sin(et),epi_y=this.y-a.radius*Math.cos(et),this.drawLine(this.x,this.y,epi_x,epi_y),this.x=epi_x,this.y=epi_y},equant:function(a){if(a!=undefined)return this._equant=a?!0:!1,this;if(!this._equant)return this.meancenter;this.drawLine(this.origin.x,this.origin.y,this.origin.x,this.origin.y-2*this._eccentric);var b=180/Math.PI*Math.asin(this._eccentric/this.meancenter*Math.sin(this.t)),c=Math.sqrt(this.meancenter*this.meancenter+this._eccentric*this._eccentric-2*this._eccentric*this.meancenter*Math.cos((this.mm*this.day-b)*Math.PI/180));return c},tusi:function(a){var b=this.t+3*Math.PI/2,c=.5*a.radius,d=.5*c;p.aus=p.aus-a.radius,this.drawCircle(this.x,this.y,a.radius);var e=this.x+d*Math.cos(b)+d*Math.cos(b),f=this.y+d*Math.sin(b)+d*Math.sin(b);this.drawCircle(e,f,.5*a.radius);var g=this.x+c*Math.cos(b)-c*Math.cos(b),h=this.y+c*Math.sin(b)+c*Math.sin(b);return this.drawLine(e,f,g,h),this.drawLine(this.x,this.y,g,h),this.x=g,this.y=h,this},urdi:function(a){var b=this.t;return this},ellipse:function(c){var d=this.t;return phi=90*Math.PI/180,this.last_ex=this.ex,this.lastey=this.ey,a=c.radius+this.meancenter,b=this.meancenter,this.ex=ox+a*Math.cos(d)*Math.cos(phi)-b*Math.sin(d)*Math.sin(phi),this.ey=oy+a*Math.cos(d)*Math.sin(phi)-b*Math.sin(d)*Math.cos(phi),this.drawCircle(this.ex,this.ey,1,{color:"#FF0"}),this},drawLine:function(a,b,c,d,e){e=e||{},e.color=e.color||"#DDD";var f=e.canvas||"dynamic",g=this.ctx;this.drawCircle(a,b,1,e),g.strokeStyle=e.color,g.lineWidth=1,g.beginPath(),g.moveTo(a,b),g.lineTo(c,d),g.closePath(),g.stroke(),this.drawCircle(c,d,1)},drawCircle:function(a,b,c,d){if(!a||!b||!c)return;d=d||{},d.color=d.color||"#FFF";var e=this.ctx;e.strokeStyle=d.color,e.lineWidth=1,e.moveTo(a,b),e.beginPath(),e.arc(a,b,c,Math.PI*2,0,!1),e.closePath(),e.stroke()},renderToCanvas:function(a,b,c){var d=document.createElement("canvas");return d.width=a,d.height=b,c(d.getContext("2d")),d},drawPlanet:function(a,b,c,d){if(!a||!b||!c)return;d=d||{},d.color=this.color||"#FFF";var e=this.ctx;g=this,this.disc=this.disc||this.renderToCanvas(2*c,2*c,function(e){a=e.canvas.width/2,b=e.canvas.height/2,e.moveTo(a,b),e.beginPath(),e.arc(a,b,c,Math.PI*2,0,!1),e.closePath();if(g.name=="sun"||g.shadow==0){var f=e.createRadialGradient(a,b,c/8,a,b,c);f.addColorStop(0,d.color),f.addColorStop(.8,"#FF0"),f.addColorStop(1,"#FFE"),e.fillStyle=f,e.fill()}else{var f=e.createRadialGradient(a,b,c,a,b-c,c);f.addColorStop(0,"#222"),f.addColorStop(.6,"#100"),f.addColorStop(1,d.color),e.fillStyle=f,e.fill()}}),dctx=this.disc.getContext("2d"),offset_x=-dctx.canvas.width/2,offset_y=-dctx.canvas.height/2,angle=Math.atan2(this.universe.planets.sun.y-b,this.universe.planets.sun.x-a),e.save(),e.translate(a,b),e.rotate(Math.PI/2+angle),e.drawImage(dctx.canvas,offset_x,offset_y),e.restore();if(this.universe.label){var f=8,g=this;this.label=this.label||this.renderToCanvas(this.name.length*f,f,function(a){a.fillStyle=d.color,a.font=f+"pt Helvetica",a.fillText(g.name,0,a.canvas.height)}),e.drawImage(this.label,a+c+5,b+offset_y)}},nextPoint:function(a){this.day=a+this.offset;var b,c;typeof this.center=="undefined"?(b=this.origin.x,c=this.origin.y):(b=this.universe.planets[this.center].x,c=this.universe.planets[this.center].y);if(this.type=="center"){this.x=b,this.y=c,this.drawPlanet(this.x,this.y,this.size,{fill:!0,color:this.color});return}this.t=t=this.day*this.mm*Math.PI/180,eq=this.equant(),this.last_eq=eq;var d=this.x=b-eq*Math.sin(this.t),e=this.y=c-this._eccentric-eq*Math.cos(this.t);this._eccentric&&this.drawLine(this.origin.x,this.origin.y,this.origin.x,this.origin.y-this._eccentric),this.drawLine(b,c-this._eccentric,d,e),this._equant&&this.drawLine(this.origin.x,this.origin.y-2*this._eccentric,d,e);var f,g;for(var h=0;h<this.cycles.length;h++){epi=this.cycles[h];if(!epi||!epi.radius)break;this[epi.type](epi)}this.drawPlanet(this.x,this.y,this.size,{fill:!0,color:this.color})}},window.requestAnimFrame=function(a){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){window.setTimeout(a,1e3/60)}}();