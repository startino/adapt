import { PUBLIC_API_URL } from '$env/static/public';

const API_BASE_URL = PUBLIC_API_URL || 'http://localhost:8000';

export async function callAPI(payload: any) {
	return await fetch(`${API_BASE_URL}/api/v1/${payload.endpoint}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload.data)
	});
}
