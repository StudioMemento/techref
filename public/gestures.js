/* One input model for touch, pen and mouse. Native links remain native on tap. */
(() => {
  'use strict';
  const axisOf = (dx, dy) => {
    const x = Math.abs(dx), y = Math.abs(dy);
    if (Math.max(x, y) < 10) return null;
    if (x > y * 1.2) return 'property';
    if (y > x * 1.2) return 'device';
    return Math.max(x, y) > 24 ? (x >= y ? 'property' : 'device') : null;
  };
  function evaluate(distance, extent, velocity = 0) {
    const threshold = Math.max(44, Math.min(90, extent * 0.17));
    return {
      dir: distance < 0 ? 1 : -1,
      commit: Math.abs(distance) >= threshold || (Math.abs(distance) >= 24 && Math.abs(velocity) > 0.5 && Math.sign(velocity) === Math.sign(distance)),
      progress: Math.min(1, Math.abs(distance) / threshold)
    };
  }
  function mount({surface, frame, horizontalOnly = false, canMove, navigate, onDrag, onStart, canStartAxis, onUpdate}) {
    if (!surface) return () => {};
    let drag = null, alive = true, busy = false, animation = null;
    const pointers = new Set(), removers = [];
    const clock = () => performance.now();
    const listen = (target, type, fn, options) => {
      target.addEventListener(type, fn, options);
      removers.push(() => target.removeEventListener(type, fn, options));
    };
    const paint = (x = 0, y = 0, opacity = 1) => {
      if (!frame) return;
      frame.style.transform = `translate3d(${x}px,${y}px,0)`;
      frame.style.opacity = String(opacity);
    };
    function reset(animate = true) {
      delete surface.dataset.dragAxis;
      delete surface.dataset.dragDir;
      delete surface.dataset.dragEdge;
      surface.classList.remove('is-dragging');
      if (frame) {
        const from = {transform: frame.style.transform || 'none', opacity: frame.style.opacity || '1'};
        paint();
        if (animate && frame.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          animation?.cancel();
          animation = frame.animate([from, {transform:'translate3d(0,0,0)',opacity:1}], {duration:180,easing:'cubic-bezier(.2,.8,.2,1)'});
          animation.finished.catch(() => {});
        }
      }
    }
    function cancel() {
      if (busy) return;
      if (drag?.axis) onDrag?.();
      drag = null;
      reset();
    }
    function start(e) {
      if (e.pointerType === 'touch') {
        pointers.add(e.pointerId);
        if (pointers.size > 1) { cancel(); return; }
      }
      if (busy || drag || e.isPrimary === false || (e.button != null && e.button !== 0) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target.closest?.('input,select,textarea,[contenteditable],[data-native-gesture]')) return;
      animation?.cancel();
      onStart?.();
      drag = {id:e.pointerId, x:e.clientX, y:e.clientY, axis:null, samples:[{position:0,time:clock()}], last:e, mouse:e.pointerType==='mouse'};
    }
    function update(e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (drag.mouse && e.buttons === 0) { cancel(); return; }
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.axis) {
        const axis = axisOf(dx, dy);
        if (!axis) return;
        if (horizontalOnly && axis === 'device') { drag = null; return; }
        // A scrollable reading area keeps native vertical scrolling. Its dock
        // can still use both navigation axes, including on small viewports.
        if (canStartAxis && !canStartAxis(axis, e)) { drag = null; return; }
        drag.axis = axis;
        if (frame) frame.style.animation = 'none';
        try { surface.setPointerCapture?.(drag.id); } catch (_) {}
        surface.classList.add('is-dragging');
      }
      if (e.cancelable) e.preventDefault();
      drag.last = e;
      const horizontal = drag.axis === 'property', distance = horizontal ? dx : dy;
      const extent = horizontal ? surface.clientWidth : surface.clientHeight;
      const decision = evaluate(distance, extent);
      const allowed = canMove(drag.axis, decision.dir), delta = distance * (allowed ? 1 : 0.2);
      surface.dataset.dragAxis = drag.axis;
      surface.dataset.dragDir = String(decision.dir);
      surface.dataset.dragEdge = allowed ? 'false' : 'true';
      onUpdate?.(drag.axis, decision.dir, allowed);
      const now = clock();
      drag.samples = drag.samples.filter(s => now - s.time < 120);
      drag.samples.push({position:distance, time:now});
      paint(horizontal ? delta : 0, horizontal ? 0 : delta, 1 - Math.min(0.2, Math.abs(delta) / Math.max(extent, 1) * 0.25));
    }
    function finish(e) {
      pointers.delete(e.pointerId);
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      drag = null;
      if (!d.axis) return; // A normal tap: leave button and anchor activation alone.
      onDrag?.();
      if (e.cancelable) e.preventDefault();
      const horizontal = d.axis === 'property';
      const distance = horizontal ? e.clientX - d.x : e.clientY - d.y;
      const extent = horizontal ? surface.clientWidth : surface.clientHeight;
      const sample = d.samples.find(s => clock() - s.time < 120);
      const velocity = sample ? (distance - sample.position) / Math.max(1, clock() - sample.time) : 0;
      const decision = evaluate(distance, extent, velocity);
      if (!decision.commit || !canMove(d.axis, decision.dir)) { reset(); return; }
      busy = true;
      const end = -decision.dir * Math.max(extent, 1);
      const done = () => { if (alive) navigate(d.axis, decision.dir); };
      if (frame?.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        animation = frame.animate([
          {transform:frame.style.transform,opacity:frame.style.opacity},
          {transform:`translate3d(${horizontal?end:0}px,${horizontal?0:end}px,0)`,opacity:0}
        ], {duration:160,easing:'cubic-bezier(.3,.7,.3,1)',fill:'forwards'});
        animation.finished.then(done).catch(() => {});
      } else done();
    }
    const abort = e => { pointers.delete(e.pointerId); if (drag?.id === e.pointerId) cancel(); };
    listen(surface, 'dragstart', e => e.preventDefault());
    listen(window, 'blur', () => {cancel();pointers.clear();});
    if ('PointerEvent' in window) {
      listen(surface, 'pointerdown', start);
      listen(surface, 'pointermove', update, {passive:false});
      listen(surface, 'pointerup', finish);
      listen(surface, 'pointercancel', abort);
      listen(surface, 'lostpointercapture', e => { if (drag?.id === e.pointerId) cancel(); });
      // A mouse released outside before capture must not leave a pending drag.
      listen(window, 'pointerup', e => { pointers.delete(e.pointerId); if (drag?.id === e.pointerId) finish(e); });
    } else {
      const asPointer = (e,t) => ({target:e.target,clientX:t.clientX,clientY:t.clientY,pointerId:t.identifier,pointerType:'touch',button:0,isPrimary:true,cancelable:e.cancelable,preventDefault:()=>e.preventDefault()});
      listen(surface,'touchstart',e=>{if(e.touches.length!==1){cancel();pointers.clear();return;}start(asPointer(e,e.touches[0]));},{passive:true});
      listen(surface,'touchmove',e=>{if(e.touches.length===1)update(asPointer(e,e.touches[0]));},{passive:false});
      listen(surface,'touchend',e=>{if(e.changedTouches[0])finish(asPointer(e,e.changedTouches[0]));},{passive:false});
      listen(surface,'touchcancel',()=>{cancel();pointers.clear();},{passive:true});
    }
    return () => {alive=false;drag=null;animation?.cancel();removers.forEach(fn=>fn());pointers.clear();};
  }
  window.TechRefGestures = {mount, axisOf, evaluate};
})();
