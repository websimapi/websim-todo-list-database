// Using modern JavaScript (ES modules) and WebsimSocket persistent records API
import { WebsimSocket } from 'https://cdn.jsdelivr.net/gh/websim-ai/websim-socket@latest/dist/websim-socket.module.js';

const room = new WebsimSocket();

// Cache DOM elements
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');

// Get persistent records collection for todos
const todoCollection = room.collection('todo');

// Utility function to create DOM element of a todo item
function renderTodoItem(todo) {
  const li = document.createElement('li');
  li.className = "todo-item";
  li.dataset.id = todo.id;
  if (todo.completed) {
    li.classList.add('completed');
  }

  const span = document.createElement('span');
  span.className = "text";
  span.textContent = todo.text;

  // Toggle complete status on click
  span.addEventListener('click', async () => {
    try {
      // Toggle the completed field
      await todoCollection.update(todo.id, { completed: !todo.completed });
    } catch (error) {
      console.error('Error updating todo status:', error);
    }
  });

  const delButton = document.createElement('button');
  delButton.textContent = '✕';
  delButton.addEventListener('click', async () => {
    try {
      await todoCollection.delete(todo.id);
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  });

  li.appendChild(span);
  li.appendChild(delButton);

  return li;
}

// Render the list using records, ensuring latest state management
function renderTodos(todos) {
  // Clear current list
  todoList.innerHTML = '';
  todos.forEach(todo => {
    const li = renderTodoItem(todo);
    todoList.appendChild(li);
  });
}

// Subscribe to changes in todo records. Records are returned in descending order of creation, so we reverse to show oldest first.
todoCollection.subscribe(function (todos) {
  // Reverse the list to show oldest first (if desired)
  renderTodos(todos.slice().reverse());
});

// Handle new todo submission without reloading the page
todoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;
  try {
    await todoCollection.create({
      text: text,
      completed: false,
    });
    todoInput.value = '';
  } catch (error) {
    console.error('Error creating todo:', error);
  }
});

// Below is an optional animation to draw attention when new todos are added
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .todo-item {
    animation: fadeIn 0.5s ease-out;
  }
`;
document.head.appendChild(style);

// Optional: We can use inline SVG for a decorative header icon (for pure creativity)
const headerIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
headerIcon.setAttribute("viewBox", "0 0 64 64");
headerIcon.setAttribute("width", "32");
headerIcon.setAttribute("height", "32");
headerIcon.innerHTML = `
  <circle cx="32" cy="32" r="30" fill="#28a745" opacity="0.2"/>
  <path d="M20 32 L28 40 L44 24" stroke="#28a745" stroke-width="4" fill="none" stroke-linecap="round"/>
`;
document.querySelector('#app h1').prepend(headerIcon);