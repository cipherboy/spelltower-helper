function nextID(id) {
	var p = id.substr(4).split('x');
	p[0] = parseInt(p[0])
	p[1] = parseInt(p[1])
	element = "ggs-";
	if (p[0] == 13 && p[1] == 9) {
		element = "game-btn-solve";
	} else if (p[1] == '9') {
		p[1] = 0
		p[0] += 1;
		element = element + p[0] + "x" + p[1];
	} else {
		p[1] += 1
		element = element + p[0] + "x" + p[1];
	}
	return element
}

function buildGrid() {
	var grid = []
	for (var y = 0; y < 14; y++) {
		var row = "";
		for (var x = 0; x < 10; x++) {
			var id = "ggs-" + y + "x" + x;
			var el = document.getElementById(id);
			var v = el.value.toLowerCase();

			if ("a" <= v && v <= "z") {
				row += v;
			} else {
				row += " ";
			}
		}
		grid.push(row);
	}
	return grid;
}

function parseGrid(grid) {
	result = {}
	result['grid'] = grid;
	result['pos'] = {};
	result['adj'] = {};

	for (var rid in grid) {
		var row = grid[rid];
		for (var lid in row) {
			var letter = row[lid];
			if (letter != " ") {
				result['pos'][letter] = new Set();
			}
		}
	}

	for (var y in grid) {
		y = parseInt(y);
		var row = grid[y];
		for (var x in row) {
			x = parseInt(x);
			var letter = row[x];
			var pos = y + "x" + x;
			if (letter == " " || letter == undefined) {
				continue;
			}

			result['adj'][pos] = new Set();
			result['pos'][letter].add(pos);

			for (var dx = -1; dx <= 1; dx++) {
				dx = parseInt(dx);
				for (var dy = -1; dy <= 1; dy++) {
					dy = parseInt(dy);
					if (dx == 0 && dy == 0) {
						continue;
					}

					if ((y + dy) >= 0 && (y + dy) < grid.length && (x + dx) >= 0 && (x + dx) < grid[y + dy].length) {
						var ny = parseInt(y + dy);
						var nx = parseInt(x + dx);
						var n_pos = ny + 'x' + nx;
						var n_letter = grid[ny][nx];
						if ("a" <= n_letter && n_letter <= "z") {
							result['adj'][pos].add(n_pos);
							result['pos'][n_letter].add(n_pos);
						}
					}
				}
			}
		}
	}

	return result;
}

Set.prototype.intersection = function(setB) {
	var intersection = new Set();
	for (var elem of setB) {
		if (this.has(elem)) {
			intersection.add(elem);
		}
	}
	return intersection;
}


function isWordPresent(parsed, word) {
	for (var loc in word) {
		var chr = word[loc];
		if (parsed["pos"][chr] == undefined) {
			return [];
		}
	}

	var paths = [];
	for (let elm of parsed["pos"][word[0]]) {
		paths.push([elm]);
	}

	for (var i = 1; i < word.length; i++) {
		var chr = word[i];
		var locations = parsed["pos"][chr];

		var n_paths = [];
		for (var p in paths) {
			var path = paths[p];
			var last_pos = path[path.length - 1];
			var new_directions = parsed["adj"][last_pos].intersection(locations);
			for (let n_pos of new_directions) {
				if (path.indexOf(n_pos) == -1) {
					var copy = path.slice();
					copy.push(n_pos);
					n_paths.push(copy);
				}
			}
		}

		paths = n_paths.slice();
	}

	return paths;
}

function parseWords(parsed) {
	present = {};
	present['list'] = [];
	present['locs'] = {};
	present['lengths'] = {};
	present['pos'] = {};
	for (var i in window.wordlist) {
		var word = window.wordlist[i];
		var result = isWordPresent(parsed, word);
		if (result.length > 0) {
			present['list'].push(word);
			present['locs'][word] = result;
			if (!(word.length in present['lengths'])) {
				present['lengths'][word.length] = [];
			}
			present['lengths'][word.length].push(word);

			for (var i in result) {
				for (var j in result[i]) {
					var pos = result[i][j];
					var rep = word + "," + i;
					if (!(pos in present['pos'])) {
						present['pos'][pos] = [];
					}

					present['pos'][pos].push(rep);
				}
			}
		}
	}

	return present;
}

