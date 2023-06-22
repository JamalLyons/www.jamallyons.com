<script>
	import info from '../data/about.js';
</script>

<div>
	<h2>Contact Information</h2>
	<div class="contact-box">
		<p class="email">Email: {info.email}</p>
	</div>
</div>

<style>
	h2 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
        text-align: center;
	}

	.contact-box {
		background-color: #f5f5f5;
		padding: 20px;
		border-radius: 5px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
	}

	.email {
		font-size: 18px;
		font-weight: bold;
		color: #333;
	}
</style>
