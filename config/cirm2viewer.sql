--
-- Script to convert tables from the CIRM format into the RBK format
-- After running this script, run also "ermrest-deploy" as new tables are created by the script
---

BEGIN;

SET search_path = "Microscopy";

--
-- Extract encoded metadata from Specimen and Experiment IDs
--
-- UPDATE "Specimen" T1 SET "Species" = (SELECT "Species"."ID" FROM "Specimen" T2, "Species" WHERE T1."ID" = T2."ID" AND "Species"."Code" = lower(substring(T2."ID" FROM 10 FOR 1))) WHERE "Species" IS NULL;

--
-- Remove Scan Columns
--
ALTER TABLE "Scan" DROP COLUMN "GO Endpoint";
ALTER TABLE "Scan" DROP COLUMN "GO Path";
ALTER TABLE "Scan" DROP COLUMN "Zoomify";
ALTER TABLE "Scan" DROP COLUMN "Tags";

--
-- New generic thumbnail
--
UPDATE "Scan" SET "Thumbnail" = replace("Thumbnail", 'generic_genetic.png', 'generic_mixed.png');

CREATE FUNCTION urlencode(text) RETURNS text
    LANGUAGE plpgsql
    AS $$
    DECLARE
    	ret text;
    BEGIN
		ret := (SELECT string_agg(
			CASE
				WHEN ch ~ '[:/?#\[\]@!$&\(\)*+,;= ]+' OR ch = E'\'' -- comment to close the ' 
				THEN regexp_replace(upper(substring(ch::bytea::text, 3)), '(..)', E'%\\1', 'g')
				ELSE ch
			END, '')
				FROM (SELECT ch FROM regexp_split_to_table($1, '') AS ch) AS s);
		RETURN ret;
	END;
$$;

--
-- Refer cirm-www for cirm-dev
-- Those 3 updates will be run only on cirm-dev
-- Comment them if you run the script on cirm-staging or cirm-www
--
UPDATE "Scan" SET "HTTP URL" = 'https://cirm.isrd.isi.edu/hatrac/Microscopy/' || urlencode("Slide ID") || '/' || urlencode("Filename");
UPDATE "Scan" SET "Thumbnail" = 'https://cirm.isrd.isi.edu/thumbnails/' || urlencode("Slide ID") || '/' || "ID" || '.jpg' WHERE "Thumbnail" like '%.jpg';
UPDATE "Scan" SET "DZI" = 'https://cirm.isrd.isi.edu' || "DZI";

--
-- Create a table for the submitters names
-- For now, the name name is the same with the initial
--

--
-- Remove Duplicates
--
UPDATE "Experiment" SET "Initials" = 'GA' WHERE "Initials" = 'ga';
UPDATE "Specimen" SET "Initials" = 'GA' WHERE "Initials" = 'ga';
UPDATE "Experiment" SET "Initials" = 'JAM' WHERE "Initials" = 'Jam';
UPDATE "Specimen" SET "Initials" = 'JAM' WHERE "Initials" = 'Jam';
UPDATE "Experiment" SET "Initials" = 'ER' WHERE "Initials" = 'EAR';
UPDATE "Specimen" SET "Initials" = 'ER' WHERE "Initials" = 'EAR';
UPDATE "Experiment" SET "Initials" = 'CL' WHERE "Initials" = 'CDL';
UPDATE "Specimen" SET "Initials" = 'CL' WHERE "Initials" = 'CDL';
UPDATE "Experiment" SET "Initials" = 'JL' WHERE "Initials" = 'JL.';
UPDATE "Specimen" SET "Initials" = 'JL' WHERE "Initials" = 'JL.';
UPDATE "Experiment" SET "Initials" = 'SK' WHERE "Initials" = 'sk' or "Initials" ='SKP';
UPDATE "Specimen" SET "Initials" = 'SK' WHERE "Initials" = 'sk' or "Initials" ='SKP';
UPDATE "Experiment" SET "Initials" = 'PW' WHERE "Initials" = 'PHW' ;
UPDATE "Specimen" SET "Initials" = 'PW' WHERE "Initials" = 'PHW' ;
UPDATE "Experiment" SET "Initials" = 'XH' WHERE "Initials" = 'Xh' or "Initials" ='Xhe';
UPDATE "Specimen" SET "Initials" = 'XH' WHERE "Initials" = 'Xh' or "Initials" ='Xhe';
UPDATE "Experiment" SET "Initials" = 'KC' WHERE "Initials" = 'KLC';
UPDATE "Specimen" SET "Initials" = 'KC' WHERE "Initials" = 'KLC';
UPDATE "Experiment" SET "Initials" = 'JL' WHERE "Initials" = 'TL';
UPDATE "Specimen" SET "Initials" = 'JL' WHERE "Initials" = 'TL';


CREATE TEMPORARY TABLE "Initials"(id text);
INSERT INTO "Initials" SELECT DISTINCT "Initials" FROM "Specimen";
INSERT INTO "Initials" SELECT DISTINCT "Initials" FROM "Experiment" WHERE "Initials" NOT IN (SELECT DISTINCT "Initials" FROM "Specimen"); 
DELETE FROM "Initials" WHERE id IN ('ga', 'Jam', 'JL.', 'Xh', 'Xhe', 'sk', 'SKP', 'EAR', 'CDL', 'PHW', 'KLC', 'TL');

CREATE TABLE "User" (
    "Initials" text PRIMARY KEY,
    "Full Name" text UNIQUE
);
ALTER TABLE "User" OWNER TO ermrestddl;

INSERT INTO "User" ("Initials", "Full Name") VALUES
('AC','Aldo Castillo'),
('AK','Albert Kim'),
('CL','Can Lui'),
('ER','Elisabeth Rutledge'),
('GA','Greg Alvarado'),
('HH','Hironori Hojo'),
('JAM','Jill McMahon'),
('JJG','Jinjin Guo'),
('KC','Kristen Chen'),
('JL','Jing Liu'),
('LL','Lick Lai'),
('LLO','Lori O’Brian'),
('MD','Mark Dessing'),
('MK','Mia Krautzberger'),
('OM','Odysse Michos'),
('PW','Peter Whitney'),
('QG','Qiuyu Guo'),
('RES','Robert Schuler'),
('RKP','Riana Parvez'),
('RS','Rosa Sierra'),
('SK','Sanjeev Kumar'),
('SR','Seth Ruffins'),
('SV','Serban Voinea'),
('TT','Tracy Tran'),
('VHA','Victoria Hora -Acosta'),
('XH','Xinjun He')
;

INSERT INTO "User"("Initials") SELECT DISTINCT id FROM "Initials" WHERE id NOT in (SELECT "Initials" FROM "User");
UPDATE "User" SET "Full Name" ="Initials" WHERE "Full Name" IS NULL;

DROP TABLE "Initials";

--
-- Add Specimen.Initials a FK to User.Initials
--
ALTER TABLE "Specimen" ALTER COLUMN "Initials" TYPE text;
UPDATE "Specimen" T1 SET "Initials" = (SELECT "Full Name" FROM "User", "Specimen" T2 WHERE T1."ID" = T2."ID" AND T2."Initials" = "User"."Initials");
ALTER TABLE "Specimen" ADD CONSTRAINT "Specimen_Initials_fkey" FOREIGN KEY ("Initials") REFERENCES "User" ("Full Name");

--
-- Drop columns FROM Specimen
--
ALTER TABLE "Specimen" DROP COLUMN "Tags";
ALTER TABLE "Specimen" DROP COLUMN "Sample Name";
ALTER TABLE "Specimen" ADD COLUMN "Genes" text[];

UPDATE "Specimen" SET "Genes" = regexp_split_to_array("Specimen"."Gene",';');
UPDATE "Specimen" SET "Gene" = split_part("Gene", ';', 1);

/*
CREATE TABLE age_stage (
	"ID" text PRIMARY KEY,
	"Code" text NOT NULL
);
ALTER TABLE age_stage OWNER TO ermrestddl;

INSERT INTO age_stage("ID", "Code") SELECT DISTINCT "Age" "ID", "Age" "Code" FROM "Specimen" WHERE "Age" IS NOT NULL;
UPDATE age_stage T SET "Code" = substring("ID" FROM 1 for (position(' ' IN "ID")-1)) || (SELECT "Age"."Code" FROM "Age",age_stage T1 WHERE "Age"."ID" = substring(T1."ID" FROM (position(' ' IN T1."ID") + 1)) AND T."ID" = T1."ID");
ALTER TABLE "Specimen" ADD CONSTRAINT "Specimen_age_stage_fkey" FOREIGN KEY ("Age") REFERENCES age_stage ("ID");
*/

--
-- Convert CIRM vocabulary tables to the RBK format
--
CREATE TABLE experiment_type (
    id serial NOT NULL PRIMARY KEY,
    superclass_id text REFERENCES experiment_type(code),
    code text UNIQUE,
    term text UNIQUE,
    description text,
    uri text,
    valid_start_date date,
    valid_end_date date,
    invalid_reason text
);

ALTER TABLE experiment_type OWNER TO ermrestddl;

INSERT INTO experiment_type(code, term) SELECT "Code" code, "ID" term FROM "Experiment Type";
INSERT INTO experiment_type(code, term) VALUES ('Other', 'Other');

CREATE TABLE probe (
    id serial NOT NULL PRIMARY KEY,
    superclass_id text REFERENCES probe(term),
    code text,
    term text UNIQUE,
    description text,
    uri text,
    valid_start_date date,
    valid_end_date date,
    invalid_reason text
);

ALTER TABLE probe OWNER TO ermrestddl;

INSERT INTO probe(code, term) SELECT "Code" code, "ID" term FROM "Probe";
INSERT INTO probe(code, term) VALUES ('Other', 'Other');

CREATE TABLE species (
    id serial NOT NULL PRIMARY KEY,
    superclass_id text REFERENCES species(code),
    code text UNIQUE,
    term text UNIQUE,
    description text,
    uri text,
    valid_start_date date,
    valid_end_date date,
    invalid_reason text
);

ALTER TABLE species OWNER TO ermrestddl;

INSERT INTO species(code, term) SELECT "Code" code, "ID" term FROM "Species";

