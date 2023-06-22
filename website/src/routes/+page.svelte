<script>
	import Navbar from '../components/Navbar.svelte';
	import Footer from '../components/Footer.svelte';
	import Projects from '../components/Projects.svelte';
	import About from '../components/About.svelte';
	import Contact from '../components/Contact.svelte';

	let msg_to_dev =
		"hello, if you're reading this message it means you're either a developer like me or maybe accidentally hit your keyboard... anyways welcome to my website!";

	console.log(msg_to_dev);
</script>

<Navbar />

<main>
	<h1>Welcome to my Portfolio</h1>

	<section id="about">
		<About />
	</section>

	<section id="projects">
		<Projects />
	</section>

	<section id="contact">
		<Contact />
	</section>
</main>

<Footer />

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		color: #fff;
		overflow: auto;
		position: relative;
		/* background: linear-gradient(135deg, #0f380f, #000000); */
	}

	h1 {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}

	section {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1.5rem;
		margin-top: 2rem;
	}

	@keyframes gradientAnimation {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}

	main::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #0f380f, #000000);
		background-size: 600% 600%;
		animation: gradientAnimation 10s ease infinite;
		opacity: 0.96;
		z-index: -1;
	}
</style>
