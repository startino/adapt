<script lang="ts">
	let { data } = $props();
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-4 text-2xl font-bold">Profiles</h1>

	<div class="overflow-x-auto">
		<table class="min-w-full border border-gray-300 bg-white">
			<thead>
				<tr>
					<th class="border-b px-4 py-2">Name</th>
					<th class="border-b px-4 py-2">Email</th>
					<th class="border-b px-4 py-2">Created At</th>
					<th class="border-b px-4 py-2">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.profiles as profile}
					<tr>
						<td class="border-b px-4 py-2">
							{profile.first_name}
							{profile.last_name}
						</td>
						<td class="border-b px-4 py-2">{profile.email}</td>
						<td class="border-b px-4 py-2">
							{new Date(profile.created_at).toLocaleDateString()}
						</td>
						<td class="border-b px-4 py-2">
							<a href="/app/profile/{profile.id}" class="text-blue-600 hover:text-blue-800">
								View
							</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
