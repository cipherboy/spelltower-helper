#!/usr/bin/python3

def digraph_count(wordlist):
    frequency = {}
    count = 0
    for word in wordlist:
        for l in range(0, len(word) - 1):
            s = word[l:l+2]
            if s in frequency:
                frequency[s] += 1
            else:
                frequency[s] = 1
            count += 1
    return frequency, count

def trigraph_count(wordlist):
    frequency = {}
    count = 0
    for word in wordlist:
        for l in range(0, len(word) - 2):
            s = word[l:l+3]
            if s in frequency:
                frequency[s] += 1
            else:
                frequency[s] = 1
            count += 1
    return frequency, count

def digraphs(wordlist):
    result = set()

    for word in wordlist:
        for l in range(0, len(word) - 1):
            s = word[l:l+2]
            result.add(s)

    return list(result)

def trigraphs(wordlist):
    result = set()

    for word in wordlist:
        for l in range(0, len(word) - 2):
            s = word[l:l+3]
            result.add(s)

    return list(result)

def main():
    infile = "wordlist.txt"
    outfile = "wordlist.js"
    f = open(outfile, 'w')
    words = open(infile, 'r').read().split("\n")

    f.write("window.wordlist = " + str(words) + ";\n")
    f.write("window.bigraphs = " + str(digraphs(words)) + ";\n")
    f.write("window.trigraphs = " + str(trigraphs(words)) + ";\n")
    f.flush()
    f.close()

if __name__ == "__main__":
    main()