CREATE TABLE tissue (
    id serial NOT NULL PRIMARY KEY,
    superclass_id text REFERENCES tissue(code),
    code text UNIQUE,
    term text UNIQUE,
    description text,
    uri text,
    valid_start_date date,
    valid_end_date date,
    invalid_reason text
);

ALTER TABLE tissue OWNER TO ermrestddl;

INSERT INTO tissue(code, term) SELECT "Code" code, "ID" term FROM "Tissue";

CREATE TABLE gene (
    id serial NOT NULL PRIMARY KEY,
    superclass_id text REFERENCES gene(code),
    code text UNIQUE,
    term text UNIQUE,
    description text,
    uri text,
    valid_start_date date,
    valid_end_date date,
    invalid_reason text
);

ALTER TABLE gene OWNER TO ermrestddl;

INSERT INTO gene(code, term) SELECT "Code" code, "ID" term FROM "Gene";

CREATE TABLE age (
    id serial NOT NULL PRIMARY KEY,
    superclass_id text REFERENCES age(code),
    code text UNIQUE,
    term text UNIQUE,
    description text,
    uri text,
    valid_start_date date,
    valid_end_date date,
    invalid_reason text
);

ALTER TABLE age OWNER TO ermrestddl;

INSERT INTO age(code, term) SELECT "Code" code, "ID" term FROM "Age";

CREATE TABLE specimen_gene (
	"Specimen ID" text REFERENCES "Specimen" ("ID") ON DELETE CASCADE,
	"Gene ID" text REFERENCES gene (term),
	PRIMARY KEY ("Specimen ID","Gene ID")
);
ALTER TABLE specimen_gene OWNER TO ermrestddl;

INSERT INTO specimen_gene("Specimen ID", "Gene ID") SELECT "Specimen"."ID" "Specimen ID", regexp_split_to_table("Specimen"."Gene",';') "Gene ID" FROM "Specimen";

CREATE TABLE experiment_probe (
	"Experiment ID" text REFERENCES "Experiment" ("ID") ON DELETE CASCADE,
	"Probe ID" text REFERENCES probe (term),
	PRIMARY KEY ("Experiment ID","Probe ID")
);
ALTER TABLE experiment_probe OWNER TO ermrestddl;

INSERT INTO experiment_probe("Experiment ID", "Probe ID") SELECT "Experiment"."ID" "Experiment ID", regexp_split_to_table("Experiment"."Probe",';') "Probe ID" FROM "Experiment";

--
-- Updated references to the new vocabulary tables
-- Drop unused columns
--
ALTER TABLE "Specimen" DROP CONSTRAINT "Specimen_Species_fkey";
ALTER TABLE "Specimen" DROP CONSTRAINT "Specimen_Tissue_fkey";

ALTER TABLE "Specimen" ADD CONSTRAINT "Specimen_Species_fkey" FOREIGN KEY ("Species") REFERENCES species (term);
ALTER TABLE "Specimen" ADD CONSTRAINT "Specimen_Tissue_fkey" FOREIGN KEY ("Tissue") REFERENCES tissue (term);
ALTER TABLE "Specimen" ADD CONSTRAINT "Specimen_Gene_fkey" FOREIGN KEY ("Gene") REFERENCES gene (term);

ALTER TABLE "Specimen" ADD COLUMN "Age Unit" text REFERENCES age (term);
ALTER TABLE "Specimen" ADD COLUMN "Age Value" text ;
UPDATE "Specimen" SET "Age" = ' adult' WHERE "Age" = '0 adult';
UPDATE "Specimen" SET "Age" = ' Post natal day' WHERE "Age" = '0 Post natal day';
UPDATE "Specimen" SET "Age Value" = substring("Age" FROM 1 for (position(' ' IN "Age")-1)), "Age Unit" = substring("Age" FROM (position(' ' IN "Age") + 1)) WHERE "Age" IS NOT NULL;

ALTER TABLE "Experiment" DROP COLUMN "Experiment Description";
ALTER TABLE "Experiment" DROP COLUMN "Tags";
ALTER TABLE "Experiment" DROP CONSTRAINT "Experiment_Experiment Type_fkey";
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_Experiment Type_fkey" FOREIGN KEY ("Experiment Type") REFERENCES experiment_type (term);

ALTER TABLE "Slide" DROP COLUMN "Rev.";
ALTER TABLE "Slide" DROP COLUMN "Tags";

--
-- Build the Scan ID
--
ALTER TABLE "Scan" DROP CONSTRAINT "Scan_pkey";
ALTER TABLE "Scan" ADD COLUMN id serial NOT NULL PRIMARY KEY;
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_pkey_unique_id" UNIQUE("ID");
ALTER TABLE "Scan" ADD COLUMN species text;
ALTER TABLE "Scan" ADD COLUMN age text;
ALTER TABLE "Scan" ADD COLUMN gene text;
ALTER TABLE "Scan" ADD COLUMN checksum text;
UPDATE "Scan" SET checksum = "ID";

CREATE FUNCTION update_scan_ID() RETURNS void
    LANGUAGE plpgsql
    AS $$
    DECLARE
        row "Scan"%rowtype;
        slide jsonb = '{}'::jsonb;
		disambiguator integer;
    BEGIN
		FOR row IN SELECT * FROM "Scan"
		LOOP
			IF slide->row."Slide ID" IS NULL THEN
				disambiguator := 0;
			ELSE
				disambiguator := slide->row."Slide ID";
				slide := slide - row."Slide ID";
			END IF;
			disambiguator := disambiguator + 1;
			slide := slide || ('{"' || row."Slide ID" || '": ' || disambiguator || '}')::jsonb;
			UPDATE "Scan" SET "ID" = row."Slide ID" || '-' || disambiguator WHERE id = row.id;
			row."ID" := row."Slide ID" || '-' || disambiguator;
		END LOOP;
        RETURN;
    END;
$$;

SELECT update_scan_ID();

DROP FUNCTION update_scan_ID();

--
-- Add the rest of the RBK vocabulary tables
--
CREATE TABLE age_stage (
    id serial NOT NULL PRIMARY KEY,
    superclass_id text REFERENCES age(code),
    code text UNIQUE,
    term text UNIQUE,
    description text,
    uri text,
    valid_start_date date,
    valid_end_date date,
    invalid_reason text,
    weeks numeric
);


ALTER TABLE age_stage OWNER TO ermrestddl;
INSERT INTO age_stage(code, term) VALUES ('--', '--');

CREATE TABLE anatomy (
    id serial NOT NULL PRIMARY KEY,
    superclass_id text REFERENCES anatomy(code),
    code text UNIQUE,
    term text UNIQUE,
    description text,
    uri text,
    valid_start_date date,
    valid_end_date date,
    invalid_reason text
);


ALTER TABLE anatomy OWNER TO ermrestddl;

INSERT INTO anatomy(code,term) VALUES
('Kidney', 'Kidney'),
('Bone', 'Bone'),
('Neural Tube', 'Neural Tube'),
('Other', 'Other'),
('Lung', 'Lung');

CREATE TABLE annotation_type (
    id serial NOT NULL PRIMARY KEY,
    superclass_id text REFERENCES annotation_type(code),
    code text UNIQUE,
    term text UNIQUE,
    description text,
    uri text,
    valid_start_date date,
    valid_end_date date,
    invalid_reason text
);


ALTER TABLE annotation_type OWNER TO ermrestddl;

INSERT INTO annotation_type(term) VALUES
('rectangle'), 
('arrow'), 
('section');

CREATE TABLE annotation (
    id serial NOT NULL PRIMARY KEY,
    image_id integer REFERENCES "Scan"(id),
    author jsonb,
    created date DEFAULT now(),
    anatomy text REFERENCES anatomy(term),
    context_uri text,
    coords jsonb,
    description text,
    config jsonb,
    type text DEFAULT 'rectangle'::text NOT NULL REFERENCES annotation_type(term),
    last_modified date DEFAULT now() NOT NULL
);


ALTER TABLE annotation OWNER TO ermrestddl;

CREATE TABLE annotation_comment (
    id serial NOT NULL PRIMARY KEY,
    annotation_id integer REFERENCES annotation(id),
    author jsonb,
    created date DEFAULT now(),
    comment text,
    last_modified date DEFAULT now() NOT NULL
);


ALTER TABLE annotation_comment OWNER TO ermrestddl;

CREATE TABLE embedding_medium (
    id serial NOT NULL PRIMARY KEY,
    superclass_id text REFERENCES embedding_medium(code),
    code text UNIQUE,
    term text UNIQUE,
    description text,
    uri text,
    valid_start_date date,
    valid_end_date date,
    invalid_reason text
);


ALTER TABLE embedding_medium OWNER TO ermrestddl;
INSERT INTO embedding_medium(code, term) VALUES ('--', '--');

CREATE TABLE gender (
    id serial NOT NULL PRIMARY KEY,
    superclass_id text REFERENCES gender(code),
    code text UNIQUE,
    term text UNIQUE,
    description text,
    uri text,
    valid_start_date date,
    valid_end_date date,
    invalid_reason text
);


ALTER TABLE gender OWNER TO ermrestddl;
INSERT INTO gender(code, term) VALUES('Unknown', 'Unknown');

CREATE TABLE image_grade_code (
    code text NOT NULL PRIMARY KEY
);


ALTER TABLE image_grade_code OWNER TO ermrestddl;
INSERT INTO image_grade_code(code) VALUES('--');

CREATE TABLE specimen_fixation (
    id serial NOT NULL PRIMARY KEY,
    superclass_id text REFERENCES specimen_fixation(code),
    code text UNIQUE,
    term text UNIQUE,
    description text,
    uri text,
    valid_start_date date,
    valid_end_date date,
    invalid_reason text
);


ALTER TABLE specimen_fixation OWNER TO ermrestddl;
INSERT INTO specimen_fixation(code, term) VALUES('--', '--');

CREATE TABLE staining_protocol (
    id serial NOT NULL PRIMARY KEY,
    superclass_id text REFERENCES staining_protocol(code),
    code text UNIQUE,
    term text UNIQUE,
    description text,
    uri text,
    valid_start_date date,
    valid_end_date date,
    invalid_reason text
);

ALTER TABLE staining_protocol OWNER TO ermrestddl;
INSERT INTO staining_protocol(code, term) VALUES('--', '--');

