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
                line_count += 1
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
                    stat[author] = dict()
                if conf not in stat[author]:
                    stat[author][conf] = 0
                stat[author][conf] += 1
    # sort conference by count
    confs = {k: v for k, v in sorted(confs.items(), key=lambda item: item[1], reverse=True)}
    json.dump(confs, open('../dataset/confs.json', 'w'), indent=2)
    json.dump(stat, open('../dataset/authors.json', 'w'), indent=2)

if __name__ == '__main__':
    main(sys.argv)