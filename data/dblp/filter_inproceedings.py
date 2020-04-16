import csv, json
import sys

INPROCEEDINGS_FILENAME = './data/inproceedings.csv'
TOPCONF_FILENAME = './data/topconf.json'
HINDEX = 30
disambig = { # dplp key to abbriviation (for hindex >= 30)
    "nips": "neurips",
    "kdd": "sigkdd",
    "uss": "usenix security",
    "naacl": "hlt-naacl",
    "mm": "acmmm",
    "huc": "ubicomp",
    "icdm": "icdmw",
    "usenix": "act",
    "ipps": "ipdps",
    "kbse": "ase",
    "bigdataconf": "big data",
    "icsm": "icsme",
    "mir": "icmr",
    "pkdd": "ecmlpkdd",
    "ecml": "ecmlpkdd",
    "wcre": "saner"
}

def main(argv):
    with open(TOPCONF_FILENAME) as f:
        top_confs = json.load(f)
    top_confs = { key:value for (key,value) in top_confs.items() if value['hindex'] >= HINDEX}
    print('%d conferences with hindex >= %d' % (len(top_confs), HINDEX))
    
    confs = {}

    with open(INPROCEEDINGS_FILENAME) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        with open('./data/inproceedings_filtered.csv', 'w', newline='') as wcsv_file:
            csv_writer = csv.writer(wcsv_file)
            line_count = 0
            for row in csv_reader:
                if line_count == 0:
                    csv_writer.writerow(['conf', 'authors', 'year'])
                    line_count += 1
                else:
                    conf = row[0]
                    author = row[1]
                    year = int(row[2])
                    line_count += 1
                    key = conf.lower()
                    if key in disambig:
                        key = disambig[key]
                    if key in top_confs:
                        csv_writer.writerow([conf, author, year])
                        if key not in confs:
                            confs[key] = 0
                        confs[key] += 1
    for key in top_confs:
        if key not in confs:
            print('%s | %s | %d' % (key, top_confs[key]['fullname'], top_confs[key]['hindex']))

if __name__ == '__main__':
    main(sys.argv)