--
-- Updated references from the Scan table
-- Add RBK columns to the Scan table
--

ALTER TABLE "Scan" ADD COLUMN probe text;
ALTER TABLE "Scan" ADD COLUMN accession_number text;
ALTER TABLE "Scan" ADD COLUMN doi text;
ALTER TABLE "Scan" ADD COLUMN ark text;
ALTER TABLE "Scan" ADD COLUMN mime_type text;
ALTER TABLE "Scan" ADD COLUMN description text;
ALTER TABLE "Scan" ADD COLUMN submitter text DEFAULT 'anonymous'::text;
ALTER TABLE "Scan" ADD COLUMN submitted date;
ALTER TABLE "Scan" ADD COLUMN public_release_date date;
ALTER TABLE "Scan" ADD COLUMN tissue text REFERENCES tissue(term);
ALTER TABLE "Scan" ADD COLUMN gender text REFERENCES gender(term);
ALTER TABLE "Scan" ADD COLUMN age_stage text REFERENCES age_stage(term);
ALTER TABLE "Scan" ADD COLUMN specimen_fixation text REFERENCES specimen_fixation(term);
ALTER TABLE "Scan" ADD COLUMN embedding_medium text REFERENCES embedding_medium(term);
ALTER TABLE "Scan" ADD COLUMN staining_protocol text REFERENCES staining_protocol(term);
ALTER TABLE "Scan" ADD COLUMN resolution text;
ALTER TABLE "Scan" ADD COLUMN uri text;
ALTER TABLE "Scan" ADD COLUMN status text REFERENCES image_grade_code(code);
ALTER TABLE "Scan" ADD COLUMN last_modified date DEFAULT now() NOT NULL;
ALTER TABLE "Scan" ADD COLUMN age_rank numeric;
ALTER TABLE "Specimen" ADD COLUMN age_rank numeric;
ALTER TABLE "Scan" ADD COLUMN "Disambiguator" int8;
--
-- Populate the new columns of the Scan table
--

UPDATE "Scan" SET gender = 'Unknown';
UPDATE "Scan" SET resolution = "Scaling (per pixel)";
UPDATE "Scan" T1 SET  submitter = (SELECT "Full Name" FROM "User", "Scan" T2, "Slide", "Experiment" WHERE T1.id = T2.id AND T1."Slide ID" = "Slide"."ID" AND "Experiment"."ID" = "Slide"."Experiment ID" AND "Experiment"."Initials" = "User"."Initials") ;
UPDATE "Scan" T1 SET  description = (SELECT "Specimen Identifier" FROM "Specimen", "Scan" T2, "Slide" WHERE T1.id = T2.id AND T1."Slide ID" = "Slide"."ID" AND "Specimen"."ID" = "Slide"."Specimen ID");
UPDATE "Scan" T1 SET  submitted = (SELECT "Experiment Date" FROM "Experiment", "Scan" T2, "Slide" WHERE T1.id = T2.id AND T1."Slide ID" = "Slide"."ID" AND "Experiment"."ID" = "Slide"."Experiment ID");
UPDATE "Scan" T1 SET tissue  = (SELECT "Tissue" FROM "Specimen", "Scan" T2, "Slide" WHERE T1.id = T2.id AND T1."Slide ID" = "Slide"."ID" AND "Specimen"."ID" = "Slide"."Specimen ID");
UPDATE "Scan" T1 SET species  = (SELECT "Species" FROM "Specimen", "Scan" T2, "Slide" WHERE T1.id = T2.id AND T1."Slide ID" = "Slide"."ID" AND "Specimen"."ID" = "Slide"."Specimen ID");
UPDATE "Scan" T1 SET gene  = (SELECT "Gene" FROM "Specimen", "Scan" T2, "Slide" WHERE T1.id = T2.id AND T1."Slide ID" = "Slide"."ID" AND "Specimen"."ID" = "Slide"."Specimen ID");
UPDATE "Scan" T1 SET age  = (SELECT "Age Value" || ' ' || "Age Unit" FROM "Specimen", "Scan" T2, "Slide" WHERE T1.id = T2.id AND T1."Slide ID" = "Slide"."ID" AND "Specimen"."ID" = "Slide"."Specimen ID");
UPDATE "Scan" SET description = "ID";
UPDATE "Scan" SET uri = "DZI";
UPDATE "Scan" SET accession_number = "ID";

--
-- Rename columns of the Scan table to the RBK names
--

ALTER TABLE "Scan" RENAME COLUMN "Slide ID" TO slide_id;
ALTER TABLE "Scan" RENAME COLUMN "Original Filename" TO filename;
ALTER TABLE "Scan" RENAME COLUMN "File Size" TO bytes;
ALTER TABLE "Scan" DROP COLUMN "Filename";

UPDATE "Scan" SET filename = split_part(filename, 'slideid=', 2) WHERE filename LIKE '%slideid=%';

--
-- Update the required fields from Specimen and Experiment based on a guessing from the ID value
--
CREATE FUNCTION update_metadata() RETURNS void
    LANGUAGE plpgsql
    AS $$
    DECLARE
        row_specimen "Specimen"%rowtype;
        row_experiment "Experiment"%rowtype;
        row_scan "Scan"%rowtype;
        row_experiment_type "experiment_type"%rowtype;
        row_probe "probe"%rowtype;
        row_species "probe"%rowtype;
        row_tissue "tissue"%rowtype;
        row_age_unit "age"%rowtype;
        row_gene "gene"%rowtype;
        age_offset integer;
        val numeric;
        disambiguator integer;
        slide text;
    BEGIN
		FOR row_experiment IN SELECT * FROM "Experiment" WHERE "Experiment Type" IS NULL
		LOOP
			FOR row_experiment_type IN SELECT * FROM "experiment_type"
			LOOP
				IF upper(row_experiment."ID") LIKE ('%' || row_experiment_type.code || '%') THEN
					UPDATE "Experiment" SET "Experiment Type" = row_experiment_type.term WHERE "Experiment"."ID" = row_experiment."ID";
					EXIT;
				END IF;
			END LOOP;
			IF (SELECT "Experiment Type" FROM "Experiment" WHERE "Experiment"."ID" = row_experiment."ID") IS NULL THEN
				UPDATE "Experiment" SET "Experiment Type" = 'Other' WHERE "Experiment"."ID" = row_experiment."ID";
			END IF;
		END LOOP;

		FOR row_experiment IN SELECT * FROM "Experiment" WHERE "Probe" IS NULL
		LOOP
			FOR row_probe IN SELECT * FROM "probe"
			LOOP
				IF upper(row_experiment."ID") LIKE ('%' || row_probe.code || '%') THEN
					UPDATE "Experiment" SET "Probe" = row_probe.term WHERE "Experiment"."ID" = row_experiment."ID";
					INSERT INTO experiment_probe("Experiment ID", "Probe ID") VALUES(row_experiment."ID", row_probe.term);
					EXIT;
				END IF;
			END LOOP;
			IF (SELECT "Probe" FROM "Experiment" WHERE "Experiment"."ID" = row_experiment."ID") IS NULL THEN
				UPDATE "Experiment" SET "Probe" = 'Other' WHERE "Experiment"."ID" = row_experiment."ID";
				INSERT INTO experiment_probe("Experiment ID", "Probe ID") VALUES(row_experiment."ID", 'Other');
			END IF;
		END LOOP;
		
		FOR row_specimen IN SELECT * FROM "Specimen" WHERE "Species" IS NULL
		LOOP
			FOR row_species IN SELECT * FROM "species"
			LOOP
				-- Test the first character from the ID following the date
				IF lower(substring(split_part(row_specimen."ID", '-', 2) FROM 1 FOR 1)) = row_species.code THEN
					UPDATE "Specimen" SET "Species" = row_species.term WHERE "Specimen"."ID" = row_specimen."ID";
					EXIT;
				END IF;
			END LOOP;
			IF (SELECT "Species" FROM "Specimen" WHERE "Specimen"."ID" = row_specimen."ID") IS NULL THEN
				UPDATE "Specimen" SET "Species" = 'Other' WHERE "Specimen"."ID" = row_specimen."ID";
			END IF;
		END LOOP;
		
		FOR row_specimen IN SELECT * FROM "Specimen" WHERE "Tissue" IS NULL
		LOOP
			FOR row_tissue IN SELECT * FROM "tissue"
			LOOP
				IF upper(row_specimen."ID") LIKE ('%' || row_tissue.code || '%') THEN
					UPDATE "Specimen" SET "Tissue" = row_tissue.term WHERE "Specimen"."ID" = row_specimen."ID";
					EXIT;
				END IF;
			END LOOP;
			IF (SELECT "Tissue" FROM "Specimen" WHERE "Specimen"."ID" = row_specimen."ID") IS NULL THEN
				UPDATE "Specimen" SET "Tissue" = 'Other' WHERE "Specimen"."ID" = row_specimen."ID";
			END IF;
		END LOOP;
		
		FOR row_specimen IN SELECT * FROM "Specimen" WHERE "Age Unit" IS NULL
		LOOP
			FOR row_age_unit IN SELECT * FROM "age"
			LOOP
				IF upper(row_specimen."ID") LIKE ('%' || row_age_unit.code || '%') THEN
					UPDATE "Specimen" SET "Age Unit" = row_age_unit.term WHERE "Specimen"."ID" = row_specimen."ID";
					UPDATE "Specimen" SET "Age" = (' ' || row_age_unit.term) WHERE "Specimen"."ID" = row_specimen."ID";
					EXIT;
				END IF;
			END LOOP;
			IF (SELECT "Age Unit" FROM "Specimen" WHERE "Specimen"."ID" = row_specimen."ID") IS NULL THEN
				UPDATE "Specimen" SET "Age Unit" = 'adult' WHERE "Specimen"."ID" = row_specimen."ID";
				UPDATE "Specimen" SET "Age" = 'adult' WHERE "Specimen"."ID" = row_specimen."ID";
			END IF;
		END LOOP;
		
		FOR row_specimen IN SELECT * FROM "Specimen" WHERE "Gene" IS NULL
		LOOP
			FOR row_gene IN SELECT * FROM "gene"
			LOOP
				IF upper(row_specimen."ID") LIKE ('%' || upper(row_gene.code) || '%') THEN
					UPDATE "Specimen" SET "Gene" = row_gene.term WHERE "Specimen"."ID" = row_specimen."ID";
					UPDATE "Specimen" SET "Genes" = regexp_split_to_array(row_gene.term, ';') WHERE "Specimen"."ID" = row_specimen."ID";
					INSERT INTO specimen_gene("Specimen ID", "Gene ID") VALUES(row_specimen."ID", row_gene.term);
					EXIT;
				END IF;
			END LOOP;
			IF (SELECT "Gene" FROM "Specimen" WHERE "Specimen"."ID" = row_specimen."ID") IS NULL THEN
				UPDATE "Specimen" SET "Gene" = 'Wild Type' WHERE "Specimen"."ID" = row_specimen."ID";
				UPDATE "Specimen" SET "Genes" = regexp_split_to_array('Wild Type', ';') WHERE "Specimen"."ID" = row_specimen."ID";
				INSERT INTO specimen_gene("Specimen ID", "Gene ID") VALUES(row_specimen."ID", 'Wild Type');
			END IF;
		END LOOP;
		
		FOR row_specimen IN SELECT * FROM "Specimen" WHERE "Specimen Identifier" IS NULL
		LOOP
			UPDATE "Specimen" SET "Specimen Identifier" = '' WHERE "Specimen"."ID" = row_specimen."ID";
		END LOOP;
		
		FOR row_specimen IN SELECT * FROM "Specimen"
		LOOP
			IF row_specimen."Age Unit" = 'embryonic day' THEN
				age_offset := 0;
			ELSIF row_specimen."Age Unit" = 'Post natal day' THEN
				age_offset := 1000;
			ELSIF row_specimen."Age Unit" = 'hours' THEN
				age_offset := 2000;
			ELSIF row_specimen."Age Unit" = 'days' THEN
				age_offset := 3000;
			ELSIF row_specimen."Age Unit" = 'weeks' THEN
				age_offset := 4000;
			ELSIF row_specimen."Age Unit" = 'months' THEN
				age_offset := 5000;
			ELSIF row_specimen."Age Unit" = 'adult' THEN
				age_offset := 6000;
			ELSE 
				age_offset := 0;
			END IF;
				
			IF row_specimen."Age Value" = '12wk' THEN
				val := age_offset + 12;
			ELSIF row_specimen."Age Value" = '15.5.5' THEN
				val := age_offset + 15.5;
			ELSIF row_specimen."Age Value" = '1yr' THEN
				val := age_offset + 200 + 1;
			ELSIF row_specimen."Age Value" = '15,5' THEN
				val := age_offset + 15.5;
			ELSIF row_specimen."Age Value" = '2m' THEN
				val := age_offset + 100 + 2;
			ELSIF row_specimen."Age Value" = '6w' THEN
				val := age_offset + 6;
			ELSIF row_specimen."Age Value" = 'P2' THEN
				val := age_offset;
			ELSIF row_specimen."Age Value" = '' OR row_specimen."Age Value" IS NULL THEN
				val := age_offset;
			ELSE
				IF row_specimen."Age Unit" = 'adult' THEN
					age_offset := age_offset + 200;
				END IF;
				val := age_offset + to_number(row_specimen."Age Value", '99999.99');
			END IF;
				
			UPDATE "Specimen" SET age_rank = val where "ID" = row_specimen."ID";
		END LOOP;
		
		FOR row_scan IN SELECT * FROM "Scan"
		LOOP
			UPDATE "Scan" T1 SET age_rank  = (SELECT "Specimen".age_rank FROM "Specimen", "Slide", "Scan" T2 WHERE T1."ID" = T2."ID" AND T2."ID" = row_scan."ID" AND row_scan."slide_id" = "Slide"."ID" AND "Specimen"."ID" = "Slide"."Specimen ID") WHERE T1."ID" = row_scan."ID";
		END LOOP;
		
		FOR slide IN SELECT DISTINCT slide_id FROM "Scan"
		LOOP
			disambiguator := 0;
			FOR row_scan IN SELECT * FROM "Scan" WHERE slide_id = slide
			LOOP
				disambiguator := disambiguator + 1;
				UPDATE "Scan" SET "Disambiguator" = disambiguator WHERE "ID" = row_scan."ID";
			END LOOP;
		END LOOP;
		
		RETURN;
    END;
