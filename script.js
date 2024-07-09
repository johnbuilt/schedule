const projectList = document.getElementById('projectList');
const projectForm = document.querySelector('form');
const fatigueInput = document.getElementById('fatigueLevel');
const suggestedProjectDetails = document.getElementById('suggestedProjectDetails');

let projects = JSON.parse(localStorage.getItem('projects')) || [];

function showHome() {
    document.getElementById('home').style.display = 'block';
    document.getElementById('addProject').style.display = 'none';
    document.getElementById('dailyInput').style.display = 'none';
    document.getElementById('suggestedProject').style.display = 'none';
    displayProjects();
}

function showAddProject() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('addProject').style.display = 'block';
}

function showDailyInput() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('dailyInput').style.display = 'block';
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
}

function suggestProject() {
    const fatigueLevel = parseFloat(fatigueInput.value);

    projects.sort((a, b) => {
        let scoreA = a.importance * 2 - a.difficulty + (5 - fatigueLevel) * a.time;
        let scoreB = b.importance * 2 - b.difficulty + (5 - fatigueLevel) * b.time;
        return scoreB - scoreA;
    });

    const bestProject = projects[0];
    suggestedProjectDetails.textContent = bestProject 
        ? `${bestProject.name} (Importance: ${bestProject.importance}, Difficulty: ${bestProject.difficulty}, Time: ${bestProject.time} hrs)`
        : 'No projects available';
    document.getElementById('home').style.display = 'none';
    document.getElementById('suggestedProject').style.display = 'block';
}

showHome();

const weeklySchedule = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
};

function showWeeklyView() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('weeklyView').style.display = 'block';
    displayWeeklySchedule();
}

function displayWeeklySchedule() {
    const weeklyScheduleDiv = document.getElementById('weeklySchedule');
    weeklyScheduleDiv.innerHTML = '';

    for (const day in weeklySchedule) {
        const dayDiv = document.createElement('div');
        dayDiv.innerHTML = `<h3>${day}</h3>`;
        const dayList = document.createElement('ul');

        weeklySchedule[day].forEach(project => {
            const li = document.createElement('li');
            li.textContent = `${project.name} (Importance: ${project.importance}, Difficulty: ${project.difficulty}, Time: ${project.time} hrs)`;
            dayList.appendChild(li);
        });

        dayDiv.appendChild(dayList);
        weeklyScheduleDiv.appendChild(dayDiv);
    }
}

function assignProjectToDay(project, day) {
    weeklySchedule[day].push(project);
    displayWeeklySchedule();
}

document.getElementById('addProject').querySelector('form').onsubmit = function(event) {
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
};

showHome();
