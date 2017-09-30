BEGIN;

SET search_path = "_ermrest";

DELETE FROM _ermrest.model_table_annotation WHERE schema_name = 'Microscopy' AND table_name in ('Scan', 'Specimen', 'Experiment', 'Slide', 'Collection', 'experiment_type', 'gene', 'probe', 'species', 'tissue', 'User')  AND annotation_uri = 'tag:isrd.isi.edu,2016:visible-columns';

INSERT INTO _ermrest.model_table_annotation (schema_name, table_name, annotation_uri, annotation_value) VALUES

('Microscopy', 'Scan', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"compact": ["Thumbnail", "accession_number", "species", "tissue", "gene", "age", "submitter", "Acquisition Date"],
	"detailed": ["Thumbnail", "HTTP URL", ["Microscopy", "Scan_Slide ID_fkey"], "Acquisition Date", "submitter", ["Microscopy", "Scan_species_fkey"], ["Microscopy", "Scan_tissue_fkey"], ["Microscopy", "Scan_gene_fkey"], ["Microscopy", "Scan_gender_fkey"], ["Microscopy", "Scan_Experiment Type_fkey"], "Probes", "age", "Objective", "Channels", "Channel Name", "Contrast Method", "Light Source Intensity", "Exposure Time"],
	"entry/edit": ["submitter", "species", "tissue", "gene", "gender", "age"],
	"entry/create": ["submitter", "species", "tissue", "gene", "gender", "age"],
	"filter": {
		"and": [
			{"source": "submitter", "markdown_name": "**Submitted By**", "ux_mode": "choices"},
			{"source": "species", "ux_mode": "choices"},
			{"source": "age", "ux_mode": "choices"},
			{"source": "gene", "ux_mode": "choices"},
			{"source": "probe", "ux_mode": "choices"},
			{"source": "Experiment Type", "ux_mode": "choices"},
			{"source": "Acquisition Date"},
			{"source": "submitted"},
			{"source": "tissue", "ux_mode": "choices"},
			{"source": "Experiment ID", "markdown_name": "**Experiment ID**", "ux_mode": "choices"},
			{"source": "Specimen ID", "markdown_name": "**Specimen ID**", "ux_mode": "choices"},
			{"source": "Probes"},
			{"source": [{"inbound": ["Microscopy", "scan_comments_Scan id_fkey"]}, "Comment"], "markdown_name": "**Comment**"}
		]
	}
}'),

('Microscopy', 'Specimen', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": [["Microscopy", "Specimen_Species_fkey"], ["Microscopy", "Specimen_Tissue_fkey"], "Age", "Initials", "Section Date", "Specimen Identifier", "Number of Slides", "Number of Scans", "Label"],
	"compact": ["ID", "Species", "Tissue", "Age", "Initials", "Section Date", "Specimen Identifier", "Number of Slides", "Number of Scans", "Label"],
	"entry": [["Microscopy", "Specimen_Species_fkey"], ["Microscopy", "Specimen_Tissue_fkey"], "Age Value",  ["Microscopy", "Specimen_Age Unit_fkey"], ["Microscopy", "Specimen_Gene_fkey"], ["Microscopy", "Specimen_Initials_fkey"], "Section Date", "Specimen Identifier"],
	"filter": {
		"and": [
			{"source": "Initials", "markdown_name": "**Submitted By**", "ux_mode": "choices", "open": true},
			{"source": "Species", "ux_mode": "choices"},
			{"source": "Age", "ux_mode": "choices"},
			{"source": "Gene", "ux_mode": "choices"},
			{"source": "Tissue", "ux_mode": "choices"},
			{"source": "ID", "markdown_name": "**Specimen ID**", "ux_mode": "choices"},
			{"source": "Section Date"},
			{"source": "Disambiguator", "ux_mode": "choices"},
			{"source": "Specimen Identifier", "ux_mode": "choices"},
			{"source": "Age Unit", "ux_mode": "choices"},
			{"source": "Age Value", "ux_mode": "choices"},
			{"source": "Number of Slides", "ranges": [{"min":0}, {"max":1}], "markdown_name": "**Number of Slides**", "open": false},
			{"source": "Number of Scans", "ranges": [{"min":0}, {"max":1}], "markdown_name": "**Number of Scans**", "open": false},
			{"source": [{"inbound": ["Microscopy", "specimen_comments_Specimen ID_fkey"]}, "Comment"], "markdown_name": "**Comment**"}
		]
	}
}'),

('Microscopy', 'Experiment', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["Initials", "Experiment Date", ["Microscopy", "Experiment_Experiment Type_fkey"], "Number of Slides", "Number of Scans"],
	"compact": ["ID", "Initials", "Experiment Date", ["Microscopy", "Experiment_Experiment Type_fkey"], "Probe", "Number of Slides", "Number of Scans"],
	"entry": [["Microscopy", "Experiment_Initials_fkey"], "Experiment Date", ["Microscopy", "Experiment_Experiment Type_fkey"], ["Microscopy", "Experiment_Probe_fkey"]],
	"filter": {
		"and": [
			{"source": "Initials", "markdown_name": "**Submitted By**", "ux_mode": "choices", "open": true},
			{"source": "Probe", "ux_mode": "choices"},
			{"source": "Experiment Type", "ux_mode": "choices"},
			{"source": "ID", "markdown_name": "**Experiment ID**", "ux_mode": "choices"},
			{"source": "Experiment Date"},
			{"source": "Disambiguator", "ux_mode": "choices"},
			{"source": "Number of Slides", "ranges": [{"min":0}, {"max":1}], "markdown_name": "**Number of Slides**", "open": false},
			{"source": "Number of Scans", "ranges": [{"min":0}, {"max":1}], "markdown_name": "**Number of Scans**", "open": false},
			{"source": [{"inbound": ["Microscopy", "experiment_comments_Experiment ID_fkey"]}, "Comment"], "markdown_name": "**Comment**"}
		]
	}
}'),