$$;

SELECT update_metadata();

DROP FUNCTION update_metadata();

-- UPDATE "Scan" T1 SET age_rank  = (SELECT "Specimen".age_rank FROM "Specimen", "Scan" T2, "Slide" WHERE T1.id = T2.id AND T1."slide_id" = "Slide"."ID" AND "Specimen"."ID" = "Slide"."Specimen ID");

ALTER TABLE "Scan" DROP COLUMN "ID";

--
-- Add the number of slides and scans for the Specimen, Experiment and Slide
--
ALTER TABLE "Experiment" ADD COLUMN "Number of Slides" int8;
ALTER TABLE "Experiment" ADD COLUMN "Number of Scans" int8;
ALTER TABLE "Specimen" ADD COLUMN "Number of Slides" int8;
ALTER TABLE "Specimen" ADD COLUMN "Number of Scans" int8;
ALTER TABLE "Slide" ADD COLUMN "Number of Scans" int8;

CREATE TABLE "Slides" AS SELECT * FROM "Slide" WHERE "ID" IN (SELECT DISTINCT slide_id FROM "Scan");

CREATE FUNCTION update_number_of_scan_slide() RETURNS void
    LANGUAGE plpgsql
    AS $$
    DECLARE
        row_slide "Slides"%rowtype;
        row_specimen "Specimen"%rowtype;
        row_experiment "Experiment"%rowtype;
        counter integer;
    BEGIN
		-- raise notice 'start slide';
		FOR row_slide IN SELECT * FROM "Slides"
		LOOP
			counter := (SELECT count(*) FROM "Scan" WHERE "slide_id" = row_slide."ID");
			-- raise notice 'counter: %', counter;
			UPDATE "Slide" SET "Number of Scans" = counter WHERE "Slide"."ID" = row_slide."ID";
			UPDATE "Slides" SET "Number of Scans" = counter WHERE "Slides"."ID" = row_slide."ID";
		END LOOP;
		UPDATE "Slide" SET "Number of Scans" = NULL WHERE "Number of Scans" = 0;
		UPDATE "Slides" SET "Number of Scans" = NULL WHERE "Number of Scans" = 0;
		
		FOR row_specimen IN SELECT * FROM "Specimen"
		LOOP
			counter := (SELECT count(*) FROM "Slides" WHERE "Specimen ID" = row_specimen."ID");
			UPDATE "Specimen" SET "Number of Slides" = counter WHERE "Specimen"."ID" = row_specimen."ID";
		END LOOP;
		
		FOR row_specimen IN SELECT * FROM "Specimen"
		LOOP
			counter := (SELECT sum("Number of Scans") FROM "Slides" WHERE "ID" IN (SELECT "Slides"."ID" FROM "Slides", "Specimen" WHERE "Slides"."Specimen ID" = row_specimen."ID"));
			UPDATE "Specimen" SET "Number of Scans" = counter WHERE "Specimen"."ID" = row_specimen."ID";
		END LOOP;
		
		UPDATE "Specimen" SET "Number of Scans" = NULL WHERE "Number of Scans" = 0;
		UPDATE "Specimen" SET "Number of Slides" = NULL WHERE "Number of Slides" = 0;
		
		FOR row_experiment IN SELECT * FROM "Experiment"
		LOOP
			counter := (SELECT count(*) FROM "Slides" WHERE "Experiment ID" = row_experiment."ID");
			UPDATE "Experiment" SET "Number of Slides" = counter WHERE "Experiment"."ID" = row_experiment."ID";
		END LOOP;
		
		FOR row_experiment IN SELECT * FROM "Experiment"
		LOOP
			counter := (SELECT sum("Number of Scans") FROM "Slides" WHERE "ID" IN (SELECT "Slides"."ID" FROM "Slides", "Experiment" WHERE "Slides"."Experiment ID" = row_experiment."ID"));
			UPDATE "Experiment" SET "Number of Scans" = counter WHERE "Experiment"."ID" = row_experiment."ID";
		END LOOP;
		
		UPDATE "Experiment" SET "Number of Scans" = NULL WHERE "Number of Scans" = 0;
		UPDATE "Experiment" SET "Number of Slides" = NULL WHERE "Number of Slides" = 0;
		
        RETURN;
    END;
$$;

SELECT update_number_of_scan_slide();

DROP FUNCTION update_number_of_scan_slide();

DROP TABLE "Slides";

CREATE TABLE "Slides" AS SELECT * FROM "Slide" WHERE "ID" NOT IN (SELECT DISTINCT slide_id FROM "Scan");

CREATE FUNCTION update_number_of_slides() RETURNS void
    LANGUAGE plpgsql
    AS $$
    DECLARE
        row_specimen "Specimen"%rowtype;
        counter integer;
    BEGIN
		-- raise notice 'start slide';
		FOR row_specimen IN SELECT * FROM "Specimen" WHERE "Number of Slides" IS NULL
		LOOP
			counter := (SELECT count(*) FROM "Slides" WHERE "Specimen ID" = row_specimen."ID");
			UPDATE "Specimen" SET "Number of Slides" = counter WHERE "Specimen"."ID" = row_specimen."ID";
		END LOOP;
		
		UPDATE "Specimen" SET "Number of Slides" = NULL WHERE "Number of Slides" = 0;
		
        RETURN;
    END;
$$;

SELECT update_number_of_slides();

DROP FUNCTION update_number_of_slides();

DROP TABLE "Slides";

ALTER TABLE "Scan" ADD CONSTRAINT "Scan_species_fkey" FOREIGN KEY ("species") REFERENCES "species" ("term");
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_submitter_fkey" FOREIGN KEY ("submitter") REFERENCES "User" ("Full Name");
ALTER TABLE "Scan" ADD COLUMN "Experiment ID" text;
UPDATE "Scan" T1 SET "Experiment ID" = (SELECT "Slide"."Experiment ID" FROM "Slide", "Scan" T2 WHERE T1.id = T2.id AND "Slide"."ID" = T1.slide_id);
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_Experiment ID_fkey" FOREIGN KEY ("Experiment ID") REFERENCES "Experiment" ("ID");
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_gene_fkey" FOREIGN KEY ("gene") REFERENCES "gene" ("term");
ALTER TABLE "Scan" ADD COLUMN "Specimen ID" text;
UPDATE "Scan" T1 SET "Specimen ID" = (SELECT "Slide"."Specimen ID" FROM "Slide", "Scan" T2 WHERE T1.id = T2.id AND "Slide"."ID" = T1.slide_id);
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_Specimen ID_fkey" FOREIGN KEY ("Specimen ID") REFERENCES "Specimen" ("ID");

