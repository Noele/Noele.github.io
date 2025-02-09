function resetStars() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);  // Subtract 1 day from the current date
    const formattedYesterday = yesterday.toLocaleDateString();  // Format the date to the correct format

    const lastReset = localStorage.getItem('lastResetDate');

    // Check if it's a new day
    if (lastReset !== formattedYesterday) {
        // Get the total number of stars for the day
        const totalStars = JSON.parse(localStorage.getItem('stars')) || [];
        const totalStarsCount = totalStars.length;

        // Get the calories input value
        const calories = document.getElementById('calories').value || 0;

        // Get the update history from localStorage
        const updates = JSON.parse(localStorage.getItem('updates')) || [];
        const updateMessage = `${formattedYesterday} <img width="10px" src="res/heart.png"> ${totalStarsCount} stars, ${calories} calories`;

        // Store the update in the history
        updates.push(updateMessage);
        localStorage.setItem('updates', JSON.stringify(updates));

        // Add total stars to the lifetime total in localStorage
        let lifetimeStars = parseInt(localStorage.getItem('lifetimeStars')) || 0;
        lifetimeStars += totalStarsCount;
        localStorage.setItem('lifetimeStars', lifetimeStars);

        // Clear the stars and calories for the new day
        localStorage.setItem('stars', JSON.stringify([]));
        localStorage.setItem('calories', 0);  // Reset calories for the day
        localStorage.setItem('lastResetDate', formattedYesterday);

        // Clear the checkboxes and calories input
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = false); // Uncheck all checkboxes
        document.getElementById('calories').value = ''; // Clear the calories input

        // Log the reset actions for debugging
        console.log(`Resetting for the new day. Previous day stats added to updates.`);
        console.log(`Total stars for the day: ${totalStarsCount}`);
        console.log(`Calories: ${calories}`);
    }
}


function updateStars() {
    const checkedItems = document.querySelectorAll('input[type="checkbox"]:checked');
    const uncheckedItems = document.querySelectorAll('input[type="checkbox"]:not(:checked)');
    const totalStarsCount = document.getElementById('total-stars-count');
    const stars = JSON.parse(localStorage.getItem('stars')) || [];

    // Add a star for checked items
    checkedItems.forEach(item => {
        if (!stars.includes(item.id)) {
            stars.push(item.id);  // Add star for the checked task
        }
    });

    // Remove a star for unchecked items
    uncheckedItems.forEach(item => {
        const index = stars.indexOf(item.id);
        if (index > -1) {
            stars.splice(index, 1);  // Remove star for the unchecked task
        }
    });

    // Store stars in local storage
    localStorage.setItem('stars', JSON.stringify(stars));

    // Update the displayed stars and total
    const lifetimeStars = parseInt(localStorage.getItem('lifetimeStars')) || 0;
    totalStarsCount.textContent = lifetimeStars + stars.length;
}

function showUpdates() {
    const updates = JSON.parse(localStorage.getItem('updates')) || [];
    const updatesDiv = document.getElementById('updates');

    // Display all updates, inverted (most recent first)
    updatesDiv.innerHTML = '<strong>updates</strong><br><br>';
    updates.reverse().forEach(update => {
        updatesDiv.innerHTML += `${update}<br>`;
    });
}

// Event listeners for checkboxes
document.getElementById('breakfast').addEventListener('change', updateStars);
document.getElementById('dinner').addEventListener('change', updateStars);
document.getElementById('injection').addEventListener('change', updateStars);
document.getElementById('brushing-teeth-morning').addEventListener('change', updateStars);
document.getElementById('brushing-teeth-evening').addEventListener('change', updateStars);
document.getElementById('medication').addEventListener('change', updateStars);
document.getElementById('shower').addEventListener('change', updateStars);

// Initialize
resetStars();
updateStars(); // Show stars on page load
showUpdates();  // Show the updates history

// Function to reset the day via console
function triggerNewDay() {
    const today = new Date().toLocaleDateString();
    localStorage.setItem('lastResetDate', today);
    resetStars();
    updateStars();
    showUpdates();
    console.log("New day triggered and stats reset.");
}
