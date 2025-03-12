<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import * as Card from '$lib/components/ui/card';
	import { Plus } from 'lucide-svelte';
	import type { UserHabit } from '$lib/server/db/schema';
	import type { DaySchedule } from '$lib/utils';
	import { onMount } from 'svelte';

	type Props = {
		userHabit: UserHabit;
		onScheduleChange: (schedules: DaySchedule[]) => void;
	};

	let { userHabit, onScheduleChange } = $props();

	// Default time for new schedules
	const DEFAULT_EVENT_TIME = '09:00';

	// Initialize schedules from userHabit or use default
	let schedules = $state<DaySchedule[]>(
		userHabit.daily_schedules && userHabit.daily_schedules.length > 0
			? validateAndFixSchedules(userHabit.daily_schedules)
			: [
					{
						day: 'Mon',
						active: true,
						schedules: [{ event_time: DEFAULT_EVENT_TIME, reminder_time: null }]
					},
					{
						day: 'Tue',
						active: true,
						schedules: [{ event_time: DEFAULT_EVENT_TIME, reminder_time: null }]
					},
					{
						day: 'Wed',
						active: true,
						schedules: [{ event_time: DEFAULT_EVENT_TIME, reminder_time: null }]
					},
					{
						day: 'Thu',
						active: true,
						schedules: [{ event_time: DEFAULT_EVENT_TIME, reminder_time: null }]
					},
					{
						day: 'Fri',
						active: true,
						schedules: [{ event_time: DEFAULT_EVENT_TIME, reminder_time: null }]
					},
					{
						day: 'Sat',
						active: true,
						schedules: [{ event_time: DEFAULT_EVENT_TIME, reminder_time: null }]
					},
					{
						day: 'Sun',
						active: true,
						schedules: [{ event_time: DEFAULT_EVENT_TIME, reminder_time: null }]
					}
				]
	);

	// Function to validate and fix schedules
	function validateAndFixSchedules(schedules: DaySchedule[]): DaySchedule[] {
		return schedules.map((day) => {
			// Make a copy of the day
			const fixedDay = { ...day, schedules: [...day.schedules] };

			// Fix each schedule
			fixedDay.schedules = fixedDay.schedules.map((schedule) => {
				// If there's a reminder time, make sure it's before the event time
				if (schedule.reminder_time) {
					const eventMinutes = timeToMinutes(schedule.event_time);
					const reminderMinutes = timeToMinutes(schedule.reminder_time);

					// If reminder is not before event time, set it to 30 minutes before
					if (reminderMinutes >= eventMinutes) {
						return {
							...schedule,
							reminder_time: minutesToTime(Math.max(0, eventMinutes - 30))
						};
					}
				}
				return schedule;
			});

			return fixedDay;
		});
	}

	// Map of day abbreviations to full names
	const dayNames: Record<string, string> = {
		Mon: 'Monday',
		Tue: 'Tuesday',
		Wed: 'Wednesday',
		Thu: 'Thursday',
		Fri: 'Friday',
		Sat: 'Saturday',
		Sun: 'Sunday'
	};

	// Currently selected day index
	let selectedDayIndex = $state(0);

	// Track invalid reminder inputs
	let invalidReminderInputs = $state<Record<string, boolean>>({});

	// Store references to reminder inputs
	let reminderInputs: Record<string, HTMLInputElement> = {};

	// Function to toggle day active state
	function toggleDayActive(dayIndex: number, active: boolean) {
		schedules[dayIndex].active = active;
		schedules = [...schedules];
		onScheduleChange(schedules);
	}

	// Function to update time for a specific schedule
	function updateTime(dayIndex: number, scheduleIndex: number, time: string) {
		const currentSchedule = schedules[dayIndex].schedules[scheduleIndex];
		currentSchedule.event_time = time;

		// If there's a reminder time, make sure it's still before the event time
		if (currentSchedule.reminder_time) {
			const eventMinutes = timeToMinutes(time);
			const reminderMinutes = timeToMinutes(currentSchedule.reminder_time);

			// If reminder is not before event time, set it to 30 minutes before
			if (reminderMinutes >= eventMinutes) {
				currentSchedule.reminder_time = minutesToTime(Math.max(0, eventMinutes - 30));
				// Mark this input as having been corrected
				const key = `${dayIndex}-${scheduleIndex}`;
				invalidReminderInputs[key] = true;
				invalidReminderInputs = { ...invalidReminderInputs };

				// Update the input element if it exists
				if (reminderInputs[key]) {
					reminderInputs[key].value = currentSchedule.reminder_time;
				}

				// Auto-clear the error message after 3 seconds
				setTimeout(() => {
					if (invalidReminderInputs[key]) {
						delete invalidReminderInputs[key];
						invalidReminderInputs = { ...invalidReminderInputs };
					}
				}, 3000);
			}
		}

		schedules = [...schedules];
		onScheduleChange(schedules);

		// Update max values for all reminder inputs
		updateReminderMaxValues();
	}

	// Function to toggle reminder for a specific schedule
	function toggleReminder(dayIndex: number, scheduleIndex: number, enabled: boolean) {
		const currentSchedule = schedules[dayIndex].schedules[scheduleIndex];

		if (enabled) {
			// Calculate a time 30 minutes before the event
			const eventMinutes = timeToMinutes(currentSchedule.event_time);
			const reminderMinutes = Math.max(0, eventMinutes - 30);
			currentSchedule.reminder_time = minutesToTime(reminderMinutes);

			// Clear any invalid flag when toggling on
			const key = `${dayIndex}-${scheduleIndex}`;
			if (invalidReminderInputs[key]) {
				delete invalidReminderInputs[key];
				invalidReminderInputs = { ...invalidReminderInputs };
			}
		} else {
			currentSchedule.reminder_time = null;

			// Clear any invalid flag when toggling off
			const key = `${dayIndex}-${scheduleIndex}`;
			if (invalidReminderInputs[key]) {
				delete invalidReminderInputs[key];
				invalidReminderInputs = { ...invalidReminderInputs };
			}
		}

		schedules = [...schedules];
		onScheduleChange(schedules);
	}

	// Function to update reminder time
	function updateReminderTime(dayIndex: number, scheduleIndex: number, time: string) {
		const currentSchedule = schedules[dayIndex].schedules[scheduleIndex];
		const eventMinutes = timeToMinutes(currentSchedule.event_time);
		const newReminderMinutes = timeToMinutes(time);
		const key = `${dayIndex}-${scheduleIndex}`;

		// Only update if the reminder time is before the event time
		if (newReminderMinutes < eventMinutes) {
			currentSchedule.reminder_time = time;

			// Clear any invalid flag
			if (invalidReminderInputs[key]) {
				delete invalidReminderInputs[key];
				invalidReminderInputs = { ...invalidReminderInputs };
			}
		} else {
			// If invalid, set to 30 minutes before the event
			const reminderMinutes = Math.max(0, eventMinutes - 30);
			currentSchedule.reminder_time = minutesToTime(reminderMinutes);

			// Mark this input as having been corrected
			invalidReminderInputs[key] = true;
			invalidReminderInputs = { ...invalidReminderInputs };

			// Update the input element if it exists
			if (reminderInputs[key]) {
				reminderInputs[key].value = currentSchedule.reminder_time;
			}

			// Auto-clear the error message after 3 seconds
			setTimeout(() => {
				if (invalidReminderInputs[key]) {
					delete invalidReminderInputs[key];
					invalidReminderInputs = { ...invalidReminderInputs };
				}
			}, 3000);
		}

		schedules = [...schedules];
		onScheduleChange(schedules);
	}

	// Helper function to convert time string (HH:MM) to minutes since midnight
	function timeToMinutes(time: string): number {
		const [hours, minutes] = time.split(':').map(Number);
		return hours * 60 + minutes;
	}

	// Helper function to convert minutes since midnight to time string (HH:MM)
	function minutesToTime(minutes: number): string {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
	}

	// Calculate the max time for a reminder based on event time
	function getMaxReminderTime(eventTime: string): string {
		const eventMinutes = timeToMinutes(eventTime);
		// Set max to 1 minute before event time
		return minutesToTime(Math.max(0, eventMinutes - 1));
	}

	// Get default reminder time (30 minutes before event)
	function getDefaultReminderTime(eventTime: string): string {
		const eventMinutes = timeToMinutes(eventTime);
		return minutesToTime(Math.max(0, eventMinutes - 30));
	}

	// Function to add a new time slot to a day
	function addTimeSlot(dayIndex: number) {
		schedules[dayIndex].schedules.push({ event_time: DEFAULT_EVENT_TIME, reminder_time: null });
		schedules = [...schedules];
		onScheduleChange(schedules);
	}

	// Function to remove a time slot from a day
	function removeTimeSlot(dayIndex: number, scheduleIndex: number) {
		if (schedules[dayIndex].schedules.length > 1) {
			schedules[dayIndex].schedules.splice(scheduleIndex, 1);

			// Clear any invalid flags for this slot
			const key = `${dayIndex}-${scheduleIndex}`;
			if (invalidReminderInputs[key]) {
				delete invalidReminderInputs[key];
				invalidReminderInputs = { ...invalidReminderInputs };
			}

			// Remove input reference
			if (reminderInputs[key]) {
				delete reminderInputs[key];
			}

			schedules = [...schedules];
			onScheduleChange(schedules);
		}
	}

	// Function to copy schedule to all days
	function copyToAllDays() {
		const sourceSchedules = schedules[selectedDayIndex].schedules;
		schedules = schedules.map((day, index) => {
			if (index !== selectedDayIndex) {
				return {
					...day,
					schedules: JSON.parse(JSON.stringify(sourceSchedules))
				};
			}
			return day;
		});

		// Clear all invalid flags when copying
		invalidReminderInputs = {};

		schedules = [...schedules];
		onScheduleChange(schedules);
	}

	// Register a reminder input element
	function registerReminderInput(
		dayIndex: number,
		scheduleIndex: number,
		element: HTMLInputElement
	) {
		const key = `${dayIndex}-${scheduleIndex}`;
		reminderInputs[key] = element;
	}

	// Update max values for all reminder inputs
	function updateReminderMaxValues() {
		// For each schedule with a reminder, update the max value
		schedules.forEach((day, dayIndex) => {
			day.schedules.forEach((schedule, scheduleIndex) => {
				if (schedule.reminder_time) {
					const key = `${dayIndex}-${scheduleIndex}`;
					if (reminderInputs[key]) {
						const maxTime = getMaxReminderTime(schedule.event_time);
						reminderInputs[key].max = maxTime;

						// If current value is greater than max, update it
						const currentMinutes = timeToMinutes(schedule.reminder_time);
						const maxMinutes = timeToMinutes(maxTime);
						if (currentMinutes > maxMinutes) {
							const newTime = minutesToTime(Math.max(0, timeToMinutes(schedule.event_time) - 30));
							schedule.reminder_time = newTime;
							reminderInputs[key].value = newTime;

							// Show error message
							invalidReminderInputs[key] = true;
							invalidReminderInputs = { ...invalidReminderInputs };

							// Auto-clear the error message after 3 seconds
							setTimeout(() => {
								if (invalidReminderInputs[key]) {
									delete invalidReminderInputs[key];
									invalidReminderInputs = { ...invalidReminderInputs };
								}
							}, 3000);
						}
					}
				}
			});
		});
	}

	// Handle reminder input changes
	function handleReminderInput(e: Event, dayIndex: number, scheduleIndex: number) {
		const target = e.currentTarget as HTMLInputElement;
		const inputTime = target.value;
		const eventTime = schedules[dayIndex].schedules[scheduleIndex].event_time;
		const key = `${dayIndex}-${scheduleIndex}`;

		// Check if the input time is valid (before event time)
		if (inputTime && eventTime) {
			const eventMinutes = timeToMinutes(eventTime);
			const inputMinutes = timeToMinutes(inputTime);

			if (inputMinutes >= eventMinutes) {
				// Calculate a valid time (30 minutes before event)
				const validTime = minutesToTime(Math.max(0, eventMinutes - 30));

				// Update the model
				schedules[dayIndex].schedules[scheduleIndex].reminder_time = validTime;

				// Force update the input value
				target.value = validTime;

				// Show error message
				invalidReminderInputs[key] = true;
				invalidReminderInputs = { ...invalidReminderInputs };

				// Auto-clear the error message after 3 seconds
				setTimeout(() => {
					if (invalidReminderInputs[key]) {
						delete invalidReminderInputs[key];
						invalidReminderInputs = { ...invalidReminderInputs };
					}
				}, 3000);
			} else {
				// Valid input, update the model
				schedules[dayIndex].schedules[scheduleIndex].reminder_time = inputTime;

				// Clear any error message
				if (invalidReminderInputs[key]) {
					delete invalidReminderInputs[key];
					invalidReminderInputs = { ...invalidReminderInputs };
				}
			}

			// Notify of changes
			schedules = [...schedules];
			onScheduleChange(schedules);
		}
	}
