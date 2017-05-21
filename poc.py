def parse_grid(grid):
    obj = {}
    obj["grid"] = grid
    obj["letter_pos"] = {}
    for row in grid:
        for letter in row:
            if letter != '*':
                obj["letter_pos"][letter.lower()] = set()
    
    obj["adj_list"] = {}

    for y in range(0, len(grid)):
        for x in range(0, len(grid[y])):
            if grid[y][x] == '*':
                continue
            obj["adj_list"][str(x) + "x" + str(y)] = set()
            for dy in range(-1, 2):
                for dx in range(-1, 2):
                    if dx == 0 and dy == 0:
                        continue
                    if (y + dy) >= 0 and (y + dy) < len(grid) and (x + dx) >= 0 and (x + dx) < len(grid[y]):
                        if grid[y + dy][x + dx] != '*':
                            obj["adj_list"][str(x) + "x" + str(y)].add(str(x + dx) + "x" + str(y + dy))
                            obj["letter_pos"][grid[y + dy][x + dx].lower()].add(str(x + dx) + "x" + str(y + dy))

    return obj

def read_wordlist(path, letters):
    f = open(path, 'r')
    t = f.read().split('\n')
    w = set()
    for tmp in t:
        c = tmp.lower()
        if len(set(c).difference(letters)) == 0 and len(c) > 0:
            w.add(c)
    return w
        
def word_present(obj, word):
    paths = list(map(lambda x: [x], obj["letter_pos"][word[0]]))
    path_length = 1

    for c in word[1:]:
        locations = obj["letter_pos"][c]
        n_paths = []
        for p in paths:
            last_pos = p[len(p) - 1]
            tmp = obj["adj_list"][last_pos].intersection(locations)
            for l in tmp:
                s = set(p)
                s.add(l)
                if len(s) == path_length + 1:
                    s = p[:]
                    s.append(l)
                    n_paths.append(s)

        paths = n_paths[:]
        path_length += 1

        if len(paths) == 0:
            return paths
    
    return paths

def filter_wordlist(obj, wordlist):
    r = []
    for w in wordlist:
        if len(word_present(obj, w)) > 0:
            r.append(w)
    r.sort(key=sort_key)
    r.reverse()

    result = []

    for w in r[0:30]:
        result.append([w, word_present(obj, w)])

    return result

def sort_key(w):
    return len(w)

def main():
    grid = [
        "***n****",
        "**tu***n",
        "**fdspot",
        "h*hote*e",
        "l*t*poin",
        "bzggsnfa",
        "tcrssirl",
        "ellmh*e*",
        "anxnajcs",
        "dhfcouru",
        "aeeapuno",
        "beyu*el*"
    ]

    obj = parse_grid(grid)
    wordlist = read_wordlist("wordlists/wordlist.txt", set(obj["letter_pos"]))
    present = filter_wordlist(obj, wordlist)

    return obj, wordlist, present

obj, wordlist, present = main() 
print(present)
