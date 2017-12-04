--
-- Script to update the triggers for the number of slides/scans
---

BEGIN;

SET search_path = "Microscopy";

DROP FUNCTION slide_trigger_after_delete() CASCADE;
DROP FUNCTION scan_trigger_after_delete() CASCADE;

CREATE FUNCTION slide_trigger_after_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        counter integer;
    BEGIN
		counter := (SELECT count(*) FROM "Microscopy"."Slide" WHERE "Specimen ID" = OLD."Specimen ID");
		UPDATE "Microscopy"."Specimen" SET "Number of Slides" = counter WHERE "ID" = OLD."Specimen ID";
		IF OLD."Experiment ID" IS NOT NULL THEN
			counter := (SELECT count(*) FROM "Microscopy"."Slide" WHERE "Experiment ID" = OLD."Experiment ID");
			UPDATE "Microscopy"."Experiment" SET "Number of Slides" = counter WHERE "ID" = OLD."Experiment ID";
		END IF;
        RETURN OLD;
    END;
$$;

CREATE TRIGGER slide_trigger_after_delete AFTER DELETE ON "Slide" FOR EACH ROW EXECUTE PROCEDURE slide_trigger_after_delete();

CREATE FUNCTION scan_trigger_after_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        counter integer;
        specimen_id text;
        experiment_id text;
    BEGIN
		counter := (SELECT count(*) FROM "Microscopy"."Scan" WHERE "slide_id" = OLD.slide_id);
		UPDATE "Microscopy"."Slide" SET "Number of Scans" = counter WHERE "ID" = OLD.slide_id;
		specimen_id := (SELECT "Specimen ID" FROM "Microscopy"."Slide" WHERE "ID" = OLD.slide_id);
		counter := (SELECT sum("Number of Scans") FROM "Microscopy"."Slide" WHERE "Specimen ID" = specimen_id);
		UPDATE "Microscopy"."Specimen" SET "Number of Scans" = counter WHERE "ID" = specimen_id;
		experiment_id := (SELECT "Experiment ID" FROM "Microscopy"."Slide" WHERE "ID" = OLD.slide_id);
		IF experiment_id IS NOT NULL THEN
			counter := (SELECT sum("Number of Scans") FROM "Microscopy"."Slide" WHERE "Experiment ID" = experiment_id);
			UPDATE "Microscopy"."Experiment" SET "Number of Scans" = counter WHERE "ID" = experiment_id;
		END IF;
        RETURN OLD;
    END;
$$;

CREATE TRIGGER scan_trigger_after_delete AFTER DELETE ON "Scan" FOR EACH ROW EXECUTE PROCEDURE scan_trigger_after_delete();

SELECT _ermrest.model_change_event();

COMMIT;
