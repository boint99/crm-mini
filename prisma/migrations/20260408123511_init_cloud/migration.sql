/*
  Warnings:

  - You are about to drop the column `EMPLOYEE_ID` on the `VIETTEL_EMPLOYEES` table. All the data in the column will be lost.
  - The `STATUS` column on the `VLANS` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "VIETTEL_EMPLOYEES" DROP CONSTRAINT "VIETTEL_EMPLOYEES_EMPLOYEE_ID_fkey";

-- AlterTable
ALTER TABLE "VIETTEL_EMPLOYEES" DROP COLUMN "EMPLOYEE_ID";

-- AlterTable
CREATE SEQUENCE vlans_vlan_id_seq;
ALTER TABLE "VLANS" ALTER COLUMN "VLAN_ID" SET DEFAULT nextval('vlans_vlan_id_seq'),
DROP COLUMN "STATUS",
ADD COLUMN     "STATUS" "NETWORK_STATUS" NOT NULL DEFAULT 'ACTIVE';
ALTER SEQUENCE vlans_vlan_id_seq OWNED BY "VLANS"."VLAN_ID";

-- AddForeignKey
ALTER TABLE "EMPLOYEES" ADD CONSTRAINT "EMPLOYEES_VIETTEL_ID_fkey" FOREIGN KEY ("VIETTEL_ID") REFERENCES "VIETTEL_EMPLOYEES"("VIETTEL_ID") ON DELETE SET NULL ON UPDATE CASCADE;
