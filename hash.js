import bcrypt from "bcryptjs";

const run = async () => {
  const newPassword = "123456"; // ใส่รหัสใหม่ที่คุณต้องการตั้ง
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  console.log("Your New Hash:");
  console.log(hashedPassword);
};

run();