ALTER TABLE "Experiment" ADD COLUMN "Probes" text[];
UPDATE "Experiment" SET "Probes" = regexp_split_to_array("Experiment"."Probe",';');
UPDATE "Experiment" SET "Probe" = split_part("Probe", ';', 1);

ALTER TABLE "Experiment" ALTER COLUMN "Initials" TYPE text;
UPDATE "Experiment" T1 SET "Initials" = (SELECT "Full Name" FROM "User", "Experiment" T2 WHERE T1."ID" = T2."ID" AND T2."Initials" = "User"."Initials");
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_Initials_fkey" FOREIGN KEY ("Initials") REFERENCES "User" ("Full Name");
ALTER TABLE "Experiment" ALTER COLUMN "Probe" SET NOT NULL;
ALTER TABLE "Experiment" ALTER COLUMN "Probes" SET NOT NULL;
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_Probe_fkey" FOREIGN KEY ("Probe") REFERENCES "probe" ("term");

UPDATE "Specimen" SET "Age" = substring("Age" FROM 2) WHERE substring("Age" FROM 1 FOR 1) = ' ';

---
--- Set the "Label" url
ALTER TABLE "Specimen" ADD COLUMN "Label" text;
UPDATE "Specimen" SET "Comment" = '' WHERE "Comment" IS NULL;

UPDATE "Specimen" T1 SET "Label" = (
SELECT 'ID=' || urlencode(T2."ID") || 
'&' || urlencode('Section Date') || '=' || urlencode('' || T2."Section Date") ||
'&' || urlencode('Sample Name') || '=' || urlencode(species.code || tissue.code || COALESCE("Age Value", '') || age.code || gene.code || T2."Specimen Identifier") ||
'&Initials=' || urlencode("User"."Initials") ||
'&Disambiguator=' || urlencode(T2."Disambiguator") ||
'&Comment=' || urlencode(T2."Comment")
FROM species, tissue, age, gene, "User", "Specimen" T2 WHERE T2."Initials" = "User"."Full Name" AND species.term = T2."Species" AND tissue.term = T2."Tissue" AND age.term = T2."Age Unit" AND gene.term = T2."Gene" and T2."ID" = T1."ID"); 

ALTER TABLE "Slide" ADD COLUMN "Label" text;

UPDATE "Slide" T1 SET "Label" = (
	SELECT 'ID=' || urlencode(T2."ID") || 
	'&' || urlencode('Experiment ID') || '=' || urlencode(T2."Experiment ID") ||
	'&' || urlencode('Seq.') || '=' || T2."Seq." ||
	'&' || urlencode('Experiment Date') || '=' || urlencode('' || "Experiment"."Experiment Date") ||
	'&' || urlencode('Sample Name') || '=' || urlencode(species.code || tissue.code || COALESCE("Age Value", '') || age.code || gene.code || "Specimen"."Specimen Identifier") ||
	'&' || urlencode('Experiment Description') || '=' || urlencode(experiment_type.code || probe.code) ||
	'&Initials=' || urlencode("User"."Initials") 
	FROM species, tissue, age, gene, "User", "Slide" T2, "Specimen", "Experiment", experiment_type, probe 
	WHERE 
		"User"."Full Name" = "Experiment"."Initials" AND 
		species.term = "Specimen"."Species" AND 
		tissue.term = "Specimen"."Tissue" AND 
		age.term = "Specimen"."Age Unit" AND 
		gene.term = "Specimen"."Gene" AND 
		"Specimen"."ID" = T2."Specimen ID" AND 
		"Experiment"."ID" = T2."Experiment ID" AND 
		experiment_type.term = "Experiment"."Experiment Type" AND 
		probe.term = "Experiment"."Probe" AND 
		T1."Experiment ID" IS NOT NULL AND 
		T2."Experiment ID" IS NOT NULL AND T2."ID" = T1."ID"
) 
WHERE T1."Experiment ID" IS NOT NULL; 

UPDATE "Scan" T1 SET  probe = (SELECT "Probe" FROM "Experiment", "Scan" T2, "Slide" WHERE T1.id = T2.id AND T1."slide_id" = "Slide"."ID" AND "Experiment"."ID" = "Slide"."Experiment ID");
--
-- Create triggers for the Scan, Slide, Experiment and Specimen tables
--
CREATE FUNCTION specimen_trigger_before() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        sample_name text;
        initials text;
        id_prefix text;
        disambiguator integer;
        age_offset integer;
    BEGIN
		IF (NEW."Age Unit" IS NULL) THEN
			RAISE EXCEPTION 'Age Unit cannot be NULL';
		END IF;
		IF (NEW."Age Value" IS NULL) THEN
			NEW."Age Value" := '';
		END IF;
		IF (NEW."Specimen Identifier" IS NULL) THEN
			RAISE EXCEPTION 'Specimen Identifier cannot be NULL';
		END IF;
		IF (NEW."Species" IS NULL) THEN
			RAISE EXCEPTION 'Species cannot be NULL';
		END IF;
		IF (NEW."Tissue" IS NULL) THEN
			RAISE EXCEPTION 'Tissue cannot be NULL';
		END IF;
		IF (NEW."Gene" IS NULL) THEN
			RAISE EXCEPTION 'Gene cannot be NULL';
		END IF;
		IF (NEW."Section Date" IS NULL) THEN
			RAISE EXCEPTION 'Section Date cannot be NULL';
		END IF;
		IF (NEW."Initials" IS NULL) THEN
			RAISE EXCEPTION 'Submitted By cannot be NULL';
		END IF;
		IF (NEW."Comment" IS NULL) THEN
			NEW."Comment" := '';
		END IF;
		IF NEW."ID" IS NULL THEN
			NEW."Genes" := ARRAY[NEW."Gene"];
			initials := (SELECT "Initials" FROM "Microscopy"."User" "User" WHERE "User"."Full Name" = NEW."Initials");
	        sample_name := (SELECT species.code || tissue.code || NEW."Age Value" || age.code || gene.code || NEW."Specimen Identifier" FROM "Microscopy".species species, "Microscopy".tissue tissue, "Microscopy".age age, "Microscopy".gene gene WHERE species.term = NEW."Species" AND tissue.term = NEW."Tissue" AND age.term = NEW."Age Unit" AND gene.term = NEW."Gene"); 
	        id_prefix := replace(to_char(NEW."Section Date", 'YYYY-MM-DD'), '-', '') || '-' || sample_name || '-' || initials;
	        disambiguator := (SELECT max("Disambiguator") FROM "Microscopy"."Specimen" WHERE "ID" LIKE (id_prefix || '%'));
	        IF (disambiguator IS NULL) THEN
				NEW."ID" := id_prefix;
				disambiguator := 0;
			ELSE
				disambiguator := disambiguator + 1;
				NEW."ID" := id_prefix || '-' || disambiguator;
			END IF;
			NEW."Disambiguator" := disambiguator;
		END IF;
		IF NEW."Age Value" != '' THEN
			NEW."Age" := NEW."Age Value" || ' ' || NEW."Age Unit";
		ELSE
			NEW."Age" := NEW."Age Unit";
		END IF;
		IF NEW."Age Unit" = 'embryonic day' THEN
			age_offset := 0;
		ELSIF NEW."Age Unit" = 'Post natal day' THEN
			age_offset := 1000;
		ELSIF NEW."Age Unit" = 'hours' THEN
			age_offset := 2000;
		ELSIF NEW."Age Unit" = 'days' THEN
			age_offset := 3000;
		ELSIF NEW."Age Unit" = 'weeks' THEN
			age_offset := 4000;
		ELSIF NEW."Age Unit" = 'months' THEN
			age_offset := 5000;
		ELSIF NEW."Age Unit" = 'adult' THEN
			age_offset := 6000;
		ELSE 
			age_offset := 0;
		END IF;
			
		IF NEW."Age Unit" = 'adult' THEN
			age_offset := age_offset + 200;
		END IF;
		BEGIN
			NEW.age_rank := age_offset + to_number(NEW."Age Value", '99999.99');
		EXCEPTION WHEN others THEN
			NEW.age_rank := age_offset;
		END;
		initials := (SELECT "Initials" FROM "Microscopy"."User" "User" WHERE "User"."Full Name" = NEW."Initials");
		NEW."Label" := 'ID=' || "Microscopy".urlencode(NEW."ID") ||
			'&' || "Microscopy".urlencode('Section Date') || '=' || "Microscopy".urlencode('' || NEW."Section Date") ||
			'&' || "Microscopy".urlencode('Sample Name') || '=' || "Microscopy".urlencode(sample_name) ||
			'&Initials=' || "Microscopy".urlencode(initials) ||
			'&Disambiguator=' || "Microscopy".urlencode(NEW."Disambiguator") ||
			'&Comment=' || "Microscopy".urlencode(NEW."Comment");
        RETURN NEW;
    END;
$$;

CREATE TRIGGER specimen_trigger_before BEFORE INSERT OR UPDATE ON "Specimen" FOR EACH ROW EXECUTE PROCEDURE specimen_trigger_before();

CREATE FUNCTION specimen_trigger_after() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        counter integer;
    BEGIN
		counter := (SELECT count(*) FROM "Microscopy"."specimen_gene" WHERE "Specimen ID" = NEW."ID" AND "Gene ID" = NEW."Gene");
		IF counter = 0 THEN
			INSERT INTO "Microscopy"."specimen_gene"("Specimen ID", "Gene ID") VALUES (NEW."ID", NEW."Gene");
		END IF;
        RETURN NEW;
    END;
$$;

CREATE TRIGGER specimen_trigger_after AFTER INSERT OR UPDATE ON "Specimen" FOR EACH ROW EXECUTE PROCEDURE specimen_trigger_after();

