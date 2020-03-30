import csv, json
import sys

def main(argv):
    '''
    if len(argv) != 2:
        print("Usage: parse_author_conf.py <file_name>", file=sys.stderr)
        exit(-1)
    '''
    with open('../dataset/inproceedings.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        stat = dict()
        confs = dict()
        for row in csv_reader:
            if line_count == 0:
                line_count += 1
            else:
                key = row[0]
                author = row[1]
                year = int(row[2])
                line_count += 1
                if year < 2010 or year > 2020: continue
                if not key.startswith('conf'):
                    continue
                conf = key.split('/', 3)[1].strip()
                author = author.split('::')[0].strip()
                if len(conf) <= 0 or len(author) <= 0:
                    continue
                # update conference dict
                if conf not in confs:
                    confs[conf] = 0
                confs[conf] += 1
                # update author dict
                if author not in stat:
                    stat[author] = {'total': 0}
                if conf not in stat[author]:
                    stat[author][conf] = 0
                stat[author][conf] += 1
                stat[author]['total'] += 1
    # sort conference by count
    confs = {k: v for k, v in sorted(confs.items(), key=lambda item: item[1], reverse=True)}
    stat = {k: v for k, v in sorted(stat.items(), key=lambda item: item[1]['total'], reverse=True)}
    for k in stat:
        stat[k] = {k: v for k, v in sorted(stat[k].items(), key=lambda item: item[1], reverse=True)}

    confs_top = {}
    stat_top = {k: v for k, v in sorted(stat.items(), key=lambda item: item[1]['total'], reverse=True)[:3500]}
    for k in stat_top:
        for ck, cv in stat_top[k].items():
            if ck not in confs_top:
                confs_top[ck] = 0
            confs_top[ck] += cv
    confs_top = {k: v for k, v in sorted(confs_top.items(), key=lambda item: item[1], reverse=True)}

    print('total first authors:', len(stat))
    json.dump(confs, open('../dataset/confs.json', 'w'), indent=2)
    json.dump(stat, open('../dataset/authors.json', 'w'), indent=2)
    json.dump(confs_top, open('../dataset/confs_top3500.json', 'w'), indent=2)
    json.dump(stat_top, open('../dataset/authors_top3500.json', 'w'), indent=2)

if __name__ == '__main__':
    main(sys.argv)