import csv, json
import sys

HINDEX = 30

structured_conf = []
structured_items = []

with open('./data/topconf.json') as f:
    top_confs = json.load(f)
    top_confs = { key:value for (key,value) in top_confs.items() if value['hindex'] >= HINDEX }
    print('%d conferences with hindex >= %d' % (len(top_confs), HINDEX))

with open('./data/author_conf.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    for row in csv_reader:
        if line_count == 0:
            line_count += 1
            for conf in row[1:-1]:
                key = conf.lower()
                structured_conf.append({
                    'name': conf,
                    'fullname': top_confs[key]['fullname'],
                    'cates': top_confs[key]['cates'],
                    'hindex': top_confs[key]['hindex']
                })
            continue
        structured_items.append({
            'name': row[0],
            'vec': [int(r) for r in row[1:]]
        })

spearman_corr = []
with open('./data/corr_spearman.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    for row in csv_reader:
        if line_count == 0:
            line_count += 1
            continue
        spearman_corr.append([float(c) for c in row[1:]])

json_data = {
    'labels': structured_conf,
    'items': structured_items,
    'corr': {'spearman' : spearman_corr}
}
json.dump(json_data, open('./dblp.json', 'w'))