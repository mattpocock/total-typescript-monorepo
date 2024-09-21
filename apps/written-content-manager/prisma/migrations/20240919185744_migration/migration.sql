-- AlterTable
CREATE SEQUENCE section_order_seq;
ALTER TABLE "Section" ALTER COLUMN "order" SET DEFAULT nextval('section_order_seq');
ALTER SEQUENCE section_order_seq OWNED BY "Section"."order";
