const socialLinks = [
	{ name: "YouTube", link: "https://www.youtube.com/@codingwithjamal" },
	{ name: "Twitter", link: "https://twitter.com/codingwithjamal" },
	{ name: "GitHub", link: "https://github.com/ThatGuyJamal" },
];

const socialLinksContainer = document.getElementById("social-links");

for (let i = 0; i < socialLinks.length; i++) {
	const listItem = document.createElement("li");
	const anchor = document.createElement("a");

	anchor.href = socialLinks[i].link;
	anchor.textContent = socialLinks[i].name;
	anchor.target = "_blank";

	listItem.appendChild(anchor);
	socialLinksContainer.appendChild(listItem);
}
