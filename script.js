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
        let scoreA = a.importance * 2 - a.difficulty + (fatigueLevel / 5) * a.time;
        let scoreB = b.importance * 2 - b.difficulty + (fatigueLevel / 5) * b.time;
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
