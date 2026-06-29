(function () {
  var ctx = null;

  function enabled() {
    return window.RikaState && window.RikaState.get().settings.sound !== false;
  }

  function beep(freq, duration, type) {
    if (!enabled()) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration + 0.02);
    } catch (error) {
      // Audio is optional; failures should never stop learning flow.
    }
  }

  window.RikaAudio = {
    ok: function () { beep(740, 0.12, "triangle"); },
    bad: function () { beep(180, 0.16, "sawtooth"); },
    reward: function () { beep(920, 0.18, "triangle"); window.setTimeout(function () { beep(1180, 0.18, "triangle"); }, 90); }
  };
})();
