export const load = async ({ parent }) => {
	// Get parent data which includes the session
	const { session } = await parent();

	// If user is already logged in, redirect to home
	if (session) {
		return {
			redirect: '/'
		};
	}

	return {};
};
