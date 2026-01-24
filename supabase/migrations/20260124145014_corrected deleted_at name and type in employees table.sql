alter table "public"."employees" drop column "deletec_at";

alter table "public"."employees" add column "deleted_at" timestamp with time zone;


