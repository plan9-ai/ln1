CREATE TABLE "uploaded_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"s3_path" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"created_at" integer NOT NULL
);
