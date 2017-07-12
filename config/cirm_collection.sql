-- Defines collections for scans

BEGIN;

SET search_path = "Microscopy";

-- Collection

CREATE TABLE IF NOT EXISTS "Collection" (
    "ID" serial PRIMARY KEY,
    "Created By" jsonb DEFAULT _ermrest.current_client_obj(),
    "Created" timestamptz DEFAULT NOW(),
    "Description" public.markdown
);

INSERT INTO _ermrest.model_column_annotation (schema_name, table_name, column_name, annotation_uri) VALUES
('Microscopy', 'Collection', 'Created By', 'tag:isrd.isi.edu,2016:generated'),
('Microscopy', 'Collection', 'Created', 'tag:isrd.isi.edu,2016:generated')
ON CONFLICT DO NOTHING;

INSERT INTO _ermrest.model_column_annotation (schema_name, table_name, column_name, annotation_uri, annotation_value) VALUES
('Microscopy', 'Collection', 'Created By', 'tag:isrd.isi.edu,2016:column-display',
    '{
      "compact": { "markdown_pattern": "{{#_Created By}}{{{full_name}}} ({{{email}}}){{/_Created By}}" },
      "detailed": { "markdown_pattern": "{{#_Created By}}{{{full_name}}} ({{{email}}}){{/_Created By}}" }
    }'
)
ON CONFLICT (schema_name, table_name, column_name, annotation_uri) DO UPDATE SET annotation_value = EXCLUDED.annotation_value;

-- Scans association

CREATE TABLE IF NOT EXISTS collection_scan (
    collection integer NOT NULL REFERENCES "Collection" ("ID") ON UPDATE CASCADE,
    scan integer NOT NULL REFERENCES "Scan" ("id") ON UPDATE CASCADE,
    UNIQUE (collection, scan)
);

-- ...to/from names
INSERT INTO _ermrest.model_keyref_annotation (from_column_names, to_column_names, from_table_name, from_schema_name, to_schema_name, to_table_name, annotation_uri, annotation_value) VALUES
('{"collection"}', '{"ID"}', 'collection_scan', 'Microscopy', 'Microscopy', 'Collection', 'tag:isrd.isi.edu,2016:foreign-key', '{"to_name" : "Collections (member of)"}'),
('{"scan"}', '{"id"}', 'collection_scan', 'Microscopy', 'Microscopy', 'Scan', 'tag:isrd.isi.edu,2016:foreign-key', '{"to_name" : "Scans"}')
ON CONFLICT (from_column_names, to_column_names, from_table_name, from_schema_name, to_schema_name, to_table_name, annotation_uri)
DO UPDATE SET annotation_value = EXCLUDED.annotation_value;

-- ...add to visible columns
INSERT INTO _ermrest.model_table_annotation (schema_name, table_name, annotation_uri, annotation_value) VALUES
('Microscopy', 'Scan', 'tag:isrd.isi.edu,2016:visible-foreign-keys', 
'{
  "detailed": [
    ["Microscopy", "scan_comments_Scan id_fkey"],
    ["Microscopy", "collection_scan_scan_fkey"]
]}'
)
ON CONFLICT (schema_name, table_name, annotation_uri) DO UPDATE SET annotation_value = EXCLUDED.annotation_value;

SELECT _ermrest.model_change_event();

COMMIT;
