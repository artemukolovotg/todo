CREATE DATABASE iq;

DROP TABLE IF EXISTS iq.public.column;

CREATE TABLE iq.public.column (
    id serial,
    name text,
    position serial
)

DROP TABLE IF EXISTS iq.public.task;

CREATE TABLE iq.public.task (
    id serial,
    name text,
    position serial,
    column_id integer
 )

DROP TABLE IF EXISTS iq.public.comment;

CREATE TABLE iq.public.comment (
    id serial,
    text text,
		task_id integer
 )

