# NYU VisML2020 Project - Interactive UnTangle Map

This project implements and enhances the UnTangle Map system proposed by [this paper](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.723.165&rep=rep1&type=pdf)

For details, pleas read [my project report](https://github.com/mahouoji/UnTangleMap/blob/master/VisML_Project_Report-Interactive_UnTangleMap.pdf) and [the slides](https://docs.google.com/presentation/d/1_rOfMm3Jw_zJIEBKT_V_PdbJmg2macxraGjlBHlQiXg/edit?usp=sharing).

Demo site: https://priceless-gates-1c6230.netlify.app

## Set up

```bash
# go to ./src and set up server
cd ./src
python -m http.server
```

## Files

```./src``` - layout algorithm and interface source code

```./data``` - data processing

- ```IMDB``` - movie dataset from https://www.kaggle.com/orgesleka/imdbmovies
- ```DBLP``` - DBLP dataset from https://dblp.org/xml/, and h-index data from http://www.guide2research.com/

```./ext``` - other references

- ```DBLPParser``` - modified from https://github.com/IsaacChanghau/DBLPParser
-  ```d3samples``` - d3 references

```./doc``` - figures in document

## Results

<img src="doc/result.png" alt="result" style="zoom:50%;" />