</script>

<div class="rounded-lg bg-white p-6 shadow-sm">
	<div class="mb-8 flex items-center justify-between">
		<h2 class="text-2xl font-semibold">Habit Schedule</h2>
		<Button variant="outline" class="flex items-center gap-2" onclick={copyToAllDays}>
			<span class="text-primary">Copy to All Days</span>
		</Button>
	</div>

	<!-- Day selector circles -->
	<div class="relative mb-6 flex justify-between">
		{#each schedules as day, dayIndex}
			<div class="flex flex-col items-center">
				<button
					class={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
						dayIndex === selectedDayIndex
							? 'bg-primary/20 text-primary'
							: 'bg-muted text-muted-foreground hover:bg-muted/80'
					}`}
					onclick={() => (selectedDayIndex = dayIndex)}
				>
					{day.day[0]}
				</button>
				{#if dayIndex === selectedDayIndex}
					<div class="bg-primary mt-2 h-1.5 w-1.5 rounded-full"></div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Selected day name and toggle -->
	<div class="mb-6 flex items-center justify-between">
		<h3 class="text-2xl font-medium">{dayNames[schedules[selectedDayIndex].day]}</h3>
		<Switch
			checked={schedules[selectedDayIndex].active}
			onCheckedChange={(checked: boolean) => toggleDayActive(selectedDayIndex, checked)}
			class="scale-125"
		/>
	</div>

	{#if schedules[selectedDayIndex].active}
		<div class="space-y-6 rounded-lg bg-gray-50 p-6">
			{#each schedules[selectedDayIndex].schedules as schedule, scheduleIndex}
				<div class="space-y-4">
					<div class="space-y-2">
						<Label for={`time-${selectedDayIndex}-${scheduleIndex}`} class="text-lg"
							>Time {scheduleIndex + 1}</Label
						>
						<div class="relative">
							<Input
								id={`time-${selectedDayIndex}-${scheduleIndex}`}
								type="time"
								value={schedule.event_time}
								onchange={(e: Event) => {
									const target = e.currentTarget as HTMLInputElement;
									updateTime(selectedDayIndex, scheduleIndex, target.value);
								}}
								class="w-full appearance-none rounded-md border bg-white px-4 py-6 text-lg"
							/>
						</div>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-sm font-semibold">Reminder</span>
						<Switch
							checked={!!schedule.reminder_time}
							onCheckedChange={(checked: boolean) =>
								toggleReminder(selectedDayIndex, scheduleIndex, checked)}
						/>
					</div>

					{#if schedule.reminder_time}
						<div class="border-muted border-l-2 pl-6">
							<div class="relative">
								<Input
									id={`reminder-${selectedDayIndex}-${scheduleIndex}`}
									type="time"
									value={schedule.reminder_time}
									max={getMaxReminderTime(schedule.event_time)}
									bind:this={reminderInputs[`${selectedDayIndex}-${scheduleIndex}`]}
									onchange={(e: Event) => handleReminderInput(e, selectedDayIndex, scheduleIndex)}
									oninput={(e: Event) => handleReminderInput(e, selectedDayIndex, scheduleIndex)}
									class="w-full appearance-none rounded-md border bg-white px-4 py-6 text-lg"
								/>
								{#if invalidReminderInputs[`${selectedDayIndex}-${scheduleIndex}`]}
									<div class="text-destructive mt-1 text-xs">
										Reminder adjusted to be before the scheduled time
									</div>
								{/if}
							</div>
						</div>
					{/if}

					{#if schedules[selectedDayIndex].schedules.length > 1}
						<div class="flex justify-end">
							<Button
								variant="ghost"
								size="sm"
								class="text-destructive hover:text-destructive hover:bg-destructive/10"
								onclick={() => removeTimeSlot(selectedDayIndex, scheduleIndex)}
							>
								Remove
							</Button>
						</div>
					{/if}
				</div>

				{#if scheduleIndex < schedules[selectedDayIndex].schedules.length - 1}
					<hr class="my-4" />
				{/if}
			{/each}

			<Button
				variant="outline"
				class="flex w-full items-center justify-center gap-2 py-6"
				onclick={() => addTimeSlot(selectedDayIndex)}
			>
				<Plus class="h-5 w-5" />
				<span>Add Another Time</span>
			</Button>
		</div>
	{:else}
		<div class="rounded-lg bg-gray-50 p-6">
			<p class="text-muted-foreground py-8 text-center">This day is inactive</p>
		</div>
	{/if}
</div>
