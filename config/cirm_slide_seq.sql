BEGIN;

SET search_path = "Microscopy";

--
-- Currently, the last 2 digits from the Seq. are used, and a Revision with the constant value '-000' is appended
-- Allow using 6 digits for the Seq. and exclude the Revision
-- The Seq. will be prepended with '0' such that the length will always be 6
--

DROP FUNCTION slide_trigger_before() CASCADE;

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
		IF (char_length('' || NEW."Seq.") > 3) THEN
			RAISE EXCEPTION 'Seq. cannot have more than 3 digits';
		END IF;
		seq := to_number('' || NEW."Seq.", '999999.99');
		IF NEW."ID" IS NULL THEN
			NEW."ID" := NEW."Specimen ID" || '-' || substring(('00' || seq) FROM '...$') || '-00';
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

SELECT _ermrest.model_change_event();

COMMIT;
