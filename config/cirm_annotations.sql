--
-- Script to set the annotations for CIRM 
---

BEGIN;

SET search_path = "_ermrest";

DELETE FROM _ermrest.model_column_annotation;
DELETE FROM _ermrest.model_key_annotation;
DELETE FROM _ermrest.model_keyref_annotation;
DELETE FROM _ermrest.model_pseudo_key;
DELETE FROM _ermrest.model_pseudo_keyref;
DELETE FROM _ermrest.model_schema_annotation;
DELETE FROM _ermrest.model_table_annotation;

INSERT INTO _ermrest.model_column_annotation (schema_name, table_name, column_name, annotation_uri, annotation_value) VALUES
('Microscopy', 'User', 'Initials', 'comment', '["top"]'),
('Microscopy', 'User', 'Full Name', 'comment', '["top"]'),

('Microscopy', 'age_stage', 'code', 'comment', '["hidden"]'),
('Microscopy', 'age_stage', 'description', 'comment', '["hidden"]'),
('Microscopy', 'age_stage', 'id', 'comment', '["dataset", "hidden"]'),
('Microscopy', 'age_stage', 'invalid_reason', 'comment', '["hidden"]'),
('Microscopy', 'age_stage', 'superclass_id', 'comment', '["hidden"]'),
('Microscopy', 'age_stage', 'term', 'comment', '["top"]'),
('Microscopy', 'age_stage', 'term', 'description', '{"display": "Age Stage", "rank": "weeks"}'),
('Microscopy', 'age_stage', 'uri', 'comment', '["hidden"]'),
('Microscopy', 'age_stage', 'valid_end_date', 'comment', '["hidden"]'),
('Microscopy', 'age_stage', 'valid_start_date', 'comment', '["hidden"]'),
('Microscopy', 'age_stage', 'weeks', 'comment', '["hidden"]'),

('Microscopy', 'annotation', 'anatomy', 'comment', '["top"]'),
('Microscopy', 'annotation', 'context_uri', 'comment', '["hidden"]'),
('Microscopy', 'annotation', 'coords', 'comment', '["hidden"]'),
('Microscopy', 'annotation', 'description', 'description', '{"display": "Annotation Description"}'),
('Microscopy', 'annotation', 'id', 'comment', '["dataset", "hidden"]'),
('Microscopy', 'annotation', 'image_id', 'comment', '["hidden"]'),
('Microscopy', 'annotation', 'last_modified', 'comment', '["top"]'),
('Microscopy', 'annotation', 'last_modified', 'description', '{"display": "Annotation Last Modified"}'),

('Microscopy', 'embedding_medium', 'code', 'comment', '["hidden"]'),
('Microscopy', 'embedding_medium', 'description', 'comment', '["hidden"]'),
('Microscopy', 'embedding_medium', 'id', 'comment', '["dataset", "hidden"]'),
('Microscopy', 'embedding_medium', 'invalid_reason', 'comment', '["hidden"]'),
('Microscopy', 'embedding_medium', 'superclass_id', 'comment', '["hidden"]'),
('Microscopy', 'embedding_medium', 'term', 'comment', '["top"]'),
('Microscopy', 'embedding_medium', 'term', 'description', '{"display": "Embedding Medium"}'),
('Microscopy', 'embedding_medium', 'uri', 'comment', '["hidden"]'),
('Microscopy', 'embedding_medium', 'valid_end_date', 'comment', '["hidden"]'),
('Microscopy', 'embedding_medium', 'valid_start_date', 'comment', '["hidden"]'),

('Microscopy', 'gender', 'code', 'comment', '["hidden"]'),
('Microscopy', 'gender', 'description', 'comment', '["hidden"]'),
('Microscopy', 'gender', 'id', 'comment', '["dataset", "hidden"]'),
('Microscopy', 'gender', 'invalid_reason', 'comment', '["hidden"]'),
('Microscopy', 'gender', 'superclass_id', 'comment', '["hidden"]'),
('Microscopy', 'gender', 'term', 'comment', '["top"]'),
('Microscopy', 'gender', 'term', 'description', '{"display": "Gender"}'),
('Microscopy', 'gender', 'uri', 'comment', '["hidden"]'),
('Microscopy', 'gender', 'valid_end_date', 'comment', '["hidden"]'),
('Microscopy', 'gender', 'valid_start_date', 'comment', '["hidden"]'),

('Microscopy', 'specimen_fixation', 'code', 'comment', '["hidden"]'),
('Microscopy', 'specimen_fixation', 'description', 'comment', '["hidden"]'),
('Microscopy', 'specimen_fixation', 'id', 'comment', '["dataset", "hidden"]'),
('Microscopy', 'specimen_fixation', 'invalid_reason', 'comment', '["hidden"]'),
('Microscopy', 'specimen_fixation', 'superclass_id', 'comment', '["hidden"]'),
('Microscopy', 'specimen_fixation', 'term', 'comment', '["top"]'),
('Microscopy', 'specimen_fixation', 'term', 'description', '{"display": "Specimen Fixation"}'),
('Microscopy', 'specimen_fixation', 'uri', 'comment', '["hidden"]'),
('Microscopy', 'specimen_fixation', 'valid_end_date', 'comment', '["hidden"]'),
('Microscopy', 'specimen_fixation', 'valid_start_date', 'comment', '["hidden"]'),

