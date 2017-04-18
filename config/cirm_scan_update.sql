BEGIN;

SET search_path = "Microscopy";

--
-- Propagate "Probes" and "Experiment Type" from Experiment to the Scan
--

ALTER TABLE "Scan" ADD COLUMN "Probes" text[];
ALTER TABLE "Scan" ADD COLUMN "Experiment Type" text;
UPDATE "Scan" T1 SET  "Probes" = (SELECT "Experiment"."Probes" FROM "Experiment", "Scan" T2, "Slide" WHERE T1.id = T2.id AND T1."slide_id" = "Slide"."ID" AND "Experiment"."ID" = "Slide"."Experiment ID");
UPDATE "Scan" T1 SET "Experiment Type" = (SELECT "Experiment"."Experiment Type" FROM "Experiment", "Scan" T2, "Slide" WHERE T1.id = T2.id AND T1."slide_id" = "Slide"."ID" AND "Experiment"."ID" = "Slide"."Experiment ID");
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_Experiment Type_fkey" FOREIGN KEY ("Experiment Type") REFERENCES experiment_type (term);

DROP FUNCTION scan_trigger_before() CASCADE;

CREATE FUNCTION scan_trigger_before() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        disambiguator integer;
    BEGIN
 		IF (NEW.slide_id IS NULL) THEN
			RAISE EXCEPTION 'slide_id cannot be NULL';
		END IF;
		NEW."gender" := 'Unknown';
		NEW."resolution" := NEW."Scaling (per pixel)";
		NEW."Experiment ID" := (SELECT "Experiment ID" FROM "Microscopy"."Slide" WHERE "ID" = NEW.slide_id);
		NEW."Specimen ID" := (SELECT "Specimen ID" FROM "Microscopy"."Slide" WHERE "ID" = NEW.slide_id);
		NEW.submitter := (SELECT "Full Name" FROM "Microscopy"."User" "User", "Microscopy"."Slide" "Slide", "Microscopy"."Experiment" "Experiment" WHERE NEW.slide_id = "Slide"."ID" AND "Experiment"."ID" = "Slide"."Experiment ID" AND "Experiment"."Initials" = "User"."Full Name");
		NEW.submitted := (SELECT "Experiment Date" FROM "Microscopy"."Experiment" "Experiment", "Microscopy"."Slide" "Slide" WHERE NEW.slide_id = "Slide"."ID" AND "Experiment"."ID" = "Slide"."Experiment ID");
		NEW.probe := (SELECT "Probe" FROM "Microscopy"."Experiment" "Experiment", "Microscopy"."Slide" "Slide" WHERE NEW.slide_id = "Slide"."ID" AND "Experiment"."ID" = "Slide"."Experiment ID");
		NEW."Probes" := (SELECT "Probes" FROM "Microscopy"."Experiment" "Experiment", "Microscopy"."Slide" "Slide" WHERE NEW.slide_id = "Slide"."ID" AND "Experiment"."ID" = "Slide"."Experiment ID");
		NEW."Experiment Type" := (SELECT "Experiment Type" FROM "Microscopy"."Experiment" "Experiment", "Microscopy"."Slide" "Slide" WHERE NEW.slide_id = "Slide"."ID" AND "Experiment"."ID" = "Slide"."Experiment ID");
		NEW.tissue := (SELECT "Tissue" FROM "Microscopy"."Specimen" "Specimen", "Microscopy"."Slide" "Slide" WHERE NEW.slide_id = "Slide"."ID" AND "Specimen"."ID" = "Slide"."Specimen ID");
		NEW.age := (SELECT "Age" FROM "Microscopy"."Specimen" "Specimen", "Microscopy"."Slide" "Slide" WHERE NEW.slide_id = "Slide"."ID" AND "Specimen"."ID" = "Slide"."Specimen ID");
		NEW.age_rank := (SELECT "age_rank" FROM "Microscopy"."Specimen" "Specimen", "Microscopy"."Slide" "Slide" WHERE NEW.slide_id = "Slide"."ID" AND "Specimen"."ID" = "Slide"."Specimen ID");
		NEW.gene := (SELECT "Gene" FROM "Microscopy"."Specimen" "Specimen", "Microscopy"."Slide" "Slide" WHERE NEW.slide_id = "Slide"."ID" AND "Specimen"."ID" = "Slide"."Specimen ID");
		NEW.species := (SELECT "Species" FROM "Microscopy"."Specimen" "Specimen", "Microscopy"."Slide" "Slide" WHERE NEW.slide_id = "Slide"."ID" AND "Specimen"."ID" = "Slide"."Specimen ID");
		IF (NEW."Disambiguator" IS NULL) THEN
			IF NEW."File Date" IS NULL THEN
				NEW."File Date" := now();
			END IF;
        	disambiguator := (SELECT COALESCE(max(cast(regexp_replace(description, '^.*-', '') as int)+1),1) FROM "Microscopy"."Scan" WHERE slide_id = NEW.slide_id);
	        NEW."Disambiguator" := disambiguator;
			NEW.description := NEW.slide_id || '-' || disambiguator;
			NEW.accession_number := NEW.slide_id || '-' || disambiguator;
			NEW.id := nextval('"Microscopy"."Scan_id_seq"'::regclass);
			IF (NEW."last_modified" IS NULL) THEN
				NEW."last_modified" := now();
			END IF;
        END IF;
        RETURN NEW;
    END;
