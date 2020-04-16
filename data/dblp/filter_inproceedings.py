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
    author_rec = {}

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
                    else:
                        continue
                    #parse authors
                    author = author.split('::')
                    key = top_confs[key]['abbr']
                    for a in author:
                        if a not in author_rec:
                            author_rec[a] = {
                                'name': a,
                                'confs': {},
                                'total': 0
                            }
                        if key not in author_rec[a]['confs']:
                            author_rec[a]['confs'][key] = 0
                        author_rec[a]['confs'][key] += 1
                        author_rec[a]['total'] += 1

    for key in top_confs:
        if key not in confs:
            print('%s | %s | %d' % (key, top_confs[key]['fullname'], top_confs[key]['hindex']))
    print('%d conference found from file' % len(confs))

    with open('./data/author_conf.csv', 'w') as f:
        csv_writer = csv.writer(f)
        sorted_confs = [k for k, v in sorted(confs.items(), key=lambda item: item[1], reverse=True)]
        conf_keys = [top_confs[key]['abbr'] for key in sorted_confs]
        csv_writer.writerow(['author'] + conf_keys)
        top_authors = {k: v for k, v in sorted(author_rec.items(), key=lambda item: item[1]['total'],reverse=True)}
        cnt = 0
        last_total = 0
        for author in top_authors:
            cnt += 1
            if cnt > 500 and author_rec[author]['total'] < last_total:
                break
            last_total = author_rec[author]['total']
            confstat = []
            for conf in conf_keys:
                if conf in author_rec[author]['confs']:
                    confstat.append(author_rec[author]['confs'][conf])
                else:
                    confstat.append(0)
            csv_writer.writerow([author] + confstat)

if __name__ == '__main__':
    main(sys.argv)