('Microscopy', 'staining_protocol', 'code', 'comment', '["hidden"]'),
('Microscopy', 'staining_protocol', 'description', 'comment', '["hidden"]'),
('Microscopy', 'staining_protocol', 'id', 'comment', '["dataset", "hidden"]'),
('Microscopy', 'staining_protocol', 'invalid_reason', 'comment', '["hidden"]'),
('Microscopy', 'staining_protocol', 'superclass_id', 'comment', '["hidden"]'),
('Microscopy', 'staining_protocol', 'term', 'comment', '["top"]'),
('Microscopy', 'staining_protocol', 'term', 'description', '{"display": "Staining Protocol"}'),
('Microscopy', 'staining_protocol', 'uri', 'comment', '["hidden"]'),
('Microscopy', 'staining_protocol', 'valid_end_date', 'comment', '["hidden"]'),
('Microscopy', 'staining_protocol', 'valid_start_date', 'comment', '["hidden"]'),

('Microscopy', 'tissue', 'code', 'comment', '["hidden"]'),
('Microscopy', 'tissue', 'description', 'comment', '["hidden"]'),
('Microscopy', 'tissue', 'id', 'comment', '["dataset", "hidden"]'),
('Microscopy', 'tissue', 'invalid_reason', 'comment', '["hidden"]'),
('Microscopy', 'tissue', 'superclass_id', 'comment', '["hidden"]'),
('Microscopy', 'tissue', 'term', 'comment', '["top"]'),
('Microscopy', 'tissue', 'term', 'description', '{"display": "Tissue"}'),
('Microscopy', 'tissue', 'uri', 'comment', '["hidden"]'),
('Microscopy', 'tissue', 'valid_end_date', 'comment', '["hidden"]'),
('Microscopy', 'tissue', 'valid_start_date', 'comment', '["hidden"]'),

('Microscopy', 'image_grade_code', 'code', 'comment', '["top"]'),
('Microscopy', 'image_grade_code', 'code', 'description', '{"display": "Status"}'),

('Microscopy', 'age', 'term', 'comment', '["title"]'),
('Microscopy', 'experiment_type', 'term', 'comment', '["title"]'),
('Microscopy', 'gene', 'term', 'comment', '["title"]'),
('Microscopy', 'probe', 'term', 'comment', '["title"]'),
('Microscopy', 'species', 'term', 'comment', '["title"]'),

('Microscopy', 'Scan', 'Thumbnail', 'comment', '["thumbnail", "hidden"]'),
('Microscopy', 'Scan', 'Channels', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'Channel Name', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'Disambiguator', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'last_modified', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'accession_number', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'age', 'description', '{"rank": "age_rank"}'),
('Microscopy', 'Scan', 'age_rank', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'age_stage', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'ark', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'bytes', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'description', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'description', 'description', '{"display": "Image Identifier"}'),
('Microscopy', 'Scan', 'doi', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'embedding_medium', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'filename', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'gender', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'id', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'last_modified', 'description', '{"display": "Image Last Modified"}'),
('Microscopy', 'Scan', 'mime_type', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'public_release_date', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'resolution', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'slide_id', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'specimen_fixation', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'staining_protocol', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'status', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'submitter', 'description', '{"display": "Submitted By"}'),
('Microscopy', 'Scan', 'uri', 'comment', '["summary", "url", "hidden"]'),
('Microscopy', 'Scan', 'uri', 'description', '{"url_text": "View Image"}'),

('Microscopy', 'Scan', 'submitter', 'facetOrder', '1'),
('Microscopy', 'Scan', 'species', 'facetOrder', '2'),
('Microscopy', 'Scan', 'age', 'facetOrder', '3'),
('Microscopy', 'Scan', 'gene', 'facetOrder', '4'),
('Microscopy', 'Scan', 'probe', 'facetOrder', '5'),
('Microscopy', 'Scan', 'Microscope', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'Camera', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'Objective', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'Exposure Time', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'Contrast Method', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'Magnification', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'Light Source Intensity', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'Image Size', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'Scaling (per pixel)', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'DZI', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'HTTP URL', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'czi2dzi', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'File Date', 'comment', '["hidden"]'),
('Microscopy', 'Scan', 'checksum', 'comment', '["hidden"]'),

