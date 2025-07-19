// Global variables
let currentDate = new Date();
let mealInterval = 3; // Default interval, will be updated from settings
let userWeight = 70; // Default weight, will be updated from settings
let goalCalories = 0; // Will be updated from settings
let isMetricSystem = true; // Will be updated from settings
let baseGoalCalories = 0; // Store the base goal calories before adjustment

// Goal percentage thresholds for color coding
const GOAL_GREEN_THRESHOLD = 5; // Within 5% shows green
const GOAL_YELLOW_THRESHOLD = 10; // Within 10% shows yellow, beyond shows red

// Background colors for macro sections
const MACRO_COLORS = {
    protein: {
        background: '#e8f4f8',  // Light blue background
        border: '#cce5ff'       // Slightly darker blue border
    },
    fat: {
        background: '#fff3e6',  // Light orange background
        border: '#ffe0b3'       // Slightly darker orange border
    },
    carb: {
        background: '#f3e8ff',  // Light purple background
        border: '#e5ccff'       // Slightly darker purple border
    },
    goal: {
        background: '#d4edda',  // Keep existing green for goal
        border: '#c3e6cb'       // Slightly darker green border
    }
};

// Load settings when the page loads
async function loadSettings() {
    try {
        const response = await API.settings.get();
        const settings = await response.json();
        mealInterval = settings.mealInterval || 3;
        userWeight = settings.weight || 70;
        baseGoalCalories = settings.totalCalories || 0;
        goalCalories = baseGoalCalories; // Initialize with base value
        isMetricSystem = settings.unitSystem === 'metric';
        
        // Update goal calories display
        document.getElementById('goalCalories').textContent = Math.round(goalCalories);
        
        // Update username display
        const userDisplay = document.getElementById('userDisplay');
        if (userDisplay && settings.userName) {
            userDisplay.textContent = settings.userName;
        }
        
        // Update weight unit display based on unit system
        const weightUnit = isMetricSystem ? 'g' : 'lb';
        document.querySelectorAll('.weight-unit').forEach(span => {
            span.textContent = `(${weightUnit})`;
        });
        
        // Set protein and fat levels from settings or defaults
        const proteinLevelInput = document.getElementById('proteinLevelInput');
        const fatLevelInput = document.getElementById('fatLevelInput');
        proteinLevelInput.value = settings.proteinLevel || '1.9'; // Default to 1.9g/kg
        fatLevelInput.value = settings.fatLevel || '0.8'; // Default to 0.8g/kg
        calculateMacroStats();
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Initialize the page
async function initializePage() {
    await loadSettings();
    createStatCards(); // Add the second row of cards
    updateActiveDayButton(currentDate.getDay());
    await loadMeals();
}

function applyCalorieAdjustment() {
    const adjustment = parseInt(document.getElementById('calorieAdjustmentInput').value) || 0;
    goalCalories = baseGoalCalories + adjustment;
    document.getElementById('goalCalories').textContent = Math.round(goalCalories);
    // Remove saveMacroSettings call from here since it will be called by calculateMacroStats
}

async function saveMacroSettings() {
    try {
        const proteinLevel = parseFloat(document.getElementById('proteinLevelInput').value) || 0;
        const fatLevel = parseFloat(document.getElementById('fatLevelInput').value) || 0;
        const calorieAdjustment = parseInt(document.getElementById('calorieAdjustmentInput').value) || 0;
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = days[currentDate.getDay()];

        // Save all macro settings together
        await API.meals.saveMacros(dayName, {
                proteinLevel,
                fatLevel,
                calorieAdjustment
        });
    } catch (error) {
        console.error('Error saving macro settings:', error);
        showError(error.message || 'Failed to save macro settings');
    }
}

function updateActiveDayButton(dayIndex) {
    document.querySelectorAll('.days-of-week button').forEach(button => {
        button.classList.remove('active');
        if (parseInt(button.dataset.day) === dayIndex) {
            button.classList.add('active');
        }
    });
}

function getDateForDayOfWeek(targetDay) {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = targetDay - currentDay;
    const date = new Date(today);
    date.setDate(date.getDate() + diff);
    return date;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function loadMeals() {
    try {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = days[currentDate.getDay()];
        const response = await API.meals.get(dayName);
        const data = await response.json();
        
        // Update protein and fat level inputs from daily data
        const proteinLevelInput = document.getElementById('proteinLevelInput');
        const fatLevelInput = document.getElementById('fatLevelInput');
        const calorieAdjustmentInput = document.getElementById('calorieAdjustmentInput');
        proteinLevelInput.value = data.proteinLevel || '1.9';
        fatLevelInput.value = data.fatLevel || '0.8';
        calorieAdjustmentInput.value = data.calorieAdjustment || '';
        
        // Store base goal calories and apply adjustment
        baseGoalCalories = goalCalories;
        applyCalorieAdjustment();
        calculateMacroStats(); // This will call saveMacroSettings once
        
        const mealsContainer = document.getElementById('mealsContainer');
        mealsContainer.innerHTML = ''; // Clear existing content

        // Create row 1: meals 1 and 4
        const row1 = document.createElement('div');
        row1.className = 'meals-row';
        if (data.meals[0]) row1.appendChild(createMealSection(data.meals[0])); // Meal 1
        if (data.meals[3]) row1.appendChild(createMealSection(data.meals[3])); // Meal 4
        mealsContainer.appendChild(row1);

        // Create row 2: meals 2 and 5
        const row2 = document.createElement('div');
        row2.className = 'meals-row';
        if (data.meals[1]) row2.appendChild(createMealSection(data.meals[1])); // Meal 2
        if (data.meals[4]) row2.appendChild(createMealSection(data.meals[4])); // Meal 5
        mealsContainer.appendChild(row2);

        // Create row 3: meals 3 and 6
        const row3 = document.createElement('div');
        row3.className = 'meals-row';
        if (data.meals[2]) row3.appendChild(createMealSection(data.meals[2])); // Meal 3
        if (data.meals[5]) row3.appendChild(createMealSection(data.meals[5])); // Meal 6
        mealsContainer.appendChild(row3);

    } catch (error) {
        console.error('Error loading meals:', error);
        showError('Failed to load meals');
    }
}

async function updateAllMealTimes(firstMealTime) {
    try {
        // Get current meal interval from settings
        const response = await API.settings.get();
        const settings = await response.json();
        const interval = settings.mealInterval || 3;

        const [hours, minutes] = firstMealTime.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        
        // First save the first meal's time
        await saveMealTime(1, firstMealTime);
        
        // Create an array of meal IDs in the correct order (2,3,4,5,6)
        const mealOrder = [2, 3, 4, 5, 6];
        
        // Update each meal in the correct sequence
        for (const mealId of mealOrder) {
            // Calculate minutes to add based on interval (remove Math.floor to handle fractional hours correctly)
            const minutesToAdd = (mealId - 1) * interval * 60;
            let totalMinutes = startMinutes + minutesToAdd;
            
            // Handle day overflow
            while (totalMinutes >= 24 * 60) {
                totalMinutes -= 24 * 60;
            }
            
            // Convert back to hours and minutes (round to nearest minute)
            const newHours = Math.floor(totalMinutes / 60);
            const newMinutes = Math.round(totalMinutes % 60);
            
            // Format the time properly
            const formattedTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
            
            // Find and update the input for this meal ID
            const mealInput = document.querySelector(`.meal-time[data-meal-id="${mealId}"]`);
            if (mealInput) {
                mealInput.value = formattedTime;
                // Save the updated time
                await saveMealTime(mealId, formattedTime);
            }
        }
    } catch (error) {
        console.error('Error updating meal times:', error);
        showError('Failed to update meal times');
        loadMeals(); // Reload to show previous state
    }
}

async function saveMealTime(mealId, newTime) {
    try {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = days[currentDate.getDay()];
        await API.meals.updateMealTime(dayName, mealId, newTime);
    } catch (error) {
        console.error('Error saving meal time:', error);
        showError('Failed to save meal time');
    }
}

async function saveMealData(row) {
    try {
        const mealSection = row.closest('.meal-section');
        if (!mealSection) return;

        const mealId = mealSection.dataset.mealId;
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = days[currentDate.getDay()];

        // Get all values from the row
        const nameInput = row.querySelector('.food-search-input');
        const amountInput = row.querySelector('input[type="number"]');
        const nutritionalDivs = row.querySelectorAll('.nutritional-value');

        // If no food name, delete the item if it exists
        if (!nameInput || !nameInput.value.trim()) {
            const itemId = row.dataset.itemId;
            if (itemId) {
                await API.meals.deleteItem(dayName, mealId, itemId);
                delete row.dataset.itemId;
            }
            return;
        }

        // Validate that we have either nutritional data OR it's a manual entry
        const hasNutritionalData = Array.from(nutritionalDivs).some(div => 
            div.textContent && parseFloat(div.textContent) > 0
        );
        
        const hasAmount = amountInput && parseFloat(amountInput.value) > 0;
        
        // Don't save if it looks like incomplete autocomplete selection
        // (has name but no nutritional data and no manual amount)
        if (!hasNutritionalData && !hasAmount && nameInput.value.length < 10) {
            console.log(`⚠️ Skipping save for "${nameInput.value}" - appears to be incomplete entry`);
            return;
        }

        const itemData = {
            name: nameInput.value.trim(),
            amount: parseFloat(amountInput?.value) || 0,
            baseAmount: parseFloat(amountInput?.getAttribute('data-base-amount')) || parseFloat(amountInput?.value) || 0,
            calories: parseFloat(nutritionalDivs[0]?.textContent) || 0,
            carbs: parseFloat(nutritionalDivs[1]?.textContent) || 0,
            protein: parseFloat(nutritionalDivs[2]?.textContent) || 0,
            fat: parseFloat(nutritionalDivs[3]?.textContent) || 0,
            proteinG: parseFloat(nutritionalDivs[4]?.textContent) || 0,
            baseCalories: parseFloat(nutritionalDivs[0]?.getAttribute('data-base-value')) || parseFloat(nutritionalDivs[0]?.textContent) || 0,
            baseCarbs: parseFloat(nutritionalDivs[1]?.getAttribute('data-base-value')) || parseFloat(nutritionalDivs[1]?.textContent) || 0,
            baseProtein: parseFloat(nutritionalDivs[2]?.getAttribute('data-base-value')) || parseFloat(nutritionalDivs[2]?.textContent) || 0,
            baseFat: parseFloat(nutritionalDivs[3]?.getAttribute('data-base-value')) || parseFloat(nutritionalDivs[3]?.textContent) || 0,
            baseProteinG: parseFloat(nutritionalDivs[4]?.getAttribute('data-base-value')) || parseFloat(nutritionalDivs[4]?.textContent) || 0
        };

        // Log what we're about to save for debugging
        console.log(`💾 Saving meal data:`, {
            name: itemData.name,
            amount: itemData.amount,
            calories: itemData.calories,
            hasNutritionalData: hasNutritionalData
        });

        const itemId = row.dataset.itemId;
        let savedItem;

        if (itemId) {
            // Update existing item
            const response = await API.meals.updateItem(dayName, mealId, itemId, itemData);
            savedItem = await response.json();
        } else {
            // Create new item
            const response = await API.meals.addItem(dayName, mealId, itemData);
            savedItem = await response.json();
        }
        
        // Update the row's item ID
        row.dataset.itemId = savedItem.id;

        // Update base values in the UI to match what was saved
        amountInput.setAttribute('data-base-amount', itemData.baseAmount.toString());
        nutritionalDivs.forEach((div, index) => {
            const baseValues = [itemData.baseCalories, itemData.baseCarbs, itemData.baseProtein, itemData.baseFat, itemData.baseProteinG];
            div.setAttribute('data-base-value', baseValues[index].toString());
        });

    } catch (error) {
        console.error('Error saving meal data:', error);
        showError('Failed to save meal data');
    }
}

function showError(message) {
    const errorDisplay = document.getElementById('errorDisplay');
    errorDisplay.textContent = message;
    errorDisplay.style.display = 'block';
    setTimeout(() => {
        errorDisplay.style.display = 'none';
    }, 5000);
}

function validateInputs(values) {
    return values[0] && values[1]; // At least name and amount should be filled
}

function clearInputs(inputs) {
    inputs.forEach(input => input.value = '');
}

function calculateNutritionalValues(baseValues, newAmount, baseAmount) {
    if (!baseAmount || !newAmount) return null;
    const ratio = newAmount / baseAmount;
    return baseValues.map(value => (value * ratio).toFixed(1));
}

function handleAddItem(button) {
    // This function handles adding items to meals
    // For now, this is a placeholder - the actual item addition happens
    // through the food search functionality in the table rows
}

function handleEditItem(button) {
    // This function handles editing items in meals
    // For now, this is a placeholder - the actual item editing happens
    // through the food search functionality in the table rows
}

function handleDeleteItem(button) {
    // This function handles deleting items from meals
    // For now, this is a placeholder - the actual item deletion happens
    // when the food search input is cleared
}