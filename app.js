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
	result['bigraphs'] = {};
	result['trigraphs'] = {};

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

	console.log("Start");
	for (var i in window.bigraphs) {
		var bg = window.bigraphs[i];
		var bg_r = findGraphs(result, bg);
		if (bg_r.length > 0) {
			result['bigraphs'][bg] = bg_r;
		}
	}

	for (var i in window.trigraphs) {
		var tg = window.trigraphs[i];
		var tg_r = findGraphs(result, tg);
		if (tg_r.length > 0) {
			result['trigraphs'][tg] = tg_r;
		}
	}
	console.log("End Graphs");

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

function mergePaths(left, right) {
	var r_paths = [];

	if (left == undefined) {
		return [];
	} else if (right == undefined) {
		return [];
	} else if (left.length == 0) {
		return [];
	} else if (right.length == 0) {
		return [];
	}

	for (var i in left) {
		var l_path = left[i];
		for (var j in right) {
			var r_path = right[j];
			if (r_path[0] != l_path[l_path.length - 1]) {
				continue;
			}

			var duplicate = false;
			for (var k = 1; k < r_path.length; k++) {
				if (l_path.indexOf(r_path[k]) != -1) {
					duplicate = true;
					break;
				}
			}

			if (duplicate) {
				break;
			}

			var n_path = l_path.slice();
			for (var k = 1; k < r_path.length; k++) {
				n_path.push(r_path[k]);
			}

			r_paths.push(n_path);
		}
	}

	return r_paths;
}

function findGraphs(parsed, word) {
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

function isWordPresent(parsed, word) {
	for (var loc in word) {
		var chr = word[loc];
		if (parsed["pos"][chr] == undefined) {
			return [];
		}
	}

	if (word.length == 0) {
		return [];
	}

	if (word.length == 1) {
		return parsed.pos[word];
	}

	if (word.length == 2) {
		if (word in parsed.bigraphs) {
			return parsed.bigraphs[word];
		} else {
			return [];
		}
	}

	if (word.length == 3) {
		if (word in parsed.trigraphs) {
			return parsed.trigraphs[word];
		} else {
			return [];
		}
	}

	var paths = [];
	if (!(word.substr(0,3) in parsed.trigraphs)) {
		return [];
	}

	paths = parsed.trigraphs[word.substr(0,3)];

	var lpos = 2;

	while (lpos < word.length - 1) {
		if (paths.length == 0) {
			break;
		}

		var rword = word.substr(lpos);
		if (rword.length == 2) {
			paths = mergePaths(paths, parsed.bigraphs[rword]);
			lpos = word.length;
		} else if (rword.length == 3) {
			paths = mergePaths(paths, parsed.trigraphs[rword]);
			lpos = word.length;
		} else {
			paths = mergePaths(paths, parsed.trigraphs[rword.substr(0, 3)]);
			lpos += 2;
		}
	}

	return paths;
}

function parseWords(parsed) {
	present = {};
	present['list'] = [];
	present['locs'] = {};
	present['lengths'] = {};
	present['pos'] = {};
	console.log("Start Words");
	for (var i in window.wordlist) {
		var word = window.wordlist[i];

		var found = false;
		for (var i = 0; i < word.length - 2; i++) {
			if (!(word.substr(i, i+3) in parsed.trigraphs)) {
				found = true;
				break;
			}
		}

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
	console.log("End Words");

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

	updateSidebar();

	return parsed;
}

function updateSidebar() {
	el = document.getElementById('sidebar');

	$(el).hide();
	el.innerHTML = '<div class="card orange darken-3"><div class="card-content white-text"><span class="card-title">Total Words: ' + window.parsed.words.list.length + '</span></div></div>';



	for (var i = 100; i > 0; i--) {
		if (i in window.parsed.words.lengths) {
			var list = window.parsed.words.lengths[i];
			var card = '<div class="card orange lighten-2"><div class="card-content white-text"><span class="card-title">' + i + '-Letter Words (' + list.length + ')</span><div>';

			for (var p in list) {
				var word = list[p];
				var times = window.parsed.words.locs[word].length;

				card += '<div class="search-result chip orange darken-3 white-text clickable" onclick="showWordOccurences(\'' + word + '\')">' + word + ' (' + times + ')</div>';
			}

			card += '</div></div></div>';

			el.innerHTML += card;
		}
	}

	$(el).show();
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

function clearRow(row) {
	for (var x = 0; x < 10; x++) {
		var id = "ggs-" + row + "x" + x;
		var el = document.getElementById(id);
		el.value = "";
	}
	saveForm();
}

function deleteRow(row) {
	for (var y = row; y > 0; y--) {
		for (var x = 0; x < 10; x++) {
			var id = "ggs-" + y + "x" + x;
			var uid = "ggs-" + (parseInt(y) - 1) + "x" + x;
			var el = document.getElementById(id);
			el.value = document.getElementById(uid).value;
		}
	}
	clearRow(0);
	saveForm();
}

function showLetterOccurrences(pos) {
	clearShownOccurences();
	var list = [];
	for (var i in window.parsed.words.pos[pos]) {
		var p = window.parsed.words.pos[pos][i].split(',');
		var word = p[0];
		var loc = p[1];
		if (list.indexOf(word) == -1) {
			list.push(word);
		}
		showWordLocationOccurence(word, loc);
	}

	var el = document.getElementById('search-results');
	el.innerHTML = "";
	$(el).hide();

	for (var p in list) {
		var word = list[p];
		var times = window.parsed.words.locs[word].length;

		el.innerHTML += '<div class="search-result chip orange darken-3 white-text clickable" onclick="showWordOccurences(\'' + word + '\')">' + word + ' (' + times + ')</div>';
	}

	$(el).show();
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

function clearLocOnClick() {
	for (var y = 0; y < 14; y++) {
		for (var x = 0; x < 10; x++) {
			var id = "ggs-" + y + "x" + x;
			var el = document.getElementById(id);
			el.onclick = function(e) {};
		}
	}
}

function shiftGridUp() {
	for (var y = 0; y < 13; y++) {
		for (var x = 0; x < 10; x++) {
			var id = "ggs-" + y + "x" + x;
			var did = "ggs-" + (parseInt(y) + 1) + "x" + x;
			var el = document.getElementById(id);
			el.value = document.getElementById(did).value;
		}
	}
	var y = 13;
	for (var x = 0; x < 10; x++) {
		var id = "ggs-" + y + "x" + x;
		var el = document.getElementById(id);
		el.value = '';
	}
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

	document.getElementById("game-btn-show").onclick = function(e) {
		solveGame();
		clearShownOccurences();

		for (var y = 0; y < 14; y++) {
			for (var x = 0; x < 10; x++) {
				var id = "ggs-" + y + "x" + x;
				document.getElementById(id).onclick = function(f) {
					var current_id = f.srcElement.id;
					var pos = current_id.split('-')[1];
					showLetterOccurrences(pos);
					clearLocOnClick();
				};
			}
		}
	}

	document.getElementById("game-btn-addrow").onclick = function(e) {
		shiftGridUp();
		saveForm();
		clearShownOccurences();
	}

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
