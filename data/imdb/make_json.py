import csv, json
import sys

genre_list = ['Action', 'Adult', 'Adventure', 'Animation', 'Biography',
       'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy',
       'FilmNoir', 'GameShow', 'History', 'Horror', 'Music', 'Musical',
       'Mystery', 'News', 'RealityTV', 'Romance', 'SciFi', 'Short', 'Sport',
       'TalkShow', 'Thriller', 'War', 'Western']
structured_genre = [{'name': genre} for genre in genre_list]

item_list = ['1888', '1893', '1894', '1899', '1900', '1902', '1903', '1904',
       '1910', '1911', '1912', '1913', '1914', '1915', '1916', '1917',
       '1918', '1919', '1920', '1921', '1922', '1923', '1924', '1925',
       '1926', '1927', '1928', '1929', '1930', '1931', '1932', '1933',
       '1934', '1935', '1936', '1937', '1938', '1939', '1940', '1941',
       '1942', '1943', '1944', '1945', '1946', '1947', '1948', '1949',
       '1950', '1951', '1952', '1953', '1954', '1955', '1956', '1957',
       '1958', '1959', '1960', '1961', '1962', '1963', '1964', '1965',
       '1966', '1967', '1968', '1969', '1970', '1971', '1972', '1973',
       '1974', '1975', '1976', '1977', '1978', '1979', '1980', '1981',
       '1982', '1983', '1984', '1985', '1986', '1987', '1988', '1989',
       '1990', '1991', '1992', '1993', '1994', '1995', '1996', '1997',
       '1998', '1999', '2000', '2001', '2002', '2003', '2004', '2005',
       '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013',
       '2014', '2015', '2016', '2017']
structured_items = []

with open('./year_genre.csv') as csv_file:
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
with open('./yg_corr_spearman.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    for row in csv_reader:
        if line_count == 0:
            line_count += 1
            continue
        spearman_corr.append([float(c) for c in row[1:]])
kendall_corr = []
with open('./yg_corr_kendall.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    for row in csv_reader:
        if line_count == 0:
            line_count += 1
            continue
        kendall_corr.append([float(c) for c in row[1:]])
pearson_corr = []
with open('./yg_corr_pearson.csv') as csv_file:
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
json.dump(json_data, open('./imdb_year_genre.json', 'w'))