('Microscopy', 'Slide', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["Seq.", ["Microscopy", "Slide_Box ID_fkey"], ["Microscopy", "Slide_Experiment ID_fkey"], "Number of Scans", "Label"],
	"compact": ["ID", "Seq.", ["Microscopy", "Slide_Box ID_fkey"], ["Microscopy", "Slide_Experiment ID_fkey"], "Number of Scans", "Label"],
	"entry": [["Microscopy", "Slide_Box ID_fkey"], ["Microscopy", "Slide_Experiment ID_fkey"], "Seq."],
	"filter": {
		"and": [
			{"source": "ID", "markdown_name": "**Slide ID**", "ux_mode": "choices", "open": true},
			{"source": "Seq."},
			{"source": "Specimen ID", "markdown_name": "**Specimen ID**", "ux_mode": "choices"},
			{"source": "Experiment ID", "markdown_name": "**Experiment ID**", "ux_mode": "choices"},
			{"source": "Number of Scans", "ranges": [{"min": 0}, {"max":1}], "markdown_name": "**Number of Scans**", "open": false},
			{"source": [{"inbound": ["Microscopy", "slide_comments_Slide ID_fkey"]}, "Comment"], "markdown_name": "**Comment**"}
		]
	}
}'),

('Microscopy', 'Collection', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"compact": ["Title", "Created By", "Creation Timestamp", "Description"],
	"detailed": ["ID", "Created By", "Creation Timestamp", "Title", "Description"],
	"entry/edit": ["Title", "Description"],
	"filter": {
		"and": [
			{"source": "Title", "ux_mode": "choices"},
			{"source": "Creation Timestamp"},
			{"source": "Description"},
			{"source": [{"inbound": ["Microscopy", "collection_scan_Collection ID_fkey"]}, {"outbound": ["Microscopy", "collection_scan_Scan ID_fkey"]}, "id"], "markdown_name": "**Scan**"}
		]
	}
}'),

('Microscopy', 'experiment_type', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["code", "term"],
	"compact": ["code", "term"],
	"filter": {
		"and": [
			{"source": "code", "ux_mode": "choices"},
			{"source": "term", "ux_mode": "choices"},
			{"source": [{"inbound": ["Microscopy", "Experiment_Experiment Type_fkey"]}, "ID"], "markdown_name": "**Experiment**"},
			{"source": [{"inbound": ["Microscopy", "Scan_Experiment Type_fkey"]}, "id"], "markdown_name": "**Scan**"}
		]
	}
}'),

('Microscopy', 'gene', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["code", "term"],
	"compact": ["code", "term"],
	"filter": {
		"and": [
			{"source": "code", "ux_mode": "choices"},
			{"source": "term", "ux_mode": "choices"},
			{"source": [{"inbound": ["Microscopy", "Specimen_Gene_fkey"]}, "ID"], "markdown_name": "**Specimen**"},
			{"source": [{"inbound": ["Microscopy", "Scan_gene_fkey"]}, "id"], "markdown_name": "**Scan**"}
		]
	}
}'),

('Microscopy', 'probe', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["code", "term"],
	"compact": ["code", "term"],
	"filter": {
		"and": [
			{"source": "code", "ux_mode": "choices"},
			{"source": "term", "ux_mode": "choices"},
			{"source": [{"inbound": ["Microscopy", "Experiment_Probe_fkey"]}, "ID"], "markdown_name": "**Experiment**"}
		]
	}
}'),

('Microscopy', 'species', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["code", "term"],
	"compact": ["code", "term"],
	"filter": {
		"and": [
			{"source": "code", "ux_mode": "choices"},
			{"source": "term", "ux_mode": "choices"},
			{"source": [{"inbound": ["Microscopy", "Specimen_Species_fkey"]}, "ID"], "markdown_name": "**Specimen**"},
			{"source": [{"inbound": ["Microscopy", "Scan_species_fkey"]}, "id"], "markdown_name": "**Scan**"}
		]
	}
}'),

('Microscopy', 'tissue', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["code", "term"],
	"compact": ["code", "term"],
	"filter": {
		"and": [
			{"source": "code", "ux_mode": "choices"},
			{"source": "term", "ux_mode": "choices"},
			{"source": [{"inbound": ["Microscopy", "Specimen_Tissue_fkey"]}, "ID"], "markdown_name": "**Specimen**"},
			{"source": [{"inbound": ["Microscopy", "Scan_tissue_fkey"]}, "id"], "markdown_name": "**Scan**"}
		]
	}
}'),

('Microscopy', 'User', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["Initials", "Full Name"],
	"compact": ["Initials", "Full Name"],
	"filter": {
		"and": [
			{"source": "Full Name", "ux_mode": "choices"},
			{"source": "Initials", "ux_mode": "choices"},
			{"source": [{"inbound": ["Microscopy", "Experiment_Initials_fkey"]}, "ID"], "markdown_name": "**Experiment**"},
			{"source": [{"inbound": ["Microscopy", "Specimen_Initials_fkey"]}, "ID"], "markdown_name": "**Specimen**"},
			{"source": [{"inbound": ["Microscopy", "Scan_submitter_fkey"]}, "id"], "markdown_name": "**Scan**"}
		]
	}
}')
;

select _ermrest.model_change_event();

COMMIT;