('Microscopy', 'Specimen', 'Initials', 'facetOrder', '1'),
('Microscopy', 'Specimen', 'Species', 'facetOrder', '2'),
('Microscopy', 'Specimen', 'Age', 'facetOrder', '3'),
('Microscopy', 'Specimen', 'Gene', 'facetOrder', '4'),
('Microscopy', 'Specimen', 'Tissue', 'facetOrder', '5'),
('Microscopy', 'Specimen', 'Genes', 'comment', '["hidden"]'),
('Microscopy', 'Specimen', 'Age', 'description', '{"rank": "age_rank"}'),
('Microscopy', 'Specimen', 'Label', 'comment', '["hidden"]'),
-- ('Microscopy', 'Specimen', 'Specimen Identifier', 'comment', '["hidden"]'),
('Microscopy', 'Specimen', 'age_rank', 'comment', '["hidden"]'),
('Microscopy', 'Specimen', 'Initials', 'description', '{"display": "Submitted By"}'),

('Microscopy', 'Experiment', 'Initials', 'facetOrder', '1'),
('Microscopy', 'Experiment', 'Probe', 'facetOrder', '2'),
('Microscopy', 'Experiment', 'Experiment Type', 'facetOrder', '3'),
('Microscopy', 'Experiment', 'Probes', 'comment', '["hidden"]'),
('Microscopy', 'Experiment', 'Initials', 'description', '{"display": "Submitted By"}'),

('Microscopy', 'Slide', 'Label', 'comment', '["hidden"]'),
('Microscopy', 'Slide', 'Seq.', 'comment', '["top"]'),
('Microscopy', 'Slide', 'Comment', 'comment', '["top"]'),
('Microscopy', 'Slide', 'Number of Scans', 'comment', '["top"]'),

