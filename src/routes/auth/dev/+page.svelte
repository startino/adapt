<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  
  export let form: ActionData;
</script>

<div class="flex min-h-screen items-center justify-center">
  <div class="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-md">
    <div class="mb-6 rounded-md bg-yellow-50 border-l-4 border-yellow-500 p-4 text-yellow-700">
      <h2 class="font-bold">Development Mode Only</h2>
      <p>This login bypasses email verification. Use only for development.</p>
    </div>
    
    <h1 class="mb-6 text-2xl font-bold text-gray-800">Dev Login</h1>
    
    <form method="post" action="?/login" use:enhance class="space-y-6">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autocomplete="email"
          class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        />
      </div>
      
      {#if form?.error}
        <div class="rounded-md bg-red-50 p-4 text-red-700">
          <p>{form.error}</p>
        </div>
      {/if}
      
      <button
        type="submit"
        class="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Login Immediately (Skip Email)
      </button>
    </form>
  </div>
</div> 