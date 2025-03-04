<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
</script>

<div class="container flex h-screen w-screen flex-col items-center justify-center">
	<Card class="w-[350px]">
		<CardHeader>
			<CardTitle>Check your email</CardTitle>
			<CardDescription>
				We've sent you a verification link. Please check your email to verify your account.
			</CardDescription>
		</CardHeader>
		<CardContent>
			<p class="text-muted-foreground text-sm">
				If you don't see the email, check your spam folder.
			</p>
		</CardContent>
		<CardFooter>
			<Button
				variant="outline"
				class="w-full"
				onclick={() => (window.location.href = '/auth/login')}
			>
				Back to Login
			</Button>
		</CardFooter>
	</Card>
</div>
