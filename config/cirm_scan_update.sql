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
		probes := (SELECT "Probes" FROM "Microscopy"."Scan" WHERE "Microscopy"."Scan"."Experiment ID" = NEW."ID");
		IF probes != NEW."Probes" THEN
			UPDATE "Microscopy"."Scan" set "Probes" = NEW."Probes" WHERE "Microscopy"."Scan"."Experiment ID" = NEW."ID";
		END IF;
        RETURN NEW;
    END;
$$;

CREATE TRIGGER experiment_trigger_after AFTER INSERT OR UPDATE ON "Experiment" FOR EACH ROW EXECUTE PROCEDURE experiment_trigger_after();

select _ermrest.model_change_event();

COMMIT;