CREATE FUNCTION experiment_trigger_before() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        experiment_description text;
        initials text;
        id_prefix text;
        disambiguator integer;
    BEGIN
		IF (NEW."Experiment Type" IS NULL) THEN
			RAISE EXCEPTION 'Experiment Type cannot be NULL';
		END IF;
		IF (NEW."Probe" IS NULL) THEN
			RAISE EXCEPTION 'Probe cannot be NULL';
		END IF;
		IF (NEW."Experiment Date" IS NULL) THEN
			RAISE EXCEPTION 'Experiment Date cannot be NULL';
		END IF;
		IF (NEW."Initials" IS NULL) THEN
			RAISE EXCEPTION 'Submitted By cannot be NULL';
		END IF;
		IF NEW."ID" IS NULL THEN
			NEW."Probes" := ARRAY[NEW."Probe"];
			initials := (SELECT "Initials" FROM "Microscopy"."User" "User" WHERE "User"."Full Name" = NEW."Initials");
	        experiment_description := (SELECT experiment_type.code || probe.code FROM "Microscopy".experiment_type experiment_type, "Microscopy".probe probe WHERE experiment_type.term = NEW."Experiment Type" AND probe.term = NEW."Probe"); 
	        id_prefix := replace(to_char(NEW."Experiment Date", 'YYYY-MM-DD'), '-', '') || '-' || experiment_description || '-' || initials;
	        disambiguator := (SELECT max("Disambiguator") FROM "Microscopy"."Experiment" WHERE "ID" LIKE (id_prefix || '%'));
	        IF (disambiguator IS NULL) THEN
				NEW."ID" := id_prefix;
				disambiguator := 0;
			ELSE
				disambiguator := disambiguator + 1;
				NEW."ID" := id_prefix || '-' || disambiguator;
			END IF;
			NEW."Disambiguator" := disambiguator;
		END IF;
        RETURN NEW;
    END;
$$;

CREATE TRIGGER experiment_trigger_before BEFORE INSERT OR UPDATE ON "Experiment" FOR EACH ROW EXECUTE PROCEDURE experiment_trigger_before();

CREATE FUNCTION experiment_trigger_after() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        counter integer;
    BEGIN
		counter := (SELECT count(*) FROM "Microscopy"."experiment_probe" WHERE "Experiment ID" = NEW."ID" AND "Probe ID" = NEW."Probe");
		IF counter = 0 THEN
			INSERT INTO "Microscopy"."experiment_probe"("Experiment ID", "Probe ID") VALUES (NEW."ID", NEW."Probe");
		END IF;
        RETURN NEW;
    END;
$$;

CREATE TRIGGER experiment_trigger_after AFTER INSERT OR UPDATE ON "Experiment" FOR EACH ROW EXECUTE PROCEDURE experiment_trigger_after();

CREATE FUNCTION slide_trigger_before() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        seq integer;
        row_experiment "Microscopy"."Experiment"%rowtype;
        row_specimen "Microscopy"."Specimen"%rowtype;
        sample_name text;
        initials text;
        experiment_description text;
    BEGIN
		IF (NEW."Specimen ID" IS NULL) THEN
			RAISE EXCEPTION 'Specimen ID cannot be NULL';
		END IF;
		IF (NEW."Seq." IS NULL) THEN
			RAISE EXCEPTION 'Seq. cannot be NULL';
		END IF;
		seq := to_number('' || NEW."Seq.", '99999.99');
		IF NEW."ID" IS NULL THEN
			NEW."ID" := NEW."Specimen ID" || '-' || substring(('0' || seq) FROM '..$') || '-000';
			/*
	        seq := (SELECT max("Seq.") FROM "Microscopy"."Slide" WHERE "ID" LIKE (NEW."Specimen ID" || '%'));
	        IF (seq IS NULL) THEN
				seq := 1;
				NEW."ID" := NEW."Specimen ID" || '-01-000';
			ELSE
				seq := seq + 1;
				NEW."ID" := NEW."Specimen ID" || '-' || substring(('0' || seq) FROM '..$') || '-000';
			END IF;
			NEW."Seq." := seq;
			*/
		END IF;
		IF NEW."Experiment ID" IS NOT NULL THEN
			SELECT * INTO row_experiment FROM "Microscopy"."Experiment" WHERE "ID" = NEW."Experiment ID";
			SELECT * INTO row_specimen FROM "Microscopy"."Specimen" WHERE "ID" = NEW."Specimen ID";
			initials := (SELECT "Initials" FROM "Microscopy"."User" "User" WHERE "User"."Full Name" = row_experiment."Initials");
	        sample_name := (SELECT species.code || tissue.code || row_specimen."Age Value" || age.code || gene.code || row_specimen."Specimen Identifier" FROM "Microscopy".species species, "Microscopy".tissue tissue, "Microscopy".age age, "Microscopy".gene gene WHERE species.term = row_specimen."Species" AND tissue.term = row_specimen."Tissue" AND age.term = row_specimen."Age Unit" AND gene.term = row_specimen."Gene"); 
			experiment_description := (SELECT experiment_type.code || probe.code FROM "Microscopy".experiment_type experiment_type, "Microscopy".probe probe WHERE experiment_type.term = row_experiment."Experiment Type" AND probe.term = row_experiment."Probe");
	        NEW."Label" := 'ID=' || "Microscopy".urlencode(NEW."ID") ||
				'&' || "Microscopy".urlencode('Experiment ID') || '=' || "Microscopy".urlencode(NEW."Experiment ID") ||
				'&' || "Microscopy".urlencode('Seq.') || '=' || NEW."Seq." ||
				'&' || "Microscopy".urlencode('Experiment Date') || '=' || "Microscopy".urlencode('' || row_experiment."Experiment Date") ||
				'&' || "Microscopy".urlencode('Sample Name') || '=' || "Microscopy".urlencode(sample_name) ||
				'&' || "Microscopy".urlencode('Experiment Description') || '=' || "Microscopy".urlencode(experiment_description) ||
				'&Initials=' || "Microscopy".urlencode(initials);
		END IF;
        RETURN NEW;
    END;
$$;

CREATE TRIGGER slide_trigger_before BEFORE INSERT OR UPDATE ON "Slide" FOR EACH ROW EXECUTE PROCEDURE slide_trigger_before();

CREATE FUNCTION slide_trigger_after() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        counter integer;
    BEGIN
		counter := (SELECT count(*) FROM "Microscopy"."Slide" WHERE "Specimen ID" = NEW."Specimen ID");
		UPDATE "Microscopy"."Specimen" SET "Number of Slides" = counter WHERE "ID" = NEW."Specimen ID";
		IF NEW."Experiment ID" IS NOT NULL THEN
			counter := (SELECT count(*) FROM "Microscopy"."Slide" WHERE "Experiment ID" = NEW."Experiment ID");
			UPDATE "Microscopy"."Experiment" SET "Number of Slides" = counter WHERE "ID" = NEW."Experiment ID";
		END IF;
        RETURN NEW;
    END;
$$;

CREATE TRIGGER slide_trigger_after AFTER INSERT OR UPDATE ON "Slide" FOR EACH ROW EXECUTE PROCEDURE slide_trigger_after();

CREATE FUNCTION slide_trigger_after_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        counter integer;
    BEGIN
		counter := (SELECT count(*) FROM "Microscopy"."Slide" WHERE "Specimen ID" = OLD."Specimen ID");
		IF counter = 0 THEN
			counter := NULL;
		END IF;
		UPDATE "Microscopy"."Specimen" SET "Number of Slides" = counter WHERE "ID" = OLD."Specimen ID";
		IF OLD."Experiment ID" IS NOT NULL THEN
			counter := (SELECT count(*) FROM "Microscopy"."Slide" WHERE "Experiment ID" = OLD."Experiment ID");
			IF counter = 0 THEN
				counter := NULL;
			END IF;
			UPDATE "Microscopy"."Experiment" SET "Number of Slides" = counter WHERE "ID" = OLD."Experiment ID";
		END IF;
        RETURN OLD;
    END;
$$;

CREATE TRIGGER slide_trigger_after_delete AFTER DELETE ON "Slide" FOR EACH ROW EXECUTE PROCEDURE slide_trigger_after_delete();

CREATE FUNCTION scan_trigger_before() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        disambiguator integer;
    BEGIN
 		IF (NEW.slide_id IS NULL) THEN
			RAISE EXCEPTION 'slide_id cannot be NULL';
		END IF;
		NEW."Experiment ID" := (SELECT "Experiment ID" FROM "Microscopy"."Slide" WHERE "ID" = NEW.slide_id);
		NEW."Specimen ID" := (SELECT "Specimen ID" FROM "Microscopy"."Slide" WHERE "ID" = NEW.slide_id);
		NEW.submitter := (SELECT "Full Name" FROM "Microscopy"."User" "User", "Microscopy"."Slide" "Slide", "Microscopy"."Experiment" "Experiment" WHERE NEW.slide_id = "Slide"."ID" AND "Experiment"."ID" = "Slide"."Experiment ID" AND "Experiment"."Initials" = "User"."Full Name");
		NEW.submitted := (SELECT "Experiment Date" FROM "Microscopy"."Experiment" "Experiment", "Microscopy"."Slide" "Slide" WHERE NEW.slide_id = "Slide"."ID" AND "Experiment"."ID" = "Slide"."Experiment ID");
		NEW.probe := (SELECT "Probe" FROM "Microscopy"."Experiment" "Experiment", "Microscopy"."Slide" "Slide" WHERE NEW.slide_id = "Slide"."ID" AND "Experiment"."ID" = "Slide"."Experiment ID");
		NEW.tissue := (SELECT "Tissue" FROM "Microscopy"."Specimen" "Specimen", "Microscopy"."Slide" "Slide" WHERE NEW.slide_id = "Slide"."ID" AND "Specimen"."ID" = "Slide"."Specimen ID");
		NEW.age := (SELECT "Age" FROM "Microscopy"."Specimen" "Specimen", "Microscopy"."Slide" "Slide" WHERE NEW.slide_id = "Slide"."ID" AND "Specimen"."ID" = "Slide"."Specimen ID");
		NEW.age_rank := (SELECT "age_rank" FROM "Microscopy"."Specimen" "Specimen", "Microscopy"."Slide" "Slide" WHERE NEW.slide_id = "Slide"."ID" AND "Specimen"."ID" = "Slide"."Specimen ID");
		NEW.gene := (SELECT "Gene" FROM "Microscopy"."Specimen" "Specimen", "Microscopy"."Slide" "Slide" WHERE NEW.slide_id = "Slide"."ID" AND "Specimen"."ID" = "Slide"."Specimen ID");
		NEW.species := (SELECT "Species" FROM "Microscopy"."Specimen" "Specimen", "Microscopy"."Slide" "Slide" WHERE NEW.slide_id = "Slide"."ID" AND "Specimen"."ID" = "Slide"."Specimen ID");
		IF (NEW."Disambiguator" IS NULL) THEN
        	disambiguator := (SELECT COALESCE(max(cast(regexp_replace(description, '^.*-', '') as int)+1),1) FROM "Microscopy"."Scan" WHERE slide_id = NEW.slide_id);
	        NEW."Disambiguator" := disambiguator;
			New.description := NEW.slide_id || '-' || disambiguator;
			New.accession_number := NEW.slide_id || '-' || disambiguator;
			NEW.id := nextval('"Microscopy"."Scan_id_seq"'::regclass);
			IF (NEW."last_modified" IS NULL) THEN
				NEW."last_modified" := now();
			END IF;
        END IF;
        RETURN NEW;
    END;
