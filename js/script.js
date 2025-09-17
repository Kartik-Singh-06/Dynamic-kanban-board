
let tasks = [];
let editingTask = null;
let draggedTaskId = null;

// DOM elements
const titleInput = dom.get('#taskTitle');
const descInput = dom.get('#taskDescription');
const addBtn = dom.get('#addBtn');
const dropZones = {
    todo: dom.get('#todo-zone'),
    inprogress: dom.get('#inprogress-zone'),
    done: dom.get('#done-zone')
};

// Initialize 
function init() {
    loadTasks();
    setupEventListeners();
    renderAllTasks();
}

// Load tasks from storage
function loadTasks() {
    tasks = storage.load('todoTasks');
}

// Save tasks to storage
function saveTasks() {
    storage.save('todoTasks', tasks);
}

// Setup all event listeners
function setupEventListeners() {
    // Form submission
    addBtn.addEventListener('click', handleAddTask);
    titleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddTask();
    });
    setupDragAndDrop();
}

// Handle add/edit task
function handleAddTask() {
    const title = titleInput.value;
    const description = descInput.value;
    
    // Validate
    const error = taskUtils.validateTask(title, description);
    if (error) {
        alert(error);
        return;
    }
    
    if (editingTask) {
        // Update existing task
        const taskIndex = tasks.findIndex(t => t.id === editingTask.id);
        tasks[taskIndex] = {
            ...editingTask,
            title: title.trim(),
            description: description.trim()
        };
        editingTask = null;
        addBtn.textContent = 'Add Task';
    } else {
        // Add new task
        const newTask = taskUtils.createTask(title, description);
        tasks.push(newTask);
    }
    
    clearForm();
    saveTasks();
    renderAllTasks();
}

function clearForm() {
    titleInput.value = '';
    descInput.value = '';
    titleInput.focus();
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        editingTask = task;
        titleInput.value = task.title;
        descInput.value = task.description;
        addBtn.textContent = 'Update Task';
        titleInput.focus();
    }
}

function deleteTask(taskId) {
    if (confirm('Delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderAllTasks();
    }
}

// Setup drag and drop
function setupDragAndDrop() {
    // Setup drop zones
    Object.entries(dropZones).forEach(([status, zone]) => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', (e) => handleDrop(e, status));
        zone.addEventListener('dragenter', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', (e) => {
            if (!zone.contains(e.relatedTarget)) {
                zone.classList.remove('drag-over');
            }
        });
    });
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e, newStatus) {
    e.preventDefault();
    
    // Remove drag-over class
    Object.values(dropZones).forEach(zone => {
        zone.classList.remove('drag-over');
    });
    
    if (draggedTaskId) {
        // Update task status
        const task = tasks.find(t => t.id === draggedTaskId);
        if (task && task.status !== newStatus) {
            task.status = newStatus;
            saveTasks();
            renderAllTasks();
        }
    }
    
    draggedTaskId = null;
}

// Create task card element
function createTaskCard(task) {
    const card = dom.create('div', 'task-card');
    card.draggable = true;
    card.dataset.taskId = task.id;
    
    // Drag events
    card.addEventListener('dragstart', (e) => {
        draggedTaskId = task.id;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });
    
    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        draggedTaskId = null;
    });
    
    card.innerHTML = `
        <div class="task-title">${task.title}</div>
        <div class="task-description">${task.description || 'No description'}</div>
        <div class="task-actions">
            <button class="edit-btn" onclick="editTask('${task.id}')">✏️</button>
            <button class="delete-btn" onclick="deleteTask('${task.id}')">🗑️</button>
        </div>
        
    `;
    
    return card;
}

// Render all tasks
function renderAllTasks() {
    // Clear all zones
    Object.values(dropZones).forEach(zone => dom.clear(zone));
    
    // Group tasks by status
    const tasksByStatus = {
        todo: tasks.filter(t => t.status === 'todo'),
        inprogress: tasks.filter(t => t.status === 'inprogress'),
        done: tasks.filter(t => t.status === 'done')
    };
    
    // Render tasks in each zone
    Object.entries(tasksByStatus).forEach(([status, statusTasks]) => {
        const zone = dropZones[status];
        statusTasks.forEach(task => {
            zone.appendChild(createTaskCard(task));
        });
    });
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