$$;

CREATE TRIGGER scan_trigger_before BEFORE INSERT OR UPDATE ON "Scan" FOR EACH ROW EXECUTE PROCEDURE scan_trigger_before();

DROP FUNCTION experiment_trigger_after() CASCADE;

CREATE FUNCTION experiment_trigger_after() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        counter integer;
        probes text[];
    BEGIN
		counter := (SELECT count(*) FROM "Microscopy"."experiment_probe" WHERE "Experiment ID" = NEW."ID" AND "Probe ID" = NEW."Probe");
		IF counter = 0 THEN
			INSERT INTO "Microscopy"."experiment_probe"("Experiment ID", "Probe ID") VALUES (NEW."ID", NEW."Probe");
		END IF;
		probes := (SELECT "Probes" FROM "Microscopy"."Scan" WHERE "Microscopy"."Scan"."Experiment ID" = NEW."ID" LIMIT 1);
		IF probes != NEW."Probes" THEN
			UPDATE "Microscopy"."Scan" set "Probes" = NEW."Probes" WHERE "Microscopy"."Scan"."Experiment ID" = NEW."ID";
		END IF;
        RETURN NEW;
    END;
$$;

CREATE TRIGGER experiment_trigger_after AFTER INSERT OR UPDATE ON "Experiment" FOR EACH ROW EXECUTE PROCEDURE experiment_trigger_after();

CREATE TABLE "experiment_comments" (
	"ID" serial NOT NULL PRIMARY KEY,
    "Experiment ID" text NOT NULL REFERENCES "Experiment" ("ID") ON DELETE CASCADE,
    "User" text,
    "Comment" text NOT NULL
);

INSERT INTO "experiment_comments" ("Experiment ID", "User", "Comment") 
SELECT "ID", '{"full_name": "' || "Initials" || '"}', "Comment" FROM "Experiment" where "Comment" IS NOT NULL AND "Comment" != '';

ALTER TABLE "experiment_comments" ALTER COLUMN "User" TYPE json USING "User"::json;

CREATE TABLE "scan_comments" (
	"ID" serial NOT NULL PRIMARY KEY,
    "Scan id" integer NOT NULL REFERENCES "Scan" ("id") ON DELETE CASCADE,
    "User" text,
    "Comment" text NOT NULL
);

INSERT INTO "scan_comments" ("Scan id", "User", "Comment") 
SELECT "id", '{"full_name": "' || "submitter" || '"}', "Comment" FROM "Scan" where "Comment" IS NOT NULL AND "Comment" != '';

ALTER TABLE "scan_comments" ALTER COLUMN "User" TYPE json USING "User"::json;

CREATE TABLE "slide_comments" (
	"ID" serial NOT NULL PRIMARY KEY,
    "Slide ID" text NOT NULL REFERENCES "Slide" ("ID") ON DELETE CASCADE,
    "User" text,
    "Comment" text NOT NULL
);

INSERT INTO "slide_comments" ("Slide ID", "User", "Comment") 
SELECT "ID", '{"full_name": "' || (select "Initials" from "Specimen", "Slide" T2 where T2."Specimen ID" = "Specimen"."ID" and T1."ID" = T2."ID") || '"}', "Comment" FROM "Slide" T1 where "Comment" IS NOT NULL AND "Comment" != '';

ALTER TABLE "slide_comments" ALTER COLUMN "User" TYPE json USING "User"::json;

CREATE TABLE "specimen_comments" (
	"ID" serial NOT NULL PRIMARY KEY,
    "Specimen ID" text NOT NULL REFERENCES "Specimen" ("ID") ON DELETE CASCADE,
    "User" text,
    "Comment" text NOT NULL
);

