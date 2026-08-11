-- เก็บแพ็กเกจที่ลูกค้ากดเลือกมาจากหน้าบริการ
-- ทุกคอลัมน์เป็น nullable เพราะคำขอที่มาจากหน้าติดต่อทั่วไปจะไม่มีแพ็กเกจติดมา
ALTER TABLE "Lead" ADD COLUMN "packageId" TEXT;
ALTER TABLE "Lead" ADD COLUMN "packageName" TEXT;
ALTER TABLE "Lead" ADD COLUMN "packagePriceTag" TEXT;

-- ลบแพ็กเกจแล้วคำขอเก่าต้องไม่หายไปด้วย จึงตั้งเป็น SET NULL
-- ชื่อและราคายังอยู่ในคอลัมน์ข้อความ ทีมขายจึงยังอ่านย้อนหลังได้
ALTER TABLE "Lead"
  ADD CONSTRAINT "Lead_packageId_fkey"
  FOREIGN KEY ("packageId") REFERENCES "ServicePackage"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Lead_packageId_idx" ON "Lead"("packageId");
