
// Get the current date
const currentDate = new Date();

// Loop through the previous 7 days
for (let i = 0; i < 7; i++) {
  // Calculate the startDateTime and endDateTime for each day
  const startDateTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - i, 0, 0, 0);
  const endDateTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - i, 23, 59, 59);

  // Use the startDateTime and endDateTime as needed
  console.log(`Start DateTime for Day ${i + 1}: ${startDateTime}`);
  console.log(`End DateTime for Day ${i + 1}: ${endDateTime}`);
}
