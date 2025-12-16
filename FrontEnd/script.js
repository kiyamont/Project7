// =====================
// Глобальные переменные
// =====================
const galerie = document.querySelector(".gallery");
const filtersContainer = document.querySelector(".filters");
let travaux = []; // все проекты будут здесь

// =====================
// Функция для отображения проектов
// =====================
function afficherTravaux(arrayTravaux) {
  if (!galerie) return;

  galerie.innerHTML = ""; // очищаем галерею

  arrayTravaux.forEach((travail) => {
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    image.src = travail.imageUrl;
    image.alt = travail.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = travail.title;

    figure.appendChild(image);
    figure.appendChild(figcaption);
    galerie.appendChild(figure);
  });
}

// =====================
// Функция для загрузки проектов с API
// =====================
async function chargerTravaux() {
  try {
    const reponse = await fetch("http://localhost:5678/api/works");
    travaux = await reponse.json(); // сохраняем глобально

    afficherTravaux(travaux); // показываем все проекты сразу
  } catch (erreur) {
    console.error("Erreur lors du chargement des travaux :", erreur);
  }
}

// =====================
// Функция для создания фильтров
// =====================
async function chargerCategories() {
  if (!filtersContainer) return;

  try {
    const reponse = await fetch("http://localhost:5678/api/categories");
    const categories = await reponse.json();

    // Кнопка "Tous"
    const btnTous = document.createElement("button");
    btnTous.textContent = "Tous";
    btnTous.classList.add("active");
    btnTous.addEventListener("click", () => {
      setActiveFilterButton(btnTous);
      afficherTravaux(travaux);
    });
    filtersContainer.appendChild(btnTous);

    // Кнопки для каждой категории
    categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.textContent = cat.name;
      btn.addEventListener("click", () => {
        setActiveFilterButton(btn);
        const travauxFiltres = travaux.filter((t) => t.categoryId === cat.id);
        afficherTravaux(travauxFiltres);
      });
      filtersContainer.appendChild(btn);
    });
  } catch (erreur) {
    console.error("Erreur lors du chargement des catégories :", erreur);
  }
}

// небольшая вспомогательная для активной кнопки фильтра
function setActiveFilterButton(activeBtn) {
  const buttons = filtersContainer.querySelectorAll("button");
  buttons.forEach((b) => b.classList.remove("active"));
  activeBtn.classList.add("active");
}

// =====================
// Инициализация
// =====================
async function init() {
  await chargerTravaux(); // загружаем проекты
  await chargerCategories(); // создаём кнопки фильтров

  initAuthUI();
  initModal();
}

init();

// ==================================================
// УПРАВЛЕНИЕ LOGIN / LOGOUT + режим редактирования
// ==================================================

function initAuthUI() {
  // Проверяем, есть ли токен → пользователь авторизован
  const token = localStorage.getItem("token");
  const isLoggedIn = token !== null;

  // Находим ссылку <a id="login-link"> в меню
  const loginLink = document.getElementById("login-link");

  // ===== Текст третьего абзаца при логине =====
  if (isLoggedIn) {
    const introParagraphs = document.querySelectorAll("#introduction article p");
    if (introParagraphs.length >= 3) {
      introParagraphs[2].textContent =
        "En cas de besoin, une équipe pluridisciplinaire constituée de : architecte DPLG, décorateur(trice).";
    }
  }

  // ===== login ↔ logout =====
  if (loginLink) {
    if (isLoggedIn) {
      // Меняем текст "login" на "logout"
      loginLink.textContent = "logout";
      loginLink.removeAttribute("href");
      loginLink.style.cursor = "pointer";

      loginLink.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.reload();
      });
    } else {
      // не авторизован → ссылка ведёт на login.html
      loginLink.textContent = "login";
      loginLink.setAttribute("href", "login.html");
      loginLink.style.cursor = "pointer";
    }
  }

  // ===== Панель "Mode édition" + кнопка modifier =====
  const editBtn = document.getElementById("edit-btn");
  const editionBanner = document.getElementById("edition-banner");

  if (isLoggedIn) {
    // Показать кнопку "modifier"
    if (editBtn) {
      editBtn.style.display = "flex";
    }

    // Скрыть фильтры
    if (filtersContainer) {
      filtersContainer.style.display = "none";
    }

    // Показать чёрную панель "Mode édition"
    if (editionBanner) {
      editionBanner.style.display = "flex";
      document.body.classList.add("with-banner");
    }
  }
}

// ==================================================
// MODALE : Открытие / закрытие + логика
// ==================================================

