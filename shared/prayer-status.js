/*
  prayer-status.js — shared prayer-time accommodation module for cw2 displays
  ─────────────────────────────────────────────────────────────────────────
  PURPOSE: Computes whether a Dhuhr/Asr prayer window is currently "open"
           for display on classroom screens, so students who observe daily
           prayer can be shown a discreet, anonymous indicator during the
           school day (8:06 AM–3:15 PM). This module does NOT track any
           individual student or pass — it only answers "is a window open
           right now, and which prayer is it."
  BACKEND: Supabase table `cw2_prayer_settings` (single row, id=1) holds
           the admin-configurable calculation settings. See
           prayer-settings.html for the editor.
  USAGE:   1) Load adhan.js BEFORE this file:
              <script src="https://cdn.jsdelivr.net/npm/adhan@4.4.4/lib/bundles/adhan.umd.min.js"></script>
              <script src="/shared/prayer-status.js"></script>
           2) Call it from your existing tick()/poll loop:
              const status = await CWPrayerStatus.computePrayerStatus();
              if (status.enabled && (status.dhuhrOpen || status.asrOpen)) { ...show row... }
              else { ...hide row... }
  UPDATED: 2026-08-30
*/
(function (global) {
  var SUPABASE_URL = 'https://lgsfrhibzxjwcudjvfzx.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnc2ZyaGlienhqd2N1ZGp2Znp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTM1NTQsImV4cCI6MjA5MzEyOTU1NH0.A1xLychMJ1UBgRHbrtY5RwVULG71zhK9u-WuTrsA8cU';

  var DEFAULTS = {
    enabled: true,
    method: 'MoonsightingCommittee',
    madhab: 'Shafi',
    latitude: 36.4310,
    longitude: -119.8549,
    buffer_minutes: 45,
    school_start: '08:06',
    school_end: '15:15'
  };

  var _cache = { dateKey: null, settings: null, times: null };

  function dateKeyFor(d) {
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function parseHHMM(base, hhmm) {
    var parts = String(hhmm || '').split(':');
    var d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    d.setHours(parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0, 0, 0);
    return d;
  }

  async function loadSettings() {
    try {
      var res = await fetch(SUPABASE_URL + '/rest/v1/cw2_prayer_settings?id=eq.1&select=*', {
        headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY }
      });
      if (!res.ok) return DEFAULTS;
      var rows = await res.json();
      if (!rows || !rows[0]) return DEFAULTS;
      var s = rows[0];
      return {
        enabled: s.enabled !== false,
        method: s.method || DEFAULTS.method,
        madhab: s.madhab || DEFAULTS.madhab,
        latitude: (typeof s.latitude === 'number') ? s.latitude : DEFAULTS.latitude,
        longitude: (typeof s.longitude === 'number') ? s.longitude : DEFAULTS.longitude,
        buffer_minutes: (typeof s.buffer_minutes === 'number') ? s.buffer_minutes : DEFAULTS.buffer_minutes,
        school_start: s.school_start || DEFAULTS.school_start,
        school_end: s.school_end || DEFAULTS.school_end
      };
    } catch (e) {
      return DEFAULTS;
    }
  }

  function computeTimesForDate(settings, date) {
    if (typeof adhan === 'undefined') return null;
    try {
      var coords = new adhan.Coordinates(settings.latitude, settings.longitude);
      var methodFn = adhan.CalculationMethod[settings.method];
      var params = methodFn ? methodFn() : adhan.CalculationMethod.MoonsightingCommittee();
      params.madhab = (settings.madhab === 'Hanafi') ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi;
      var pt = new adhan.PrayerTimes(coords, date, params);
      return { fajr: pt.fajr, sunrise: pt.sunrise, dhuhr: pt.dhuhr, asr: pt.asr, maghrib: pt.maghrib, isha: pt.isha };
    } catch (e) {
      return null;
    }
  }

  async function computePrayerStatus(now) {
    now = now || new Date();
    var key = dateKeyFor(now);

    if (_cache.dateKey !== key) {
      var settings = await loadSettings();
      var times = settings.enabled ? computeTimesForDate(settings, now) : null;
      _cache = { dateKey: key, settings: settings, times: times };
    }

    var settings = _cache.settings;
    var times = _cache.times;
    var result = {
      enabled: !!(settings && settings.enabled && times),
      dhuhrOpen: false,
      asrOpen: false,
      activeLabel: null,
      windowStart: null,
      windowEnd: null
    };
    if (!result.enabled) return result;

    var schoolStart = parseHHMM(now, settings.school_start);
    var schoolEnd = parseHHMM(now, settings.school_end);
    var bufferMs = (settings.buffer_minutes || 45) * 60000;

    function withinSchoolDay(t) {
      return t >= schoolStart && t <= schoolEnd;
    }

    if (times.dhuhr && withinSchoolDay(times.dhuhr)) {
      var dEnd = new Date(times.dhuhr.getTime() + bufferMs);
      if (now >= times.dhuhr && now <= dEnd) {
        result.dhuhrOpen = true;
        result.activeLabel = 'Dhuhr';
        result.windowStart = times.dhuhr;
        result.windowEnd = dEnd;
        return result;
      }
    }

    if (times.asr && withinSchoolDay(times.asr)) {
      var aEnd = new Date(times.asr.getTime() + bufferMs);
      if (now >= times.asr && now <= aEnd) {
        result.asrOpen = true;
        result.activeLabel = 'Asr';
        result.windowStart = times.asr;
        result.windowEnd = aEnd;
        return result;
      }
    }

    return result;
  }

  global.CWPrayerStatus = {
    computePrayerStatus: computePrayerStatus,
    DEFAULTS: DEFAULTS
  };
})(window);
