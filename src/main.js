document.addEventListener("DOMContentLoaded", () => {
	// --- Theme Toggle Logic ---
	const themeToggleBtn = document.getElementById("theme-toggle");
	const sunIcon = document.getElementById("sun-icon");
	const moonIcon = document.getElementById("moon-icon");

	// Set initial icon based on the class applied in the <head>
	if (document.documentElement.classList.contains("dark-mode")) {
		sunIcon.style.display = "block";
	} else {
		moonIcon.style.display = "block";
	}

	themeToggleBtn.addEventListener("click", () => {
		document.documentElement.classList.toggle("dark-mode");

		if (document.documentElement.classList.contains("dark-mode")) {
			localStorage.setItem("theme", "dark");
			sunIcon.style.display = "block";
			moonIcon.style.display = "none";
		} else {
			localStorage.setItem("theme", "light");
			moonIcon.style.display = "block";
			sunIcon.style.display = "none";
		}
	});

	// Select main layout elements to animate
	const animatedElements = document.querySelectorAll("header, .social-links, section, footer");

	// Add the base animation class to them dynamically
	animatedElements.forEach((el) => {
		el.classList.add("fade-in-section");
	});

	// Setup the Intersection Observer
	const observer = new IntersectionObserver(
		(entries, observer) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					// Add visibility class when element scrolls into view
					entry.target.classList.add("is-visible");
					// Stop observing once it has faded in
					observer.unobserve(entry.target);
				}
			});
		},
		{
			root: null,
			rootMargin: "0px",
			threshold: 0.15, // Triggers when 15% of the element is visible
		},
	);

	// Start observing each element
	animatedElements.forEach((el) => {
		observer.observe(el);
	});
});