INSERT INTO "specimen_comments" ("Specimen ID", "User", "Comment") 
SELECT "ID", '{"full_name": "' || "Initials" || '"}', "Comment" FROM "Specimen" T1 where "Comment" IS NOT NULL AND "Comment" != '';

ALTER TABLE "specimen_comments" ALTER COLUMN "User" TYPE json USING "User"::json;

CREATE FUNCTION comments_trigger_before() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        varClient json;
    BEGIN
	    -- raise notice 'update experiment_comments';
	    SELECT _ermrest.current_client_obj() INTO varClient;
	    NEW."User" := varClient;
        RETURN NEW;
    END;
$$;

CREATE TRIGGER experiment_comments_trigger_before BEFORE INSERT OR UPDATE ON "experiment_comments" FOR EACH ROW EXECUTE PROCEDURE comments_trigger_before();
CREATE TRIGGER scan_comments_trigger_before BEFORE INSERT OR UPDATE ON "scan_comments" FOR EACH ROW EXECUTE PROCEDURE comments_trigger_before();
CREATE TRIGGER slide_comments_trigger_before BEFORE INSERT OR UPDATE ON "slide_comments" FOR EACH ROW EXECUTE PROCEDURE comments_trigger_before();
CREATE TRIGGER specimen_comments_trigger_before BEFORE INSERT OR UPDATE ON "specimen_comments" FOR EACH ROW EXECUTE PROCEDURE comments_trigger_before();

ALTER TABLE "Experiment" DROP COLUMN "Comment";
ALTER TABLE "Scan" DROP COLUMN "Comment";
ALTER TABLE "Slide" DROP COLUMN "Comment";

DROP FUNCTION specimen_trigger_before() CASCADE;

CREATE FUNCTION specimen_trigger_before() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        sample_name text;
        initials text;
        id_prefix text;
        specimen_comment text;
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
		IF (NEW."ID" IS NULL) THEN
			specimen_comment := '';
		ELSE
			specimen_comment := (SELECT "Comment" FROM "Microscopy"."specimen_comments" "specimen_comments" WHERE "specimen_comments"."Specimen ID" = NEW."ID" LIMIT 1);
			IF (specimen_comment IS NULL) THEN
				specimen_comment := '';
			END IF;
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
		sample_name := (SELECT species.code || tissue.code || NEW."Age Value" || age.code || gene.code || NEW."Specimen Identifier" FROM "Microscopy".species species, "Microscopy".tissue tissue, "Microscopy".age age, "Microscopy".gene gene WHERE species.term = NEW."Species" AND tissue.term = NEW."Tissue" AND age.term = NEW."Age Unit" AND gene.term = NEW."Gene"); 
		NEW."Label" := 'ID=' || "Microscopy".urlencode(NEW."ID") ||
			'&' || "Microscopy".urlencode('Section Date') || '=' || "Microscopy".urlencode('' || NEW."Section Date") ||
			'&' || "Microscopy".urlencode('Sample Name') || '=' || "Microscopy".urlencode(sample_name) ||
			'&Initials=' || "Microscopy".urlencode(initials) ||
			'&Disambiguator=' || "Microscopy".urlencode(NEW."Disambiguator") ||
			'&Comment=' || "Microscopy".urlencode(specimen_comment);
        RETURN NEW;
    END;
$$;

CREATE TRIGGER specimen_trigger_before BEFORE INSERT OR UPDATE ON "Specimen" FOR EACH ROW EXECUTE PROCEDURE specimen_trigger_before();

CREATE FUNCTION specimen_comments_after_update_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
		UPDATE "Microscopy"."Specimen" SET "Label" = '' WHERE "ID" = NEW."Specimen ID";
        RETURN NEW;
    END;
$$;

CREATE TRIGGER specimen_comments_after_update_trigger AFTER INSERT OR UPDATE ON "specimen_comments" FOR EACH ROW EXECUTE PROCEDURE specimen_comments_after_update_trigger();

CREATE FUNCTION specimen_comments_after_delete_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
		UPDATE "Microscopy"."Specimen" SET "Label" = '' WHERE "ID" = OLD."Specimen ID";
        RETURN OLD;
    END;
$$;

CREATE TRIGGER specimen_comments_after_delete_trigger AFTER DELETE ON "specimen_comments" FOR EACH ROW EXECUTE PROCEDURE specimen_comments_after_delete_trigger();

ALTER TABLE "Specimen" DROP COLUMN "Comment";

SELECT _ermrest.model_change_event();

COMMIT;
