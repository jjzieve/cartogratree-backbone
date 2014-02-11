#!usr/bin/python
# should be converted to php to act dynamically on the server....
# Generates JSON files, must be on machine with db_connect script in python path, and tunneled to treegenes
from db_connect import db_query
from collections import defaultdict
from json import dumps
import pickle

def printJSON(obj):
	print(dumps(obj, sort_keys=True,
		indent=4,separators=(',',': ')))

# query = '''select t.year,t.species,t.tgdr_accession,a.author_name,j.journal_name
# from tgdr_data_availability t, lit_author_r_paper rp, lit_author a, lit_paper p,lit_journal j, tgdr_study_sites tss, tgdr_samples ts
# where t.paper_id = p.paper_id and p.paper_id = rp.paper_id and rp.authorship_position = 0 and rp.author_id = a.author_id and p.journal_id = j.journal_id
# and t.tgdr_association_data_id = tss.tgdr_association_data_id and tss.id = ts.tgdr_study_sites_id and ts.gps_latitude <> '';'''
# rows = db_query(query).fetchall()
# publications = defaultdict(lambda: defaultdict(set))
# for (year,species,accession,author,journal) in rows:
# 	if year == "": continue
# 	last_name = author.split(",")[0]
# 	publications[str(year)][species].add(accession+"|"+last_name+" et al. ("+journal+")");
# for key in publications.keys():
# 	for innerKey in publications[key].keys():
# 		publications[key][innerKey] = list(publications[key][innerKey])
# printJSON(publications)

query = '''select family,genus,species from ctree_fusion_table_is_sts_mv;'''
rows = db_query(query).fetchall()
taxa = defaultdict(lambda: defaultdict(set))
for (family,genus,species) in rows:
	taxa[family][genus].add(species)
for key in taxa.keys():
	for innerKey in taxa[key].keys():
		taxa[key][innerKey] = list(taxa[key][innerKey])
printJSON(taxa)

