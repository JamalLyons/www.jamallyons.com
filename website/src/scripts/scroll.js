/**
 * Scroll to section on click.
 * Helpful function that when a link is clicked, it scrolls to the section of the page with the same id as the link's href.
 * @param {{ preventDefault: () => void; target: { getAttribute: (arg0: string) => any; }; }} event
 */
export function scrollToSection(event) {
	event.preventDefault();
	const targetId = event.target.getAttribute('href');
	const targetSection = document.querySelector(targetId);

	if (targetSection) {
		window.scrollTo({
			top: targetSection.offsetTop,
			behavior: 'smooth'
		});
	}
}
