const projectList = document.getElementById('projectList');
const projectForm = document.querySelector('#addProject form');
const fatigueInput = document.getElementById('todayFatigueLevel');
const hoursInput = document.getElementById('hoursAvailable');
const suggestedProjectDetails = document.getElementById('suggestedProjectDetails');
const calendar = document.getElementById('calendar');
const confirmationMessage = document.createElement('div');
confirmationMessage.id = 'confirmationMessage';
document.body.appendChild(confirmationMessage);

let projects = JSON.parse(localStorage.getItem('projects')) || [];
let scheduleHistory = JSON.parse(localStorage.getItem('scheduleHistory')) || [];

const weeklySchedule = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
};

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
}

function showHome() {
    showPage('home');
    displayProjects();
}

function showAddProject() {
    showPage('addProject');
}

function showTodayInput() {
    showPage('todayInput');
}

function showWeeklyPlanner() {
    showPage('weeklyPlanner');
    displayWeeklySchedule();
}

function showCalendarPage() {
    showPage('calendarPage');
}

function displayProjects() {
    projectList.innerHTML = '';
    projects.forEach((project, index) => {
        const li = document.createElement('li');
        li.textContent = `${project.name} (Importance: ${project.importance}, Difficulty: ${project.difficulty}, Time: ${project.time} hrs)`;
        li.appendChild(createEditButton(index));
        li.appendChild(createDeleteButton(index));
        projectList.appendChild(li);
    });
}

function createEditButton(index) {
    const btn = document.createElement('button');
    btn.textContent = 'Edit';
    btn.onclick = () => {
        // Edit functionality
        const project = projects[index];
        const newTime = prompt(`Edit time for ${project.name}`, project.time);
        if (newTime !== null) {
            project.time = parseFloat(newTime);
            localStorage.setItem('projects', JSON.stringify(projects));
            displayProjects();
            autoSuggestWeeklyProjects(); // Recalculate weekly suggestions after editing
        }
    };
    return btn;
}

function createDeleteButton(index) {
    const btn = document.createElement('button');
    btn.textContent = 'Delete';
    btn.onclick = () => {
        projects.splice(index, 1);
        localStorage.setItem('projects', JSON.stringify(projects));
        displayProjects();
        autoSuggestWeeklyProjects(); // Recalculate weekly suggestions after deletion
    };
    return btn;
}

function saveProject(event) {
    event.preventDefault();
    const newProject = {
        name: document.getElementById('projectName').value,
        difficulty: parseFloat(document.getElementById('projectDifficulty').value),
        time: parseFloat(document.getElementById('projectTime').value),
        importance: parseFloat(document.getElementById('projectImportance').value),
    };
    projects.push(newProject);
    localStorage.setItem('projects', JSON.stringify(projects));
    projectForm.reset();
    showHome();
    showConfirmation('Project added successfully!');
    autoSuggestWeeklyProjects(); // Recalculate weekly suggestions after adding a new project
}

function optimizeToday(event) {
    event.preventDefault();
    const fatigueLevel = parseFloat(fatigueInput.value);
    const hoursAvailable = Math.min(12, parseFloat(hoursInput.value)); // Limit to 12 hours max

    let availableTime = hoursAvailable;
    let optimizedProjects = [];

    projects.sort((a, b) => {
        let scoreA = a.importance * 2 - a.difficulty + (5 - fatigueLevel) * a.time;
        let scoreB = b.importance * 2 - b.difficulty + (5 - fatigueLevel) * b.time;
        return scoreB - scoreA;
    });

    projects.forEach(project => {
        if (availableTime >= project.time) {
            optimizedProjects.push(project);
            availableTime -= project.time;
        }
    });

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    weeklySchedule[today] = optimizedProjects;
    displayTodayProjects(optimizedProjects);
}

function displayTodayProjects(projects) {
    suggestedProjectDetails.innerHTML = '';
    projects.forEach(project => {
        const p = document.createElement('p');
        p.textContent = `${project.name} (Importance: ${project.importance}, Difficulty: ${project.difficulty}, Time: ${project.time} hrs)`;
        suggestedProjectDetails.appendChild(p);
    });
}

