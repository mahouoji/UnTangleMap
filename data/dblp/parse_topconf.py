import csv, json
import sys

TOPCONF_FILENAME = './data/topconf.txt'
OUTPUT_FILENAME = './data/topconf.json'

def main(argv):
    confs = {}
    with open(TOPCONF_FILENAME) as f:
        category = ''
        hindex = 0
        next_item = False
        for line in f:
            if line.startswith('$'):
                category = line[1:].strip()
                next_item = True
            elif line.startswith('\t'):
                next_item = True
            elif line.strip().isdigit():
                hindex = int(line.strip())
            elif next_item:
                name = line.strip().split(':', 1)
                if len(name) != 2:
                    print('unknown name format: %s %d' % (line, len(name)))
                abbr = name[0].strip()
                curr_key = abbr.lower()
                fullname = name[1].strip()
                if curr_key not in confs:
                    confs[curr_key] = {
                        'abbr': abbr,
                        'fullname': fullname,
                        'cates': [category],
                        'hindex': hindex
                    }
                else:
                    in_name = confs[curr_key]['fullname']
                    if fullname != in_name:
                        print('conflict abbr: %s | %s | %s' % (abbr, fullname, in_name))
                    confs[curr_key]['cates'].append(category)
                next_item = False
    print('total confs: %d' % len(confs))
    json.dump(confs, open(OUTPUT_FILENAME, 'w'), indent=2)

                


if __name__ == '__main__':
    main(sys.argv)