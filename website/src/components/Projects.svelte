<script>
	import projects from '../data/projects.js';
</script>

{#each projects as project}
	<card>
		<h2>{project.title}</h2>
		<img src={project.image} alt={`${project.title} image`} width="300" />
		<p>{project.description}</p>
		<p>Technologies used: {project.tech.join(', ')}</p>
		<a href={project.link} target="_blank">Showcase Link</a>
	</card>
{/each}

<style>
	card {
		padding: 1.5rem;
		background-color: rgba(0, 0, 0, 0.7);
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: calc(50% - 0.75rem);
		max-width: 300px;

		/* Card hover animation */
		transition: transform 0.3s ease-in-out;
		transform-origin: center center;
	}

	/* Hover affect for project cards */
	card:hover {
		transform: scale(1.05);
		box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
	}

	h2 {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

	img {
		width: 100%;
		max-height: 200px;
		object-fit: cover;
		border-radius: 4px;
		margin-bottom: 1rem;
	}

	p {
		margin-bottom: 0.5rem;
	}
</style>