-- ('Microscopy', 'Scan', 'species', 'tag:isrd.isi.edu,2016:column-display', '{"detailed" :{"markdown_pattern":"**{{species}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),
-- ('Microscopy', 'Scan', 'tissue', 'tag:isrd.isi.edu,2016:column-display', '{"detailed" :{"markdown_pattern":"**{{tissue}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),
-- ('Microscopy', 'Scan', 'gene', 'tag:isrd.isi.edu,2016:column-display', '{"detailed" :{"markdown_pattern":"**{{gene}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),
-- ('Microscopy', 'Scan', 'gender', 'tag:isrd.isi.edu,2016:column-display', '{"detailed" :{"markdown_pattern":"**{{gender}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),

('Microscopy', 'Scan', 'Thumbnail', 'tag:isrd.isi.edu,2016:column-display', 
'{
	"detailed" :{"markdown_pattern":"[![]({{Thumbnail}}){width=400 height=400}](/chaise/viewer/#1/Microscopy:Scan/id={{#encode}}{{id}}{{/encode}}){target=_blank}","separator_markdown":"  "},
	"compact" :{"markdown_pattern":"[![]({{Thumbnail}}){width=100 height=100}](/chaise/record/#1/Microscopy:Scan/id={{#encode}}{{id}}{{/encode}}){target=_blank}","separator_markdown":"  "}
}'),

('Microscopy', 'Scan', 'HTTP URL', 'tag:isrd.isi.edu,2016:column-display', 
'{
	"detailed" :{"markdown_pattern":"[**{{filename}}** ({{bytes}} Bytes)]({{HTTP URL}})","separator_markdown":"\n\n"}
}'),

-- ('Microscopy', 'Scan', 'slide_id', 'tag:isrd.isi.edu,2016:column-display', 
-- '{
--	"detailed" :{"markdown_pattern":"[**{{slide_id}}** ](/chaise/record/#1/Microscopy:Slide/ID={{slide_id}})","separator_markdown":"\n\n"}
-- }'),

-- ('Microscopy', 'probe', 'term', 'tag:isrd.isi.edu,2016:column-display', '{"compact" :{"markdown_pattern":"**{{term}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),
-- ('Microscopy', 'gene', 'term', 'tag:isrd.isi.edu,2016:column-display', '{"compact" :{"markdown_pattern":"**{{term}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),

('Microscopy', 'Specimen', 'Label', 'tag:isrd.isi.edu,2016:column-display', 
'{
	"detailed" :{"markdown_pattern":"[**Print Label**](/microscopy/printer/specimen/job?{{Label}}){download .btn .btn-primary target=_blank}","separator_markdown":"\n\n"},
	"compact" :{"markdown_pattern":"{{#Label}}[**Print Label**](/microscopy/printer/specimen/job?{{Label}}){download .btn .btn-primary target=_blank}{{/Label}}","separator_markdown":"\n\n"}
}'),

('Microscopy', 'Slide', 'Label', 'tag:isrd.isi.edu,2016:column-display', 
'{
	"detailed" :{"markdown_pattern":"[**Print Label**](/microscopy/printer/slide/job?{{Label}}){download .btn .btn-primary target=_blank}","separator_markdown":"\n\n"},
	"compact" :{"markdown_pattern":"{{#Label}}[**Print Label**](/microscopy/printer/slide/job?{{Label}}){download .btn .btn-primary target=_blank}{{/Label}}","separator_markdown":"\n\n"}
}')

-- ('Microscopy', 'Specimen', 'Species', 'tag:isrd.isi.edu,2016:column-display', '{"detailed" :{"markdown_pattern":"**{{Species}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),
-- ('Microscopy', 'Specimen', 'Tissue', 'tag:isrd.isi.edu,2016:column-display', '{"detailed" :{"markdown_pattern":"**{{Tissue}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),
-- ('Microscopy', 'Specimen', 'Age', 'tag:isrd.isi.edu,2016:column-display', '{"detailed" :{"markdown_pattern":"**{{{Age}}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}"}}'),
-- ('Microscopy', 'Specimen', 'Gene', 'tag:isrd.isi.edu,2016:column-display', '{"detailed" :{"markdown_pattern":"**{{Gene}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),

-- ('Microscopy', 'Experiment', 'Probe', 'tag:isrd.isi.edu,2016:column-display', '{"detailed" :{"markdown_pattern":"**{{Probe}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),
-- ('Microscopy', 'Experiment', 'Experiment Type', 'tag:isrd.isi.edu,2016:column-display', '{"detailed" :{"markdown_pattern":"**{{Experiment Type}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),

-- ('Microscopy', 'Slide', 'Specimen ID', 'tag:isrd.isi.edu,2016:column-display', 
-- '{
--	"detailed": {"markdown_pattern": "[{{Specimen ID}}](/chaise/record/#1/Microscopy:Specimen/ID={{#encode}}{{Specimen ID}}{{/encode}})"},
--	"compact": {"markdown_pattern": "[{{Specimen ID}}](/chaise/record/#1/Microscopy:Specimen/ID={{#encode}}{{Specimen ID}}{{/encode}})"}
-- }'),
-- ('Microscopy', 'Slide', 'Experiment ID', 'tag:isrd.isi.edu,2016:column-display', 
-- '{
--	"detailed": {"markdown_pattern": "[{{Experiment ID}}](/chaise/record/#1/Microscopy:Experiment/ID={{#encode}}{{Experiment ID}}{{/encode}})"},
--	"compact": {"markdown_pattern": "[{{Experiment ID}}](/chaise/record/#1/Microscopy:Experiment/ID={{#encode}}{{Experiment ID}}{{/encode}})"}
--}')
;

INSERT INTO _ermrest.model_schema_annotation (schema_name, annotation_uri, annotation_value) VALUES
('Microscopy', 'comment', '["default"]'),
('Microscopy', 'tag:isrd.isi.edu,2016:recordlink', '{"mode": "tag:isrd.isi.edu,2016:recordlink/fragmentfilter", "resource": "record/"}'),
('Microscopy', 'tag:misd.isi.edu,2015:display', '{"name_style" : {"underline_space":true,"title_case":true}}')
;

INSERT INTO _ermrest.model_table_annotation (schema_name, table_name, annotation_uri, annotation_value) VALUES
('Microscopy', 'age_stage', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["code", "term"],
	"compact": ["code", "term"]
}'),
('Microscopy', 'anatomy', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["code", "term"],
	"compact": ["code", "term"]
}'),
('Microscopy', 'annotation_type', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["code", "term"],
	"compact": ["code", "term"]
}'),
('Microscopy', 'embedding_medium', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["code", "term"],
	"compact": ["code", "term"]
}'),
('Microscopy', 'gender', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["code", "term"],
	"compact": ["code", "term"]
}'),
('Microscopy', 'specimen_fixation', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["code", "term"],
	"compact": ["code", "term"]
}'),
('Microscopy', 'staining_protocol', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["code", "term"],
	"compact": ["code", "term"]
}'),
('Microscopy', 'probe', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["code", "term"],
	"compact": ["code", "term"]
}'),
('Microscopy', 'species', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["code", "term"],
	"compact": ["code", "term"]
}'),
('Microscopy', 'tissue', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["code", "term"],
	"compact": ["code", "term"]
}'),
('Microscopy', 'gene', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["code", "term"],
	"compact": ["code", "term"]
}'),
('Microscopy', 'age', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["code", "term"],
	"compact": ["code", "term"]
}'),
('Microscopy', 'experiment_type', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["code", "term"],
	"compact": ["code", "term"]
}'),

('Microscopy', 'image_grade_code', 'comment', '["association"]'),
('Microscopy', 'annotation', 'comment', '["association"]'),
--('Microscopy', 'tissue', 'comment', '["association"]'),
('Microscopy', 'gender', 'comment', '["association"]'),
('Microscopy', 'age_stage', 'comment', '["association"]'),
('Microscopy', 'specimen_fixation', 'comment', '["association"]'),
('Microscopy', 'embedding_medium', 'comment', '["association"]'),
('Microscopy', 'staining_protocol', 'comment', '["association"]'),
('Microscopy', 'age_stage', 'facet', '["hidden"]'),
('Microscopy', 'specimen_fixation', 'facet', '["hidden"]'),
('Microscopy', 'embedding_medium', 'facet', '["hidden"]'),
('Microscopy', 'staining_protocol', 'facet', '["hidden"]'),
('Microscopy', 'gender', 'facet', '["hidden"]'),
('Microscopy', 'annotation', 'facet', '["hidden"]'),
('Microscopy', 'annotation_comment', 'comment', '["exclude"]'),
('Microscopy', 'anatomy', 'comment', '["exclude"]'),
('Microscopy', 'annotation_type', 'comment', '["exclude"]'),
-- ('Microscopy', 'image_grade_code', 'comment', '["exclude"]'),
('Microscopy', 'specimen_gene', 'comment', '["exclude"]'),
('Microscopy', 'experiment_probe', 'comment', '["exclude"]'),
('Microscopy', 'Scan', 'comment', '["default"]'),

('Microscopy', 'age', 'description', '{"display": "Age", "top_columns": ["term", "code"]}'),
('Microscopy', 'experiment_type', 'description', '{"display": "Experiment Type", "top_columns": ["term", "code"]}'),
('Microscopy', 'gene', 'description', '{"display": "Gene", "top_columns": ["term", "code"]}'),
('Microscopy', 'probe', 'description', '{"display": "Probe", "top_columns": ["term", "code"]}'),
('Microscopy', 'species', 'description', '{"display": "Species", "top_columns": ["term", "code"]}'),
('Microscopy', 'tissue', 'description', '{"display": "Tissue"}'),

('Microscopy', 'Specimen', 'tag:isrd.isi.edu,2016:table-display', '{
	"row_name" :{"row_markdown_pattern":"{{{ID}}}"},
	"compact": {"row_order": [{"column":"Section Date","descending":true}]}
}'),
('Microscopy', 'Experiment', 'tag:isrd.isi.edu,2016:table-display', '{
	"row_name" :{"row_markdown_pattern":"{{{ID}}}"},
	"compact": {"row_order": [{"column":"Experiment Date","descending":true}]}
}'),
('Microscopy', 'Slide', 'tag:isrd.isi.edu,2016:table-display', '{
	"row_name" :{"row_markdown_pattern":"{{{ID}}}"}
}'),
('Microscopy', 'Scan', 'tag:isrd.isi.edu,2016:table-display', '{
	"row_name" :{"row_markdown_pattern":"{{{accession_number}}}"},
	"compact": {"row_order": [{"column":"Acquisition Date","descending":true}]}
}'),

('Microscopy', 'Scan', 'tag:isrd.isi.edu,2016:recordlink', '{"mode": "tag:isrd.isi.edu,2016:recordlink/fragmentfilter", "resource": "record/"}'),
('Microscopy', 'Scan', 'description', '{"sortedBy": "Acquisition Date", "sortOrder": "desc", "top_columns": ["Thumbnail", "description", "species", "tissue", "gene", "age", "submitter", "Acquisition Date"]}'),
('Microscopy', 'Scan', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"compact": ["Thumbnail", "accession_number", "species", "tissue", "gene", "age", "submitter", "Acquisition Date"],
	"detailed": ["Thumbnail", "HTTP URL", ["Microscopy", "Scan_Slide ID_fkey"], "Acquisition Date", "submitter", ["Microscopy", "Scan_species_fkey"], ["Microscopy", "Scan_tissue_fkey"], ["Microscopy", "Scan_gene_fkey"], ["Microscopy", "Scan_gender_fkey"], "age", "Objective", "Channels", "Channel Name", "Contrast Method", "Light Source Intensity", "Exposure Time"],
	"entry/edit": ["submitter", "species", "tissue", "gene", "gender", "age"],
	"entry/create": ["submitter", "species", "tissue", "gene", "gender", "age"]
}'),

('Microscopy', 'Specimen', 'description', '{"sortedBy": "Section Date", "sortOrder": "desc", "top_columns": ["ID", "Species", "Tissue", "Age Value", "Age Unit", "Gene", "Initials", "Specimen Identifier", "Section Date", "Number of Slides", "Number of Scans"]}'),
('Microscopy', 'Specimen', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": [["Microscopy", "Specimen_Species_fkey"], ["Microscopy", "Specimen_Tissue_fkey"], "Age", "Initials", "Section Date", "Specimen Identifier", "Comment", "Number of Slides", "Number of Scans", "Label"],
	"compact": ["ID", "Species", "Tissue", "Age", "Initials", "Section Date", "Specimen Identifier", "Comment", "Number of Slides", "Number of Scans", "Label"],
	"entry": [["Microscopy", "Specimen_Species_fkey"], ["Microscopy", "Specimen_Tissue_fkey"], "Age Value",  ["Microscopy", "Specimen_Age Unit_fkey"], ["Microscopy", "Specimen_Gene_fkey"], ["Microscopy", "Specimen_Initials_fkey"], "Section Date", "Specimen Identifier", "Comment"]
}'),

('Microscopy', 'Experiment', 'description', '{"sortedBy": "Experiment Date", "sortOrder": "desc", "top_columns": ["ID", "Initials", "Experiment Date", "Experiment Type", "Probe", "Comment", "Number of Slides", "Number of Scans"]}'),
('Microscopy', 'Experiment', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["Initials", "Experiment Date", ["Microscopy", "Experiment_Experiment Type_fkey"], "Comment", "Number of Slides", "Number of Scans"],
	"compact": ["ID", "Initials", "Experiment Date", ["Microscopy", "Experiment_Experiment Type_fkey"], "Probe", "Comment", "Number of Slides", "Number of Scans"],
	"entry": [["Microscopy", "Experiment_Initials_fkey"], "Experiment Date", ["Microscopy", "Experiment_Experiment Type_fkey"], ["Microscopy", "Experiment_Probe_fkey"], "Comment"]
}'),

('Microscopy', 'Slide', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["Seq.", ["Microscopy", "Slide_Box ID_fkey"], ["Microscopy", "Slide_Experiment ID_fkey"], "Comment", "Number of Scans", "Label"],
	"compact": ["ID", "Seq.", ["Microscopy", "Slide_Box ID_fkey"], ["Microscopy", "Slide_Experiment ID_fkey"], "Comment", "Number of Scans", "Label"],
	"entry": [["Microscopy", "Slide_Box ID_fkey"], ["Microscopy", "Slide_Experiment ID_fkey"], "Seq.", "Comment"]
}'),

('Microscopy', 'gene', 'tag:isrd.isi.edu,2016:table-display', 
'{
	"compact": {"row_markdown_pattern":"**{{term}}**{.vocab}","separator_markdown":" "}
}'),


('Microscopy', 'Scan', 'tag:isrd.isi.edu,2016:visible-foreign-keys', 
'{
	"detailed": [
	]
}'),

('Microscopy', 'Specimen', 'tag:isrd.isi.edu,2016:visible-foreign-keys', 
'{
	"detailed": [
		["Microscopy", "specimen_gene_Specimen ID_fkey"],
		["Microscopy", "Scan_Specimen ID_fkey"],
		["Microscopy", "Slide_Box ID_fkey"]
	]
}'),

('Microscopy', 'probe', 'tag:isrd.isi.edu,2016:table-display', 
'{
	"compact": {"row_markdown_pattern":"**{{term}}**{.vocab}","separator_markdown":" "}
}'),


('Microscopy', 'Experiment', 'tag:isrd.isi.edu,2016:visible-foreign-keys', 
'{
	"detailed": [
		["Microscopy", "experiment_probe_Experiment ID_fkey"],
		["Microscopy", "Scan_Experiment ID_fkey"],
		["Microscopy", "Slide_Experiment ID_fkey"]
	]
}'),

('Microscopy', 'probe', 'tag:isrd.isi.edu,2016:visible-foreign-keys', 
'{
	"detailed": [
		["Microscopy", "experiment_probe_Probe ID_fkey"]
	]
}'),

('Microscopy', 'age_stage', 'tag:isrd.isi.edu,2016:visible-foreign-keys', 
'{
	"detailed": [
		["Microscopy", "Scan_age_stage_fkey"]
	]
}'),

('Microscopy', 'anatomy', 'tag:isrd.isi.edu,2016:visible-foreign-keys', 
'{
	"detailed": [
		["Microscopy", "annotation_anatomy_fkey"]
	]
}'),

('Microscopy', 'annotation_type', 'tag:isrd.isi.edu,2016:visible-foreign-keys', 
'{
	"detailed": [
		["Microscopy", "annotation_type_fkey"]
	]
}'),

('Microscopy', 'embedding_medium', 'tag:isrd.isi.edu,2016:visible-foreign-keys', 
'{
	"detailed": [
		["Microscopy", "Scan_embedding_medium_fkey"]
	]
}'),

('Microscopy', 'gender', 'tag:isrd.isi.edu,2016:visible-foreign-keys', 
'{
	"detailed": [
		["Microscopy", "Scan_gender_fkey"]
	]
}'),

('Microscopy', 'specimen_fixation', 'tag:isrd.isi.edu,2016:visible-foreign-keys', 
'{
	"detailed": [
		["Microscopy", "Scan_specimen_fixation_fkey"]
	]
}'),

('Microscopy', 'experiment_type', 'tag:isrd.isi.edu,2016:visible-foreign-keys', 
'{
	"detailed": [
		["Microscopy", "Experiment_Experiment Type_fkey"]
	]
}'),

('Microscopy', 'staining_protocol', 'tag:isrd.isi.edu,2016:visible-foreign-keys', 
'{
	"detailed": [
		["Microscopy", "Scan_staining_protocol_fkey"]
	]
}'),

('Microscopy', 'species', 'tag:isrd.isi.edu,2016:visible-foreign-keys', 
'{
	"detailed": [
		["Microscopy", "Scan_species_fkey"],
		["Microscopy", "Specimen_Species_fkey"]
	]
}'),

('Microscopy', 'tissue', 'tag:isrd.isi.edu,2016:visible-foreign-keys', 
'{
	"detailed": [
		["Microscopy", "Scan_tissue_fkey"],
		["Microscopy", "Specimen_Tissue_fkey"]
	]
}'),

('Microscopy', 'age', 'tag:isrd.isi.edu,2016:visible-foreign-keys', 
'{
	"detailed": [
		["Microscopy", "Specimen_Age Unit_fkey"],
		["Microscopy", "age_stage_superclass_id_fkey"]
	]
}'),

('Microscopy', 'gene', 'tag:isrd.isi.edu,2016:visible-foreign-keys', 
'{
	"detailed": [
		["Microscopy", "specimen_gene_Gene ID_fkey"],
		["Microscopy", "Scan_gene_fkey"]
	]
}')

;

INSERT INTO _ermrest.model_table_annotation (schema_name, table_name, annotation_uri) VALUES
('Microscopy', 'Scan', 'tag:isrd.isi.edu,2016:generated')
;

INSERT INTO _ermrest.model_column_annotation (schema_name, table_name, column_name, annotation_uri) VALUES
('Microscopy', 'Scan', 'submitter', 'tag:isrd.isi.edu,2016:generated'),
('Microscopy', 'Scan', 'species', 'tag:isrd.isi.edu,2016:generated'),
('Microscopy', 'Scan', 'tissue', 'tag:isrd.isi.edu,2016:generated'),
('Microscopy', 'Scan', 'gene', 'tag:isrd.isi.edu,2016:generated'),
('Microscopy', 'Scan', 'gender', 'tag:isrd.isi.edu,2016:generated'),
('Microscopy', 'Scan', 'age', 'tag:isrd.isi.edu,2016:generated')
;

INSERT INTO _ermrest.model_column_annotation (schema_name, table_name, column_name, annotation_uri) VALUES
('Microscopy', 'Specimen', 'Gene', 'tag:isrd.isi.edu,2016:immutable'),
('Microscopy', 'Specimen', 'Age Unit', 'tag:isrd.isi.edu,2016:immutable'),
('Microscopy', 'Specimen', 'Age Value', 'tag:isrd.isi.edu,2016:immutable'),
('Microscopy', 'Specimen', 'Specimen Identifier', 'tag:isrd.isi.edu,2016:immutable'),
('Microscopy', 'Specimen', 'Initials', 'tag:isrd.isi.edu,2016:immutable'),
('Microscopy', 'Specimen', 'Species', 'tag:isrd.isi.edu,2016:immutable'),
('Microscopy', 'Specimen', 'Section Date', 'tag:isrd.isi.edu,2016:immutable'),
('Microscopy', 'Specimen', 'Tissue', 'tag:isrd.isi.edu,2016:immutable'),
('Microscopy', 'Experiment', 'Probe', 'tag:isrd.isi.edu,2016:immutable'),
('Microscopy', 'Experiment', 'Experiment Date', 'tag:isrd.isi.edu,2016:immutable'),
('Microscopy', 'Experiment', 'Initials', 'tag:isrd.isi.edu,2016:immutable'),
('Microscopy', 'Experiment', 'Experiment Type', 'tag:isrd.isi.edu,2016:immutable'),
('Microscopy', 'Specimen', 'ID', 'tag:isrd.isi.edu,2016:generated'),
('Microscopy', 'Experiment', 'ID', 'tag:isrd.isi.edu,2016:generated'),
('Microscopy', 'Slide', 'Seq.', 'tag:isrd.isi.edu,2016:immutable'),
('Microscopy', 'Slide', 'Specimen ID', 'tag:isrd.isi.edu,2016:immutable'),
-- ('Microscopy', 'Slide', 'Experiment ID', 'tag:isrd.isi.edu,2016:immutable'),
('Microscopy', 'Slide', 'ID', 'tag:isrd.isi.edu,2016:generated')
;

INSERT INTO _ermrest.model_column_annotation (schema_name, table_name, column_name, annotation_uri, annotation_value) VALUES
('Microscopy', 'Specimen', 'ID', 'description', '{"display": "Specimen ID"}'),
('Microscopy', 'Experiment', 'ID', 'description', '{"display": "Experiment ID"}'),
('Microscopy', 'Slide', 'ID', 'description', '{"display": "Slide ID"}'),
('Microscopy', 'Slide', 'Specimen ID', 'tag:misd.isi.edu,2015:display', '{"name" : "Specimen"}'),
('Microscopy', 'Slide', 'Experiment ID', 'tag:misd.isi.edu,2015:display', '{"name" : "Experiment"}'),
('Microscopy', 'Scan', 'accession_number', 'tag:misd.isi.edu,2015:display', '{"name" : "Scan ID"}'),
('Microscopy', 'Scan', 'slide_id', 'tag:misd.isi.edu,2015:display', '{"name" : "Slide"}'),
('Microscopy', 'Specimen', 'Initials', 'tag:misd.isi.edu,2015:display', '{"name" : "Submitted By"}'),
('Microscopy', 'Experiment', 'Initials', 'tag:misd.isi.edu,2015:display', '{"name" : "Submitted By"}'),
('Microscopy', 'Specimen', 'ID', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Specimen', 'Age', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Specimen', 'Genes', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Specimen', 'Disambiguator', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Experiment', 'ID', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Experiment', 'Probes', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Experiment', 'Disambiguator', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Slide', 'ID', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'slide_id', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'filename', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'HTTP URL', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'bytes', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'Thumbnail', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'Microscope', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'Camera', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'Objective', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'Exposure Time', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'Channels', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'Channel Name', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'Contrast Method', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'Magnification', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'Light Source Intensity', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'Image Size', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'Scaling (per pixel)', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'DZI', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'czi2dzi', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'File Date', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'Acquisition Date', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'id', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'checksum', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'accession_number', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'doi', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'ark', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'mime_type', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'description', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'resolution', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'uri', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'age', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'gene', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'last_modified', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Slide', 'Label', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
-- ('Microscopy', 'Slide', 'Seq.', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Specimen', 'Label', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Specimen', 'Number of Slides', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Specimen', 'Number of Scans', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Specimen', 'Specimen Identifier', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Experiment', 'Number of Slides', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Experiment', 'Number of Scans', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Slide', 'Number of Scans', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Specimen', 'age_rank', 'tag:isrd.isi.edu,2016:ignore', '["entry"]'),
('Microscopy', 'Scan', 'age_rank', 'tag:isrd.isi.edu,2016:ignore', '["entry"]')
;

INSERT INTO _ermrest.model_table_annotation (schema_name, table_name, annotation_uri, annotation_value) VALUES
('Microscopy', 'CIRM_Resources', 'tag:misd.isi.edu,2015:display', '{"name" : "CIRM Resources"}'),
('Microscopy', 'CIRM_Resources', 'tag:isrd.isi.edu,2016:recordlink', '{"mode": "tag:isrd.isi.edu,2016:recordlink/fragmentfilter", "resource": "search/"}'),
('Microscopy', 'CIRM_Resources', 'tag:isrd.isi.edu,2016:visible-columns', '{"compact" : ["Data Type", "Number Of Entries", "Last Updated"]}')
;

INSERT INTO _ermrest.model_keyref_annotation (from_column_names, to_column_names, from_table_name, from_schema_name, to_schema_name, to_table_name, annotation_uri, annotation_value) VALUES
('{"Specimen ID"}', '{"ID"}', 'specimen_gene', 'Microscopy', 'Microscopy', 'Specimen', 'tag:isrd.isi.edu,2016:foreign-key', '{"to_name" : "Specimens"}'),
('{"Gene ID"}', '{"term"}', 'specimen_gene', 'Microscopy', 'Microscopy', 'gene', 'tag:isrd.isi.edu,2016:foreign-key', '{"to_name" : "Genes"}'),
('{"Experiment ID"}', '{"ID"}', 'experiment_probe', 'Microscopy', 'Microscopy', 'Experiment', 'tag:isrd.isi.edu,2016:foreign-key', '{"to_name" : "Experiments"}'),
('{"Probe ID"}', '{"term"}', 'experiment_probe', 'Microscopy', 'Microscopy', 'probe', 'tag:isrd.isi.edu,2016:foreign-key', '{"to_name" : "Probes"}')
;

INSERT INTO _ermrest.model_pseudo_key (schema_name, table_name, column_names) VALUES
('Microscopy', 'CIRM_Resources', '{Table}')
;

INSERT INTO _ermrest.model_column_annotation (schema_name, table_name, column_name, annotation_uri, annotation_value) VALUES
('Microscopy', 'Specimen', 'ID', 'tag:misd.isi.edu,2015:display', '{"name" : "Specimen ID"}'),
('Microscopy', 'Slide', 'ID', 'tag:misd.isi.edu,2015:display', '{"name" : "Slide ID"}'),
('Microscopy', 'Experiment', 'ID', 'tag:misd.isi.edu,2015:display', '{"name" : "Experiment ID"}'),
('Microscopy', 'Scan', 'HTTP URL', 'tag:misd.isi.edu,2015:display', '{"name" : "Download Link"}'),
('Microscopy', 'CIRM_Resources', 'Data Type', 'tag:isrd.isi.edu,2016:column-display','{"compact":{"markdown_pattern":"[{{Data Type}}](/chaise/search/#1/{{#encode}}{{{Schema}}}{{/encode}}:{{#encode}}{{{Table}}}{{/encode}})"}}')
;

select _ermrest.model_change_event();

COMMIT;

