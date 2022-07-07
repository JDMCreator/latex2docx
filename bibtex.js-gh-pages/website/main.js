var root = "../../";

$(document).ready(function() {
    var button = $('button#compile');

    button.click(function(ev) {
	button.text('Running BibTeX...');
	button.attr('disabled', 'disabled');
	button.addClass('disabled');

	var bibtex = new BibTeX('./');
	window.bibtex = bibtex;

	var log = $('#log').text('');
	bibtex.on_stdout = function(txt) { log.append(txt+'\n'); }
	bibtex.on_stderr = function(txt) { log.append(txt+'\n'); }

	var aux = $('#aux').val();
	var bst = $('#bst').val();
	var bib = $('#bib').val();
	window.bbl = $('#bbl');

	var texlive = new TeXLive(bibtex);    
	texlive.compile(aux, bst, bib, root, function() {
            button.text('Run BibTeX');
	})
    });
});
