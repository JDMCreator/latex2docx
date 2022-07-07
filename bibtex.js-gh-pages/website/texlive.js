window.TeXLive = function(bibtex) {
    this.compile = function(aux, bst, bib, root, callback) {
	bibtex.compile(aux, bst, bib).then(function() {
	    bibtex.getFile('/', 'test.bbl').then(function(bbl) {
		$('#bbl').val(bbl);

            });
		var button = $('button#compile');
		button.text('Run BibTeX');
		$('button').removeClass('disabled');
		$('button').prop('disabled',false);
	});
    return this;
  }
  return this;
}
