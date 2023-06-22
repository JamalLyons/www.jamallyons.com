<script>
  import { scrollToSection } from '../scripts/scroll.js';
</script>

<nav>
  <ul>
    <li><a href="#about" on:click={scrollToSection}>About</a></li>
    <li><a href="#projects" on:click={scrollToSection}>Projects</a></li>
    <li><a href="#contact" on:click={scrollToSection}>Contact</a></li>
  </ul>
</nav>


<style>
	nav {
		background: #000;
		color: #fff;
		padding: 1rem;
	}

	ul {
		display: flex;
		justify-content: center;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li {
		margin: 0 1rem;
	}

	a {
		color: #fff;
		text-decoration: none;
		transition: opacity 0.3s ease;
	}

	a:hover {
		opacity: 0.7;
	}
</style>
