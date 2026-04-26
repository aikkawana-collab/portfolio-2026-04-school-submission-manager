var CACHE_TTL = 600;
var CACHE_KEY_ALL_STUDENTS = 'all_students_v2';
var CACHE_KEY_CLASS_SUMMARY = 'class_summary_v2';

function getCachedData(key) {
  var cache = CacheService.getScriptCache();
  var cached = cache.get(key);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      return null;
    }
  }
  return null;
}

function setCachedData(key, data) {
  var cache = CacheService.getScriptCache();
  var json = JSON.stringify(data);
  // CacheServiceは1キーあたり100KB制限
  if (json.length < 90000) {
    cache.put(key, json, CACHE_TTL);
  }
}

function invalidateAllCaches() {
  var cache = CacheService.getScriptCache();
  cache.removeAll([CACHE_KEY_ALL_STUDENTS, CACHE_KEY_CLASS_SUMMARY]);
}