function initModal() {
  const token = localStorage.getItem("token");
  const isLoggedIn = token !== null;

  const editBtn = document.getElementById("edit-btn");

  const modalOverlay = document.getElementById("modal-overlay");
  const modalCloseBtn = document.getElementById("modal-close");
  const modalBackBtn = document.getElementById("modal-back");
  const modalTitle = document.getElementById("modal-title");

  const modalGalleryPage = document.getElementById("modal-gallery-page");
  const modalFormPage = document.getElementById("modal-form-page");

  const modalGalleryContainer = document.getElementById("modal-gallery");
  const modalAddPhotoBtn = document.getElementById("modal-add-photo-btn");

  const modalAddForm = document.getElementById("modal-add-form");
  const modalImageInput = document.getElementById("modal-image-input");
  const modalImagePreview = document.getElementById("modal-image-preview");
  const modalImagePlaceholder = document.getElementById("modal-image-placeholder");
  const modalTitleInput = document.getElementById("modal-title-input");
  const modalCategorySelect = document.getElementById("modal-category-select");
  const modalErrorMessage = document.getElementById("modal-error-message");

  // Если модалки вообще нет в HTML — выходим
  if (!modalOverlay) return;

  // ---------- вспомогательные функции ----------

  function showModalGalleryPage() {
    if (!modalGalleryPage || !modalFormPage || !modalBackBtn || !modalTitle) return;

    modalGalleryPage.style.display = "block";
    modalFormPage.style.display = "none";
    modalBackBtn.style.display = "none";
    modalTitle.textContent = "Galerie photo";
    if (modalErrorMessage) modalErrorMessage.style.display = "none";
  }

  function showModalFormPage() {
    if (!modalGalleryPage || !modalFormPage || !modalBackBtn || !modalTitle) return;

    modalGalleryPage.style.display = "none";
    modalFormPage.style.display = "block";
    modalBackBtn.style.display = "inline-block";
    modalTitle.textContent = "Ajout photo";
    if (modalErrorMessage) modalErrorMessage.style.display = "none";
  }

  function openModal() {
    if (!isLoggedIn || !modalOverlay) return;

    modalOverlay.style.display = "flex";
    document.body.classList.add("modal-open");
    showModalGalleryPage();
    renderModalGallery();
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.style.display = "none";
    document.body.classList.remove("modal-open");
  }

  function renderModalGallery() {
    if (!modalGalleryContainer) return;

    modalGalleryContainer.innerHTML = "";

    travaux.forEach((travail) => {
      const figure = document.createElement("figure");
      figure.dataset.id = travail.id;

      const img = document.createElement("img");
      img.src = travail.imageUrl;
      img.alt = travail.title;

      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("modal-delete-btn");
      deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

      deleteBtn.addEventListener("click", () => {
        deleteWork(travail.id);
      });

      figure.appendChild(img);
      figure.appendChild(deleteBtn);
      modalGalleryContainer.appendChild(figure);
    });
  }

  async function deleteWork(id) {
    if (!token) return;

    const confirmDelete = confirm("Supprimer ce projet ?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Убираем из массива travaux
        travaux = travaux.filter((t) => t.id !== id);
        // Перерисовываем главную галерею
        afficherTravaux(travaux);
        // Перерисовываем модальную галерею
        renderModalGallery();
      } else {
        alert("Impossible de supprimer le projet.");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      alert("Erreur réseau lors de la suppression.");
    }
  }

  async function remplirCategoriesSelect() {
    if (!modalCategorySelect) return;

    try {
      const reponse = await fetch("http://localhost:5678/api/categories");
      const categories = await reponse.json();

      modalCategorySelect.innerHTML =
        '<option value="">Sélectionner une catégorie</option>';

      categories.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name;
        modalCategorySelect.appendChild(option);
      });
    } catch (erreur) {
      console.error(
        "Erreur lors du chargement des catégories pour la modale :",
        erreur
      );
    }
  }

  // ---------- EVENTS ----------

  // Открытие модалки по клику на "modifier"
  if (editBtn && isLoggedIn) {
    editBtn.addEventListener("click", openModal);
  }

  // Закрытие (крестик)
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeModal);
  }

  // Назад к галерее
  if (modalBackBtn) {
    modalBackBtn.addEventListener("click", showModalGalleryPage);
  }

  // Закрытие по клику вне окна
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  // Закрытие по ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.style.display === "flex") {
      closeModal();
    }
  });

  // Переход к форме + подгрузка категорий (один обработчик!)
  if (modalAddPhotoBtn) {
    modalAddPhotoBtn.addEventListener("click", () => {
      showModalFormPage();
      remplirCategoriesSelect();
    });
  }

  // Превью картинки
  if (modalImageInput && modalImagePreview && modalImagePlaceholder) {
    modalImageInput.addEventListener("change", () => {
      const file = modalImageInput.files[0];
      if (!file) return;

      const fileURL = URL.createObjectURL(file);
      modalImagePreview.src = fileURL;
      modalImagePreview.style.display = "block";
      modalImagePlaceholder.style.display = "none";
    });
  }

  // Отправка формы добавления
  if (modalAddForm) {
    modalAddForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (modalErrorMessage) modalErrorMessage.style.display = "none";

      const file = modalImageInput.files[0];
      const title = modalTitleInput.value.trim();
      const categoryId = modalCategorySelect.value;

      if (!file || !title || !categoryId) {
        if (modalErrorMessage) {
          modalErrorMessage.textContent =
            "Veuillez remplir tous les champs et choisir une image.";
          modalErrorMessage.style.display = "block";
        }
        return;
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", title);
      formData.append("category", categoryId);

      try {
        const response = await fetch("http://localhost:5678/api/works", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          if (modalErrorMessage) {
            modalErrorMessage.textContent =
              "Erreur lors de l'envoi du formulaire.";
            modalErrorMessage.style.display = "block";
          }
          return;
        }

        const newWork = await response.json();

        // Добавляем в массив travaux
        travaux.push(newWork);
        // Обновляем главную галерею
        afficherTravaux(travaux);
        // Обновляем модальную галерею для блога
        renderModalGallery();

        // Сброс формы
        modalAddForm.reset();
        if (modalImagePreview && modalImagePlaceholder) {
          modalImagePreview.style.display = "none";
          modalImagePlaceholder.style.display = "flex";
        }
        if (modalErrorMessage) modalErrorMessage.style.display = "none";

        // Возвращаемся на галерею
        showModalGalleryPage();
      } catch (error) {
        console.error("Erreur lors de l'ajout de projet :", error);
        if (modalErrorMessage) {
          modalErrorMessage.textContent =
            "Erreur réseau, veuillez réessayer.";
          modalErrorMessage.style.display = "block";
        }
      }
    });
  }
}
