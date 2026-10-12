/* One retained WebGL context. Manufacturer photographs are textures on a thin 3D slab. */
(() => {
  'use strict';
  const canvas = document.createElement('canvas');
  canvas.className = 'product-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const gl = canvas.getContext('webgl', {alpha:true, antialias:true, premultipliedAlpha:false, powerPreference:'low-power'});
  let host, program, buffer, texture, frame=0, started=0, last=0, loaded=false, failed=!gl;
  let x=0, y=0, tx=0, ty=0, aspect=1.5, imageAspect=1, token=0, direction=0, generic=false;
  const cache = new Map();
  const vs = `precision mediump float; attribute vec3 aPosition; attribute vec2 aUv; attribute float aFace;
    uniform vec2 uRotation; uniform float uViewport; uniform float uShape;
    varying vec2 vUv; varying float vFace; varying vec3 vPosition;
    void main(){vec3 p=aPosition; p.x*=uShape; p.xy*=1.9;
      float cx=cos(uRotation.x),sx=sin(uRotation.x),cy=cos(uRotation.y),sy=sin(uRotation.y);
      p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);
      p=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);
      float w=3.8-p.z; gl_Position=vec4(p.x*2.65/uViewport,p.y*2.65,-p.z*.12,w);
      vUv=aUv;vFace=aFace;vPosition=p;}`;
  const fs = `precision mediump float; uniform sampler2D uTexture; uniform float uImageAspect;
    uniform float uShape; uniform float uOpacity; uniform vec2 uLight; uniform float uGeneric;
    varying vec2 vUv; varying float vFace; varying vec3 vPosition;
    void main(){vec2 uv=vUv;float ratio=uShape/uImageAspect;
      if(ratio>1.)uv.x=(uv.x-.5)*ratio+.5;else uv.y=(uv.y-.5)/ratio+.5;
      vec4 sampleColor=vec4(vec3(mix(.035,0.,uGeneric)),1.);
      if(uv.x>=0.&&uv.x<=1.&&uv.y>=0.&&uv.y<=1.){
        vec4 t=texture2D(uTexture,uv);sampleColor=vec4(mix(vec3(mix(.035,0.,uGeneric)),t.rgb,t.a),1.);}
      float rim=1.-smoothstep(.0,.0035,min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y)));
      float light=pow(max(0.,1.-length((vUv-uLight)*vec2(1.,1.15))),5.)*.038;
      vec3 base=mix(vec3(mix(.055,0.,uGeneric)),sampleColor.rgb,step(.5,vFace));
      float detailLight=mix(light,light*clamp(length(sampleColor.rgb),0.,1.),uGeneric);
      base+=vec3(detailLight+rim*mix(.11,.015,uGeneric));gl_FragColor=vec4(base,uOpacity);}`;
  function shader(type, source) {
    const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) {gl.deleteShader(s);throw Error('Shader compilation failed');}
    return s;
  }
  function initialize() {
    try {
      program=gl.createProgram();const a=shader(gl.VERTEX_SHADER,vs),b=shader(gl.FRAGMENT_SHADER,fs);
      gl.attachShader(program,a);gl.attachShader(program,b);gl.linkProgram(program);gl.deleteShader(a);gl.deleteShader(b);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('WebGL program link failed');
      const vertices=[];
      function face(points, front=0){const uv=[[0,0],[1,0],[1,1],[0,1]];for(const i of [0,1,2,0,2,3])vertices.push(...points[i],...uv[i],front);}
      const z=.017;
      face([[-.5,-.5,z],[.5,-.5,z],[.5,.5,z],[-.5,.5,z]],1);
      face([[.5,-.5,-z],[-.5,-.5,-z],[-.5,.5,-z],[.5,.5,-z]]);
      face([[-.5,-.5,-z],[-.5,-.5,z],[-.5,.5,z],[-.5,.5,-z]]);
      face([[.5,-.5,z],[.5,-.5,-z],[.5,.5,-z],[.5,.5,z]]);
      face([[-.5,.5,z],[.5,.5,z],[.5,.5,-z],[-.5,.5,-z]]);
      face([[-.5,-.5,-z],[.5,-.5,-z],[.5,-.5,z],[-.5,-.5,z]]);
      buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
      gl.useProgram(program);
      for(const [name,size,offset] of [['aPosition',3,0],['aUv',2,12],['aFace',1,20]]){const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,24,offset);}
      gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([9,9,9,255]));
    }catch{failed=true;}
  }
  if(gl)initialize();
  const uniform=name=>gl.getUniformLocation(program,name);
  function resize(){if(!host||failed)return;const rect=host.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.6);
    const w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);
  }
  function draw(now=performance.now()) {
    frame=0;if(!host?.isConnected||failed||!loaded||document.hidden)return;
    if(!reduced.matches&&now-last<30){frame=requestAnimationFrame(draw);return;}last=now;
    x+=(tx-x)*.11;y+=(ty-y)*.11;
    const t=Math.min(1,(now-started)/650),entry=reduced.matches?0:Math.pow(1-t,3);
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
    gl.uniform2f(uniform('uRotation'),reduced.matches?.025:.045+y+direction*entry*.16,reduced.matches?-.045:-.12+x+entry*.22);
    gl.uniform1f(uniform('uViewport'),canvas.width/canvas.height);gl.uniform1f(uniform('uShape'),aspect);
    gl.uniform1f(uniform('uImageAspect'),imageAspect);gl.uniform1f(uniform('uOpacity'),reduced.matches?1:Math.min(1,t*2.5));
    gl.uniform1f(uniform('uGeneric'),generic?1:0);gl.uniform2f(uniform('uLight'),.45+x,.65+y);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(uniform('uTexture'),0);
    gl.drawArrays(gl.TRIANGLES,0,36);
    if(!reduced.matches&&(t<1||Math.abs(tx-x)+Math.abs(ty-y)>.0008))frame=requestAnimationFrame(draw);
  }
  const wake=()=>{if(!frame)frame=requestAnimationFrame(draw);};
  function loadImage(src){if(cache.has(src))return cache.get(src);const p=new Promise((resolve,reject)=>{const img=new Image();img.decoding='async';img.onload=()=>resolve(img);img.onerror=reject;img.src=src;});cache.set(src,p);if(cache.size>10)cache.delete(cache.keys().next().value);return p;}
  function move(e){if(reduced.matches||e.pointerType==='touch'||!host)return;const r=host.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-.5)*.24;ty=((e.clientY-r.top)/r.height-.5)*.12;wake();}
  function leave(){tx=0;ty=0;wake();}
  function detach(){if(frame)cancelAnimationFrame(frame);frame=0;if(host){host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);}host=null;}
  async function mount(el, config){detach();host=el;const current=++token;if(!el)return;
    if(failed||reduced.matches){el.classList.add('static-visual');return;}
    aspect=config.portrait?.78:1.52;generic=!!config.generic;direction=/top/.test(config.direction||'')?-1:1;
    loaded=false;x=0;y=0;tx=0;ty=0;el.append(canvas);resize();
    el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);
    try{let img;try{img=await loadImage(config.src);}catch{img=await loadImage(config.fallback);}
      if(current!==token||!el.isConnected)return;
      gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
      imageAspect=img.naturalWidth/img.naturalHeight;loaded=true;el.classList.add('webgl-ready');started=performance.now();wake();
    }catch{el.classList.add('static-visual');}
  }
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();failed=true;host?.classList.remove('webgl-ready');host?.classList.add('static-visual');detach();});
  window.addEventListener('resize',()=>{resize();wake();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();});
  reduced.addEventListener?.('change',()=>{if(host){host.classList.toggle('static-visual',reduced.matches);if(!reduced.matches)wake();}});
  window.TechRefScene={mount,detach};
})();