$$;

CREATE TRIGGER scan_trigger_before BEFORE INSERT OR UPDATE ON "Scan" FOR EACH ROW EXECUTE PROCEDURE scan_trigger_before();

CREATE FUNCTION scan_trigger_after() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        counter integer;
        specimen_id text;
        experiment_id text;
    BEGIN
		counter := (SELECT count(*) FROM "Microscopy"."Scan" WHERE "slide_id" = NEW.slide_id);
		UPDATE "Microscopy"."Slide" SET "Number of Scans" = counter WHERE "ID" = NEW.slide_id;
		specimen_id := (SELECT "Specimen ID" FROM "Microscopy"."Slide" WHERE "ID" = NEW.slide_id);
		counter := (SELECT sum("Number of Scans") FROM "Microscopy"."Slide" WHERE "Specimen ID" = specimen_id);
		UPDATE "Microscopy"."Specimen" SET "Number of Scans" = counter WHERE "ID" = specimen_id;
		experiment_id := (SELECT "Experiment ID" FROM "Microscopy"."Slide" WHERE "ID" = NEW.slide_id);
		IF experiment_id IS NOT NULL THEN
			counter := (SELECT sum("Number of Scans") FROM "Microscopy"."Slide" WHERE "Experiment ID" = experiment_id);
			UPDATE "Microscopy"."Experiment" SET "Number of Scans" = counter WHERE "ID" = experiment_id;
		END IF;
        RETURN NEW;
    END;
$$;

CREATE TRIGGER scan_trigger_after AFTER INSERT OR UPDATE ON "Scan" FOR EACH ROW EXECUTE PROCEDURE scan_trigger_after();

CREATE FUNCTION scan_trigger_after_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        counter integer;
        specimen_id text;
        experiment_id text;
    BEGIN
		counter := (SELECT count(*) FROM "Microscopy"."Scan" WHERE "slide_id" = OLD.slide_id);
		IF counter = 0 THEN
			counter := NULL;
		END IF;
		UPDATE "Microscopy"."Slide" SET "Number of Scans" = counter WHERE "ID" = OLD.slide_id;
		specimen_id := (SELECT "Specimen ID" FROM "Microscopy"."Slide" WHERE "ID" = OLD.slide_id);
		counter := (SELECT sum("Number of Scans") FROM "Microscopy"."Slide" WHERE "Specimen ID" = specimen_id);
		IF counter = 0 THEN
			counter := NULL;
		END IF;
		UPDATE "Microscopy"."Specimen" SET "Number of Scans" = counter WHERE "ID" = specimen_id;
		experiment_id := (SELECT "Experiment ID" FROM "Microscopy"."Slide" WHERE "ID" = OLD.slide_id);
		IF experiment_id IS NOT NULL THEN
			counter := (SELECT sum("Number of Scans") FROM "Microscopy"."Slide" WHERE "Experiment ID" = experiment_id);
			IF counter = 0 THEN
				counter := NULL;
			END IF;
			UPDATE "Microscopy"."Experiment" SET "Number of Scans" = counter WHERE "ID" = experiment_id;
		END IF;
        RETURN OLD;
    END;
$$;

CREATE TRIGGER scan_trigger_after_delete AFTER DELETE ON "Scan" FOR EACH ROW EXECUTE PROCEDURE scan_trigger_after_delete();

CREATE FUNCTION specimen_gene_trigger_after() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        row_specimen "Microscopy"."Specimen"%rowtype;
        genes text[];
    BEGIN
		SELECT * INTO row_specimen FROM "Microscopy"."Specimen" WHERE "ID" = NEW."Specimen ID";
		genes := row_specimen."Genes";
		IF NOT (genes @> ARRAY[NEW."Gene ID"]) THEN
			genes := array_append(genes, NEW."Gene ID");
			UPDATE "Microscopy"."Specimen" SET "Genes" = genes WHERE "ID" = NEW."Specimen ID";
		END IF;
        RETURN NEW;
    END;
$$;

CREATE TRIGGER specimen_gene_trigger_after AFTER INSERT OR UPDATE ON "specimen_gene" FOR EACH ROW EXECUTE PROCEDURE specimen_gene_trigger_after();

CREATE FUNCTION experiment_probe_trigger_after() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        row_experiment "Microscopy"."Experiment"%rowtype;
        probes text[];
    BEGIN
		SELECT * INTO row_experiment FROM "Microscopy"."Experiment" WHERE "ID" = NEW."Experiment ID";
		probes := row_experiment."Probes";
		IF NOT (probes @> ARRAY[NEW."Probe ID"]) THEN
			probes := array_append(probes, NEW."Probe ID");
			UPDATE "Microscopy"."Experiment" SET "Probes" = probes WHERE "ID" = NEW."Experiment ID";
		END IF;
        RETURN NEW;
    END;
$$;

CREATE TRIGGER experiment_probe_trigger_after AFTER INSERT OR UPDATE ON "experiment_probe" FOR EACH ROW EXECUTE PROCEDURE experiment_probe_trigger_after();

--
-- Constraints for required fields
--
ALTER TABLE "Experiment" ALTER COLUMN "Experiment Type" SET NOT NULL;
ALTER TABLE "Experiment" ALTER COLUMN "Probe" SET NOT NULL;

ALTER TABLE "Specimen" ALTER COLUMN "Species" SET NOT NULL;
ALTER TABLE "Specimen" ALTER COLUMN "Age" SET NOT NULL;
ALTER TABLE "Specimen" ALTER COLUMN "Tissue" SET NOT NULL;
ALTER TABLE "Specimen" ALTER COLUMN "Gene" SET NOT NULL;
ALTER TABLE "Specimen" ALTER COLUMN "Specimen Identifier" SET NOT NULL;
ALTER TABLE "Specimen" ALTER COLUMN "Genes" SET NOT NULL;
ALTER TABLE "Specimen" ALTER COLUMN "Age Unit" SET NOT NULL;

--
-- Drop the old CIRM vocabulary tables
--

DROP TABLE "Age";
DROP TABLE "Gene";
DROP TABLE "Probe";
DROP TABLE "Species";
DROP TABLE "Tissue";
DROP TABLE "Experiment Type";

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
('Microscopy', 'Slide', 'Number of Scans', 'comment', '["top"]'),

