const projectList = document.getElementById('projectList');
const projectForm = document.querySelector('form');
const fatigueInput = document.getElementById('todayFatigueLevel');
const hoursInput = document.getElementById('hoursAvailable');
const suggestedProjectDetails = document.getElementById('suggestedProjectDetails');
const calendar = document.getElementById('calendar');

let projects = JSON.parse(localStorage.getItem('projects')) || [];

const weeklySchedule = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
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
    // Ask user to assign the project to a day
    const day = prompt('Assign this project to a day of the week (e.g., Monday):');
    if (day && weeklySchedule[day]) {
        assignProjectToDay(newProject, day);
    }
}

function optimizeToday(event) {
    event.preventDefault();
    const fatigueLevel = parseFloat(fatigueInput.value);
    const hoursAvailable = parseFloat(hoursInput.value);

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

document.getElementById('addProject').querySelector('form').onsubmit = saveProject;
document.getElementById('todayInput').querySelector('form').onsubmit = optimizeToday;

showHome();
