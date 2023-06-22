<script>
	import aboutData from '../data/about.js';
</script>

<section id="about">
	<h2>About Me</h2>
	<div class="about-info">
		<p><strong>Name:</strong> {aboutData.name}</p>
		<p><strong>Bio:</strong> {aboutData.bio}</p>
		<p><strong>Age:</strong> {aboutData.age}</p>
		<p><strong>Location:</strong> {aboutData.location}</p>
		<p><strong>Email:</strong> {aboutData.email}</p>
	</div>
	<div class="socials">
		<h3>Socials</h3>
		<ul>
			{#each aboutData.socials as social}
				<li><a href={social.url} target="_blank">{social.name}</a></li>
			{/each}
		</ul>
	</div>
</section>

<style>
	#about {
		padding: 2rem;
		background-color: rgba(245, 245, 245, 0.9); /* Add transparency with alpha value */
		border-radius: 5px;
		margin-bottom: 2rem;
	}

	h2 {
		color: #333;
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.about-info {
		margin-bottom: 1.5rem;
	}

	.about-info p {
		margin: 0;
		line-height: 1.5;
		color: #555;
	}

	.about-info strong {
		font-weight: bold;
	}

	.socials {
		margin-top: 1.5rem;
	}

	.socials h3 {
		margin-bottom: 0.5rem;
		color: #333;
	}

	.socials ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.socials li {
		margin-bottom: 0.5rem;
	}

	.socials a {
		color: #555;
		text-decoration: none;
		transition: color 0.3s ease;
	}

	.socials a:hover {
		color: #888;
	}
</style>
