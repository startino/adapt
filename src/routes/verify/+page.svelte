<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData;
</script>

<div class="flex min-h-screen items-center justify-center">
  <div class="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-md">
    {#if data.error}
      <div class="mb-6 rounded-md bg-red-50 p-4 text-red-700">
        <h2 class="mb-2 text-lg font-semibold">Verification Failed</h2>
        <p>{data.error}</p>
      </div>
      
      <a
        href="/"
        class="block w-full rounded-md bg-indigo-600 px-4 py-2 text-center text-white hover:bg-indigo-700"
      >
        Back to Home
      </a>
    {/if}
  </div>
</div> 