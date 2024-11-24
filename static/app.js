document.addEventListener("DOMContentLoaded", () => {
    const taskListElement = document.getElementById("task-list");
    const addTaskForm = document.getElementById("add-task-form");
    const taskDescInput = document.getElementById("task-desc");

    // Завантаження списку завдань із сервера
    async function loadTasks() {
        const response = await fetch("/tasks");
        const data = await response.json();
        renderTasks(data.tasks);
    }

    // Рендеринг списку завдань
    function renderTasks(tasks) {
        taskListElement.innerHTML = ""; // Очистити список перед рендерингом
        tasks.forEach(task => {
            const taskElement = document.createElement("li");
            taskElement.className = `list-group-item d-flex justify-content-between align-items-center ${
                task.completed ? "list-group-item-success" : ""
            }`;

            // Опис завдання
            const taskText = document.createElement("span");
            taskText.textContent = task.description;

            // Кнопки управління
            const buttonsContainer = document.createElement("div");

            // Кнопка позначення виконаного
            const toggleButton = document.createElement("button");
            toggleButton.className = "btn btn-sm btn-outline-success me-2";
            toggleButton.textContent = task.completed ? "Скасувати" : "Виконано";
            toggleButton.onclick = async () => {
                task.completed = !task.completed;
                await updateTask(task);
                await loadTasks();
            };

            // Кнопка видалення
            const deleteButton = document.createElement("button");
            deleteButton.className = "btn btn-sm btn-outline-danger me-2";
            deleteButton.textContent = "Видалити";
            deleteButton.onclick = async () => {
                await deleteTask(task.id);
                await loadTasks();
            };

            // Кнопка редагування
            const editButton = document.createElement("button");
            editButton.className = "btn btn-sm btn-outline-primary me-2";
            editButton.textContent = "Редагувати";
            editButton.onclick = () => {
                const newDescription = prompt("Редагувати опис завдання:", task.description);
                if (newDescription && newDescription.trim() !== task.description) {
                    task.description = newDescription.trim();
                    updateTask(task);
                    loadTasks();
                }
            };

            buttonsContainer.appendChild(toggleButton);
            buttonsContainer.appendChild(deleteButton);
            buttonsContainer.appendChild(editButton); // Додаємо кнопку редагування

            taskElement.appendChild(taskText);
            taskElement.appendChild(buttonsContainer);
            taskListElement.appendChild(taskElement);
        });
    }

    // Додавання нового завдання
    addTaskForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const description = taskDescInput.value.trim();
        if (description) {
            const newTask = { id: Date.now(), description, completed: false };
            await addTask(newTask);
            taskDescInput.value = ""; // Очистити поле вводу
            await loadTasks();
        }
    });

    // API-запити

    async function addTask(task) {
        await fetch("/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(task),
        });
    }

    async function deleteTask(id) {
        await fetch(`/delete/${id}`, {
            method: "POST",
        });
    }

    async function updateTask(task) {
        await fetch(`/update/${task.id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(task),
        });
    }

    // Ініціалізація
    loadTasks();
});
