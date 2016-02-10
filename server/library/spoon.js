

var Spoon = (function () {
  'use strict';

  var registry = new Map();

  return {
    join: function(match,callback,ms_timeout){
      var sym = Symbol();

      if (typeof ms_timeout === 'number')
        var timeout = setTimeout(function(cb, sym){
          registry.delete(sym);
          cb('Warning: Spoon timed Out.',null);
        },ms_timeout,callback,sym);

        var payload = { match: match, callback: callback, timeout };
        registry.set( sym , payload );

    },
    collect: function(data){
      registry.forEach( (job, key, map) => {
        if ( job.match(data) ){
          job.callback(null,data);
          clearTimeout(job.timeout);
          map.delete(key);
        }
      });
    }
  };
})();

module.exports = Spoon;
