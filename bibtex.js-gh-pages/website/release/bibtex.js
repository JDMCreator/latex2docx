(
function(){
  var Promise = function() {
    var callbacks = [];
    var result = null;

    this.then = function(cb) {
      if(result != null)
        cb(result);
      else
        callbacks.push(cb);

      return this;
    };

    this.fulfil = function(res) {
      result = res;
      for(var i in callbacks) {
        callbacks[i](result);
      }
    }
  };

  window.BibTeX = function(root) {
    var worker = new Worker('../release/bibtex-webworker.js');
    var promises = [];
    var self = this;

    worker.onmessage = function(ev) {
      var obj;
      try{
        obj = JSON.parse(ev.data);
        console.log('BibTeX:', obj);
      }
      catch(e) {
        console.log('BibTeX:', ev.data);
        return;
      }

      if('id' in obj)
        promises[obj.id].fulfil(obj);
      if(obj.cmd) {
        if(obj.cmd == 'stdout' && typeof(self.on_stdout) === 'function')
          self.on_stdout(obj.contents)
        if(obj.cmd == 'stderr' && typeof(self.on_stderr) === 'function')
          self.on_stderr(obj.contents)
      }
    };

    this.getFile = function(pseudo_path, pseudo_name) {
      var prom1 = new Promise();
      promises.push(prom1);
      worker.postMessage(JSON.stringify({
        cmd:         'getFile',
        id:          (promises.length-1),
        pseudo_path: pseudo_path,
        pseudo_name: pseudo_name
      }));

      var prom2 = new Promise();
      var chunks = [];
      prom1.then(function(msg) {
        var id = msg.chunk_id;
        chunks[id] = msg.contents;

        var complete = true;
        for(var i = 0; i < msg.chunk_count; i++) {
          if(typeof(chunks[i]) === 'undefined') {
            complete = false;
            break;
          }
        }

        if(complete) {
          prom2.fulfil(chunks.join(''));
        }
      });

      return prom2;
    }


    this.addData = function(contents, pseudo_path, pseudo_name) {
      var prom = new Promise();
      promises.push(prom);
      worker.postMessage(JSON.stringify({
        cmd:         'addData',
        id:          (promises.length-1),
        contents:    contents,
        pseudo_path: pseudo_path,
        pseudo_name: pseudo_name
      }));
      return prom;
    }

      this.compile = function(aux, bst, bib) {
      var prom1 = this.addData(aux, '/', 'test.aux')
      var prom2 = this.addData(bst, '/', 'plain.bst')
      var prom3 = this.addData(bib, '/', 'refs.bib')

      var prom4 = new Promise();

      prom3.then(function() {
        var prom5 = new Promise();
        promises.push(prom5);

        worker.postMessage(JSON.stringify({
          cmd:         'run',
          id:          (promises.length-1),
	  args:        ['test']
        }));

        prom5.then(function(obj) {prom4.fulfil(obj)});
      });
      return prom4;
    }
  }
})()
