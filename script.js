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

const lastSuggestedProject = {
    Monday: null,
    Tuesday: null,
    Wednesday: null,
    Thursday: null,
    Friday: null,
    Saturday: null,
    Sunday: null
};

function showHome() {
    document.getElementById('home').style.display = 'block';
    document.getElementById('addProject').style.display = 'none';
    document.getElementById('todayInput').style.display = 'none';
    document.getElementById('weeklyPlanner').style.display = 'none';
    document.getElementById('suggestedProject').style.display = 'none';
    displayProjects();
}

function showAddProject() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('addProject').style.display = 'block';
}

function showTodayInput() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('todayInput').style.display = 'block';
}

function showWeeklyPlanner() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('weeklyPlanner').style.display = 'block';
    displayWeeklySchedule();
}

function displayProjects() {
    projectList.innerHTML = '';
    projects.forEach((project, index) => {
        const li = document.createElement('li');
        li.textContent = `${project.name} (Importance: ${project.importance}, Difficulty: ${project.difficulty}, Time: ${project.time} hrs)`;
        li.appendChild(createDeleteButton(index));
        projectList.appendChild(li);
    });
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
        difficulty: document.getElementById('projectDifficulty').value,
        time: document.getElementById('projectTime').value,
        importance: document.getElementById('projectImportance').value,
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
    saveScheduleHistory(today, optimizedProjects);
    displayWeeklySchedule();
    showWeeklyPlanner();
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

function assignProjectToDay(project, day) {
    weeklySchedule[day].push(project);
    displayWeeklySchedule();
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
    days.slice(todayIndex + 1).forEach((day, index) => {
        let availableTime = 2; // Limit to 2 hours per day
        weeklySchedule[day] = [];
        projects.sort((a, b) => {
            let scoreA = a.importance * 2 - a.difficulty + a.time;
            let scoreB = b.importance * 2 - b.difficulty + b.time;
            return scoreB - scoreA;
        });

        projects.forEach(project => {
            if (availableTime >= project.time && project.name !== lastSuggestedProject[days[index]]) {
                weeklySchedule[day].push(project);
                availableTime -= project.time;
                lastSuggestedProject[day] = project.name;
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
