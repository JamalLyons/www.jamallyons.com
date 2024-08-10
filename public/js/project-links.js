/**
 * List of projects
 * @type {{name: string, github_url: string}[]}
 */
const projects = [
	{
		name: "Linux Toolbox",
		github_url: "https://github.com/ThatGuyJamal/jlt",
	},
	{
		name: "Data Structures and Algorithms using Rust",
		github_url:
			"https://github.com/ThatGuyJamal/Learn-Data-Structures-and-Algorithms",
	},
];

const projectsContainer = document.getElementById("project-links");

if (projects.length > 0) {
	for (let i = 0; i < projects.length; i++) {
		const listItem = document.createElement("li");
		const anchor = document.createElement("a");

		anchor.href = projects[i].github_url;
		anchor.textContent = projects[i].name;
		anchor.target = "_blank";

		listItem.appendChild(anchor);
		projectsContainer.appendChild(listItem);
	}
} else {
	const listItem = document.createElement("li");
	listItem.textContent = "Nothing public ... yet ;)";
	projectsContainer.appendChild(listItem);
}
