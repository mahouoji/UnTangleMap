import csv, json
import sys


genre_list = ['Action', 'Adult', 'Adventure', 'Animation', 'Biography',
       'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy',
       'FilmNoir', 'GameShow', 'History', 'Horror', 'Music', 'Musical',
       'Mystery', 'News', 'RealityTV', 'Romance', 'SciFi', 'Short', 'Sport',
       'TalkShow', 'Thriller', 'War', 'Western']
structured_genre = [{'name': genre} for genre in genre_list]

def make_json(item_label_file, corr_spearman_file, corr_kendal_file, corr_pearson_file, output_file):
    structured_items = []

    with open(item_label_file) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        for row in csv_reader:
            if line_count == 0:
                line_count += 1
                continue
            structured_items.append({
                'name': str(row[0]),
                'vec': [int(cnt) for cnt in row[1:]]
            })
    spearman_corr = []
    with open(corr_spearman_file) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        for row in csv_reader:
            if line_count == 0:
                line_count += 1
                continue
            spearman_corr.append([float(c) for c in row[1:]])
    kendall_corr = []
    with open(corr_kendal_file) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        for row in csv_reader:
            if line_count == 0:
                line_count += 1
                continue
            kendall_corr.append([float(c) for c in row[1:]])
    pearson_corr = []
    with open(corr_pearson_file) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        for row in csv_reader:
            if line_count == 0:
                line_count += 1
                continue
            pearson_corr.append([float(c) for c in row[1:]])

    json_data = {
        'labels': structured_genre,
        'items': structured_items,
        'corr': {'spearman': spearman_corr, 'kendall': kendall_corr, 'pearson': pearson_corr}
    }
    json.dump(json_data, open(output_file, 'w'))

make_json('year_genre.csv', 'yg_corr_spearman.csv', 'yg_corr_kendall.csv', 'yg_corr_pearson.csv', 'imdb_year_genre.json')
make_json('movie_genre.csv', 'mg_corr_spearman.csv', 'mg_corr_kendall.csv', 'mg_corr_pearson.csv', 'imdb_movie_genre.json')