// Storage utilities
const storage = {
    save: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    },
    
    load: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return [];
        }
    }
};

// DOM utilities
const dom = {
    get: (selector) => document.querySelector(selector),
    getAll: (selector) => document.querySelectorAll(selector),
    
    create: (tag, className = '', content = '') => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    },
    
    clear: (element) => {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
};

// Task utilities
const taskUtils = {
    generateId: () => Date.now().toString(),
    
    createTask: (title, description) => ({
        id: taskUtils.generateId(),
        title: title.trim(),
        description: description.trim(),
        status: 'todo',
        createdAt: new Date().toISOString()
    }),
    
    validateTask: (title, description) => {
        if (!title.trim()) return 'Title is required';
        if (title.length > 100) return 'Title must be less than 100 characters';
        if (description.length > 300) return 'Description must be less than 300 characters';
        return null;
    }
};
