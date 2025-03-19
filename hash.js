import bcrypt from "bcryptjs";

const inputPassword = "123"; // Replace with your test password
const hashedPassword = "$2b$10$gqBb4cRL6x9U6XS5SaLyUu5Xp2LrHlYmik..SQ9LQKrH7xh.a9y8e"; // Paste the hash from DB

bcrypt.compare(inputPassword, hashedPassword).then((match) => {
  console.log("Password Match?", match);
});