function solveGame() {
	if (window.gridHasChanged == false) {
		return window.parsed;
	}
	var grid = buildGrid();
	var parsed = parseGrid(grid);
	parsed['words'] = parseWords(parsed);

	window.parsed = parsed;
	window.gridHasChanged = false;

	return parsed;
}

function saveForm() {
	for (var y = 0; y < 14; y++) {
		for (var x = 0; x < 10; x++) {
			var id = "ggs-" + y + "x" + x;
			var el = document.getElementById(id);
			window.localStorage.setItem("gv-" + id, el.value);
		}
	}
}

function restoreForm() {
	for (var y = 0; y < 14; y++) {
		for (var x = 0; x < 10; x++) {
			var id = "ggs-" + y + "x" + x;
			var el = document.getElementById(id);
			el.value = window.localStorage.getItem("gv-" + id);
		}
	}
}

function clearShownOccurences() {
	for (var y = 0; y < 14; y++) {
		for (var x = 0; x < 10; x++) {
			var id = "ggs-" + y + "x" + x;
			var el = document.getElementById(id);
			el.className = "";
		}
	}
}

function showWordLocationOccurence(word, location) {
	var loc = window.parsed.words.locs[word][location];
	for (var j in loc) {
		var id = "ggs-" + loc[j];
		console.log(id);
		var el = document.getElementById(id);
		el.className = "shown";
	}
}

function showWordOccurences(word) {
	clearShownOccurences();
	var locs = window.parsed.words.locs[word];
	for (var i in locs) {
		showWordLocationOccurence(word, i)
	}
}

function showLetterOccurrences(pos) {

}

function doSearch() {
	solveGame();

	var term = document.getElementById('search-box').value;
	var list = [];
	var el = document.getElementById('search-results');

	if (term == '') {
		el.innerHTML = "";
		return;
	}

	for (var p in window.parsed.words.list) {
		var word = window.parsed.words.list[p];
		if (word.indexOf(term) != -1) {
			list.push(word);
		}
	}

	el.innerHTML = "";
	$(el).hide();

	for (var p in list) {
		var word = list[p];
		var times = window.parsed.words.locs[word].length;
		var links = '<a href="#" onclick="showWordOccurences(\'' + word + '\');">Show</a>';

		el.innerHTML += '<div class="search-result chip orange darken-3 white-text clickable" onclick="showWordOccurences(\'' + word + '\')">' + word + ' (' + times + ')</div>';
	}

	$(el).show();
}

document.addEventListener("DOMContentLoaded", function() {
	restoreForm();
	window.gridHasChanged = true;

	for (var y = 0; y < 14; y++) {
		for (var x = 0; x < 10; x++) {
			var id = "ggs-" + y + "x" + x;
			var el = document.getElementById(id);

			el.onkeyup = function(e) {
				if ((e.keyCode >= 65 && e.keyCode <= 90) || e.keyCode == 32) {
					var current_id = e.srcElement.id;
					var next_id = nextID(current_id);
					if (e.srcElement.value.length == e.srcElement.maxLength) {
						document.getElementById(next_id).focus();
						if (next_id != "game-btn-solve") {
							document.getElementById(next_id).select();
						}
					}
					saveForm();
					clearShownOccurences();
					window.gridHasChanged = true;
				} else {
					el.value = "";
				}
			}
		}
	};

	document.getElementById("game-btn-clear").onclick = function(e) {
		for (var y = 0; y < 14; y++) {
			for (var x = 0; x < 10; x++) {
				var id = "ggs-" + y + "x" + x;
				document.getElementById(id).value = "";
			}
		}

		document.getElementById('ggs-0x0').focus();
		saveForm();
		clearShownOccurences();
		window.parsed = undefined;
		document.getElementById('search-results').innerHTML = "";
		document.getElementById('search-box').value = "";
	};

	document.getElementById("game-btn-solve").onclick = function(e) {
		solveGame();
	};

	document.getElementById('search-box').onkeyup = function(e) {
		if (e.keyCode == 13) {
			doSearch();
		}
	}

	document.getElementById("game-btn-search").onclick = function(e) {
		doSearch();
	};

	document.getElementById("ggs-0x0").focus();
});