function displayWeeklySchedule() {
    calendar.innerHTML = '';
    for (const day in weeklySchedule) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.innerHTML = `<h3>${day}</h3>`;
        const dayList = document.createElement('ul');

        weeklySchedule[day].forEach((project, index) => {
            const li = document.createElement('li');
            li.textContent = `${project.name} (Importance: ${project.importance}, Difficulty: ${project.difficulty}, Time: ${project.time} hrs)`;
            li.appendChild(createRemoveFromDayButton(day, index));
            dayList.appendChild(li);
        });

        dayDiv.appendChild(dayList);
        calendar.appendChild(dayDiv);
    }
}

function createRemoveFromDayButton(day, index) {
    const btn = document.createElement('button');
    btn.textContent = 'Remove';
    btn.onclick = () => {
        weeklySchedule[day].splice(index, 1);
        displayWeeklySchedule();
    };
    return btn;
}

function showConfirmation(message) {
    confirmationMessage.textContent = message;
    confirmationMessage.style.display = 'block';
    setTimeout(() => {
        confirmationMessage.style.display = 'none';
    }, 3000);
}

function autoSuggestWeeklyProjects() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const todayIndex = new Date().getDay() - 1; // Sunday is 0, Monday is 1, etc.
    const usedProjects = new Set();
    let tempProjects = JSON.parse(JSON.stringify(projects)); // Create a deep copy of the projects array

    days.slice(todayIndex + 1).forEach((day) => {
        let availableTime = 2; // Limit to 2 hours per day
        weeklySchedule[day] = [];
        tempProjects.sort((a, b) => {
            let scoreA = a.importance * 2 - a.difficulty + a.time;
            let scoreB = b.importance * 2 - b.difficulty + b.time;
            return scoreB - scoreA;
        });

        tempProjects.forEach(project => {
            if (availableTime > 0 && project.time > 0 && !usedProjects.has(project.name)) {
                const timeToUse = Math.min(availableTime, project.time);
                weeklySchedule[day].push({ ...project, time: timeToUse });
                project.time -= timeToUse;
                availableTime -= timeToUse;

                if (project.time === 0) {
                    usedProjects.add(project.name);
                }
            }
        });
    });

    displayWeeklySchedule();
}

function saveScheduleHistory(day, projects) {
    const date = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    scheduleHistory.push({ date, day, projects });
    localStorage.setItem('scheduleHistory', JSON.stringify(scheduleHistory));
}

document.getElementById('addProject').querySelector('form').onsubmit = saveProject;
document.getElementById('todayInput').querySelector('form').onsubmit = optimizeToday;

showHome();
autoSuggestWeeklyProjects(); // Initial calculation for weekly suggestions

function loadWeeklyPlanner() {
    const today = new Date();
    const weeklyPlanner = document.getElementById('calendar');
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayElements = weeklyPlanner.getElementsByClassName('day');

    for (let i = 0; i < dayElements.length; i++) {
        const dayName = daysOfWeek[i];
        const date = new Date(today);
        date.setDate(today.getDate() - today.getDay() + i);

        const dateString = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        dayElements[i].innerHTML = `<h2>${dayName} (${dateString})</h2><ul></ul>`;
    }

    // Load projects into the corresponding days
    const projects = getProjects();
    projects.forEach(project => {
        const li = document.createElement('li');
        li.textContent = `${project.id} (Importance: ${project.importance}, Difficulty: ${project.difficulty}, Time: ${project.time} hrs)`;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => {
            removeProject(project.id);
            loadWeeklyPlanner();
        };
        li.appendChild(removeButton);

        const projectDayIndex = (today.getDay() + project.id) % 7; // Just a mock for assigning projects to days
        dayElements[projectDayIndex].querySelector('ul').appendChild(li);
    });
}

// Call loadWeeklyPlanner when the page loads
document.addEventListener('DOMContentLoaded', loadWeeklyPlanner);


