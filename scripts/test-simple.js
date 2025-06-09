console.log("🧪 Простой тест");
console.log("Node.js версия:", process.version);
console.log("Текущая директория:", process.cwd());

// Проверяем, что Express работает
try {
  const express = require("express");
  console.log("✅ Express найден");
  
  const app = express();
  app.get("/", (req, res) => {
    res.json({ message: "Тест работает!" });
  });
  
  const server = app.listen(3002, () => {
    console.log("✅ Сервер запущен на http://localhost:3002");
    console.log("🧪 Тест: curl http://localhost:3002");
    
    // Автоматически останавливаем через 5 секунд
    setTimeout(() => {
      server.close();
      console.log("✅ Тест завершен");
      process.exit(0);
    }, 5000);
  });
  
} catch (error) {
  console.error("❌ Ошибка:", error.message);
  process.exit(1);
}