('Microscopy', 'Scan', 'species', 'tag:isrd.isi.edu,2016:column-display', '{"detailed" :{"markdown_pattern":"**{{species}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),
('Microscopy', 'Scan', 'tissue', 'tag:isrd.isi.edu,2016:column-display', '{"detailed" :{"markdown_pattern":"**{{tissue}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),
('Microscopy', 'Scan', 'gene', 'tag:isrd.isi.edu,2016:column-display', '{"detailed" :{"markdown_pattern":"**{{gene}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),
('Microscopy', 'Scan', 'gender', 'tag:isrd.isi.edu,2016:column-display', '{"detailed" :{"markdown_pattern":"**{{gender}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),

('Microscopy', 'Scan', 'Thumbnail', 'tag:isrd.isi.edu,2016:column-display', 
'{
	"detailed" :{"markdown_pattern":"[![]({{Thumbnail}}){width=400 height=400}](/chaise/viewer/#1/Microscopy:Scan/id={{#encode}}{{id}}{{/encode}}){target=_blank}","separator_markdown":"  "},
	"compact" :{"markdown_pattern":"[![]({{Thumbnail}}){width=100 height=100}](/chaise/record/#1/Microscopy:Scan/id={{#encode}}{{id}}{{/encode}}){target=_blank}","separator_markdown":"  "}
}'),

('Microscopy', 'Scan', 'HTTP URL', 'tag:isrd.isi.edu,2016:column-display', 
'{
	"detailed" :{"markdown_pattern":"[**{{filename}}** ({{bytes}} Bytes)]({{HTTP URL}})","separator_markdown":"\n\n"}
}'),

('Microscopy', 'probe', 'term', 'tag:isrd.isi.edu,2016:column-display', '{"compact" :{"markdown_pattern":"**{{term}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),
('Microscopy', 'gene', 'term', 'tag:isrd.isi.edu,2016:column-display', '{"compact" :{"markdown_pattern":"**{{term}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),

('Microscopy', 'Specimen', 'Label', 'tag:isrd.isi.edu,2016:column-display', 
'{
	"detailed" :{"markdown_pattern":"[**Print Label**](/microscopy/printer/specimen/job?{{Label}}){download .btn .btn-primary target=_blank}","separator_markdown":"\n\n"},
	"compact" :{"markdown_pattern":"{{#Label}}[**Print Label**](/microscopy/printer/specimen/job?{{Label}}){download .btn .btn-primary target=_blank}{{/Label}}","separator_markdown":"\n\n"}
}'),

('Microscopy', 'Slide', 'Label', 'tag:isrd.isi.edu,2016:column-display', 
'{
	"detailed" :{"markdown_pattern":"[**Print Label**](/microscopy/printer/slide/job?{{Label}}){download .btn .btn-primary target=_blank}","separator_markdown":"\n\n"},
	"compact" :{"markdown_pattern":"{{#Label}}[**Print Label**](/microscopy/printer/slide/job?{{Label}}){download .btn .btn-primary target=_blank}{{/Label}}","separator_markdown":"\n\n"}
}'),

('Microscopy', 'Specimen', 'Species', 'tag:isrd.isi.edu,2016:column-display', '{"detailed" :{"markdown_pattern":"**{{Species}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),
('Microscopy', 'Specimen', 'Tissue', 'tag:isrd.isi.edu,2016:column-display', '{"detailed" :{"markdown_pattern":"**{{Tissue}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),
-- ('Microscopy', 'Specimen', 'Age', 'tag:isrd.isi.edu,2016:column-display', '{"detailed" :{"markdown_pattern":"**{{{Age}}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}"}}'),
('Microscopy', 'Specimen', 'Gene', 'tag:isrd.isi.edu,2016:column-display', '{"detailed" :{"markdown_pattern":"**{{Gene}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),

('Microscopy', 'Experiment', 'Probe', 'tag:isrd.isi.edu,2016:column-display', '{"detailed" :{"markdown_pattern":"**{{Probe}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),
('Microscopy', 'Experiment', 'Experiment Type', 'tag:isrd.isi.edu,2016:column-display', '{"detailed" :{"markdown_pattern":"**{{Experiment Type}}**{style=color:darkblue;background-color:rgba(220,220,220,0.68);padding:7px;border-radius:10px;}","separator_markdown":" || "}}'),

('Microscopy', 'Slide', 'Specimen ID', 'tag:isrd.isi.edu,2016:column-display', 
'{
	"detailed": {"markdown_pattern": "[{{Specimen ID}}](/chaise/record/#1/Microscopy:Specimen/ID={{#encode}}{{Specimen ID}}{{/encode}})"},
	"compact": {"markdown_pattern": "[{{Specimen ID}}](/chaise/record/#1/Microscopy:Specimen/ID={{#encode}}{{Specimen ID}}{{/encode}})"}
}'),
('Microscopy', 'Slide', 'Experiment ID', 'tag:isrd.isi.edu,2016:column-display', 
'{
	"detailed": {"markdown_pattern": "[{{Experiment ID}}](/chaise/record/#1/Microscopy:Experiment/ID={{#encode}}{{Experiment ID}}{{/encode}})"},
	"compact": {"markdown_pattern": "[{{Experiment ID}}](/chaise/record/#1/Microscopy:Experiment/ID={{#encode}}{{Experiment ID}}{{/encode}})"}
}')
;

INSERT INTO _ermrest.model_schema_annotation (schema_name, annotation_uri, annotation_value) VALUES
('Microscopy', 'comment', '["default"]'),
('Microscopy', 'tag:isrd.isi.edu,2016:recordlink', '{"mode": "tag:isrd.isi.edu,2016:recordlink/fragmentfilter", "resource": "record/"}'),
('Microscopy', 'tag:misd.isi.edu,2015:display', '{"name_style" : {"underline_space":true,"title_case":true}}')
;

INSERT INTO _ermrest.model_table_annotation (schema_name, table_name, annotation_uri, annotation_value) VALUES
('Microscopy', 'age_stage', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"compact": ["code", "term"]
}'),
('Microscopy', 'anatomy', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"compact": ["code", "term"]
}'),
('Microscopy', 'annotation_type', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"compact": ["code", "term"]
}'),
('Microscopy', 'embedding_medium', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"compact": ["code", "term"]
}'),
('Microscopy', 'gender', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"compact": ["code", "term"]
}'),
('Microscopy', 'specimen_fixation', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"compact": ["code", "term"]
}'),
('Microscopy', 'staining_protocol', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"compact": ["code", "term"]
}'),
('Microscopy', 'probe', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"compact": ["code", "term"]
}'),
('Microscopy', 'species', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"compact": ["code", "term"]
}'),
('Microscopy', 'tissue', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"compact": ["code", "term"]
}'),
('Microscopy', 'gene', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"compact": ["code", "term"]
}'),
('Microscopy', 'age', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"compact": ["code", "term"]
}'),
('Microscopy', 'experiment_type', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
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
	"detailed": ["Thumbnail", "HTTP URL", "slide_id", "Acquisition Date", "submitter", "species", "tissue", "gene", "gender", "age", "Objective", "Channels", "Channel Name", "Contrast Method", "Light Source Intensity", "Exposure Time"],
	"entry/edit": ["submitter", "species", "tissue", "gene", "gender", "age"],
	"entry/create": ["submitter", "species", "tissue", "gene", "gender", "age"]
}'),

('Microscopy', 'Specimen', 'description', '{"sortedBy": "Section Date", "sortOrder": "desc", "top_columns": ["ID", "Species", "Tissue", "Age Value", "Age Unit", "Gene", "Initials", "Specimen Identifier", "Section Date", "Number of Slides", "Number of Scans"]}'),
('Microscopy', 'Specimen', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["Species", "Tissue", "Age", "Gene", "Initials", "Section Date", "Specimen Identifier", "Comment", "Number of Slides", "Number of Scans", "Label"],
	"compact": ["ID", "Species", "Tissue", "Age", "Genes", "Initials", "Section Date", "Specimen Identifier", "Comment", "Number of Slides", "Number of Scans", "Label"],
	"entry": [["Microscopy", "Specimen_Species_fkey"], ["Microscopy", "Specimen_Tissue_fkey"], "Age Value",  ["Microscopy", "Specimen_Age Unit_fkey"], ["Microscopy", "Specimen_Gene_fkey"], ["Microscopy", "Specimen_Initials_fkey"], "Section Date", "Specimen Identifier", "Comment"]
}'),

('Microscopy', 'Experiment', 'description', '{"sortedBy": "Experiment Date", "sortOrder": "desc", "top_columns": ["ID", "Initials", "Experiment Date", "Experiment Type", "Probe", "Comment", "Number of Slides", "Number of Scans"]}'),
('Microscopy', 'Experiment', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["Initials", "Experiment Date", "Experiment Type", "Probe", "Comment", "Number of Slides", "Number of Scans"],
	"compact": ["ID", "Initials", "Experiment Date", "Experiment Type", "Probe", "Probes", "Comment", "Number of Slides", "Number of Scans"],
	"entry": [["Microscopy", "Experiment_Initials_fkey"], "Experiment Date", ["Microscopy", "Experiment_Experiment Type_fkey"], ["Microscopy", "Experiment_Probe_fkey"], "Comment"]
}'),

('Microscopy', 'Slide', 'tag:isrd.isi.edu,2016:visible-columns', 
'{
	"detailed": ["Seq.", "Specimen ID", "Experiment ID", "Comment", "Number of Scans", "Label"],
	"compact": ["ID", "Seq.", "Specimen ID", "Experiment ID", "Comment", "Number of Scans", "Label"],
	"entry": [["Microscopy", "Slide_Box ID_fkey"], ["Microscopy", "Slide_Experiment ID_fkey"], "Seq.", "Comment"]
}'),

('Microscopy', 'gene', 'tag:isrd.isi.edu,2016:table-display', 
'{
	"compact": {"row_markdown_pattern":"**{{term}}**{.vocab}","separator_markdown":" "}
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

('Microscopy', 'gene', 'tag:isrd.isi.edu,2016:visible-foreign-keys', 
'{
	"detailed": [
		["Microscopy", "specimen_gene_Gene ID_fkey"],
		["Microscopy", "Scan_gene_fkey"]
	]
}')

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
('Microscopy', 'Experiment', 'Probe', 'tag:isrd.isi.edu,2016:immutable'),
('Microscopy', 'Specimen', 'ID', 'tag:isrd.isi.edu,2016:generated'),
('Microscopy', 'Experiment', 'ID', 'tag:isrd.isi.edu,2016:generated'),
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

CREATE VIEW "CIRM_Resources" AS
SELECT 1 AS "ID",
    'Microscopy'::text AS "Schema",
    'Specimen'::text AS "Table",
    'Specimen'::text AS "Data Type",
    count(*) AS "Number Of Entries",
    max("Specimen"."Section Date") AS "Last Updated"
   FROM "Microscopy"."Specimen"
UNION
 SELECT 2 AS "ID",
    'Microscopy'::text AS "Schema",
    'Experiment'::text AS "Table",
    'Experiment'::text AS "Data Type",
    count(*) AS "Number Of Entries",
    max("Experiment"."Experiment Date") AS "Last Updated"
   FROM "Microscopy"."Experiment"
UNION
 SELECT 4 AS "ID",
    'Microscopy'::text AS "Schema",
    'Slide'::text AS "Table",
    'Slide'::text AS "Data Type",
    count("Slide"."ID") AS "Number Of Entries",
    (SELECT max("Specimen"."Section Date") from "Specimen") AS "Last Updated"
   FROM "Microscopy"."Slide"
UNION
 SELECT 5 AS "ID",
    'Microscopy'::text AS "Schema",
    'Scan'::text AS "Table",
    'Scan'::text AS "Data Type",
    count(*) AS "Number Of Entries",
    max("Scan"."Acquisition Date") AS "Last Updated"
   FROM "Microscopy"."Scan";

INSERT INTO _ermrest.model_table_annotation (schema_name, table_name, annotation_uri, annotation_value) VALUES
('Microscopy', 'CIRM_Resources', 'tag:misd.isi.edu,2015:display', '{"name" : "CIRM Resources"}'),
('Microscopy', 'CIRM_Resources', 'tag:isrd.isi.edu,2016:recordlink', '{"mode": "tag:isrd.isi.edu,2016:recordlink/fragmentfilter", "resource": "search/"}'),
('Microscopy', 'CIRM_Resources', 'tag:isrd.isi.edu,2016:visible-columns', '{"compact" : ["Data Type", "Number Of Entries", "Last Updated"]}')
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

COMMENT ON COLUMN "Scan"."Thumbnail" IS 'Click the thumbnail to open the full resolution image in the online viewer';
COMMENT ON COLUMN "Scan"."HTTP URL" IS 'Click the link to download the CZI file';
COMMIT;

