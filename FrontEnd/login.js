const form = document.querySelector(".login-form");

// 🟢 ДОБАВЛЕНО: ссылка на элемент <p class="error-message">
const errorMessage = document.querySelector(".error-message");
window.addEventListener("pageshow", () => {
  errorMessage.style.display = "none";
}); 

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 🟢 ДОБАВЛЕНО: скрыть прошлое сообщение об ошибке
  errorMessage.style.display = "none";

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value.trim();

  // 🔴 ЗАМЕНА alert → вывод текста ошибки
  if (!email || !password) {
    errorMessage.textContent = "Veuillez remplir tous les champs.";
    errorMessage.style.display = "block";
    return;
  }

  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    console.log(response);

    // 🔴 ЗАМЕНЕНО ВСЁ управление ошибками
    if (!response.ok) {

      if (response.status === 404 || response.status === 401) {
        // 🔴 Теперь одно красивое сообщение
        errorMessage.textContent = "Email ou mot de passe incorrect";
      } else {
        errorMessage.textContent = "Erreur serveur, veuillez réessayer.";
      }

      errorMessage.style.display = "block"; // 🟢 добавлено
      return;
    }

    const data = await response.json();
    console.log(data);
       console.log(data.userId);
console.log(data.token);

    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
 

    // 🟢 На всякий случай скрыть ошибку
    errorMessage.style.display = "none";

    window.location.href = "index.html";
 
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);

    // 🔴 ЗАМЕНА alert → сообщение под формой
    errorMessage.textContent =
      "Impossible de se connecter, vérifiez votre connexion au serveur.";
    errorMessage.style.display = "block";
  }
});
