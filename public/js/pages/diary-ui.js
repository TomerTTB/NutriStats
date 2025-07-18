// Helper function to create stat cards
function createStatCards() {
    const statsContainer = document.querySelector('.stats-container');
    if (!statsContainer) {
        console.error('Stats container not found');
        return;
    }

    // Get the current weight unit based on the user's unit system preference
    const weightUnit = isMetricSystem ? 'g' : 'lb';

    // Remove existing second row if it exists
    const existingRow = statsContainer.querySelector('.meal-stats-grid');
    if (existingRow) {
        existingRow.remove();
    }

    // Create second row with the same grid layout
    const actualValuesRow = document.createElement('div');
    actualValuesRow.className = 'stats-grid meal-stats-grid';
    actualValuesRow.style.marginTop = '10px';

    // Create cards array to match the layout of the first row
    const cards = Array(13).fill(null);

    // Protein Level
    cards[0] = `
        <div class="stat-card protein-section">
            <div style="min-height: 0; padding: 0; border: none;"></div>
            <div id="mealProteinLevel" class="stat-value" style="background-color: ${MACRO_COLORS.protein.background}; border: 1px solid ${MACRO_COLORS.protein.border};">0.0</div>
        </div>`;

    // Protein stats
    cards[1] = `
        <div class="stat-card protein-section">
            <div style="min-height: 0; padding: 0; border: none;"></div>
            <div id="mealProteinPercentage" class="stat-value" style="background-color: ${MACRO_COLORS.protein.background}; border: 1px solid ${MACRO_COLORS.protein.border};">0.0%</div>
        </div>`;
    cards[2] = `
        <div class="stat-card protein-section">
            <div style="min-height: 0; padding: 0; border: none; display: none;"></div>
            <div id="mealProtein" class="stat-value" style="background-color: ${MACRO_COLORS.protein.background}; border: 1px solid ${MACRO_COLORS.protein.border};">0.0</div>
        </div>`;
    cards[3] = `
        <div class="stat-card protein-section">
            <div style="min-height: 0; padding: 0; border: none;"></div>
            <div id="mealProteinCal" class="stat-value" style="background-color: ${MACRO_COLORS.protein.background}; border: 1px solid ${MACRO_COLORS.protein.border};">0.0</div>
        </div>`;

    // Fat Level
    cards[4] = `
        <div class="stat-card fat-section">
            <div style="min-height: 0; padding: 0; border: none;"></div>
            <div id="mealFatLevel" class="stat-value" style="background-color: ${MACRO_COLORS.fat.background}; border: 1px solid ${MACRO_COLORS.fat.border};">0.0</div>
        </div>`;

    // Fat stats
    cards[5] = `
        <div class="stat-card fat-section">
            <div style="min-height: 0; padding: 0; border: none;"></div>
            <div id="mealFatPercentage" class="stat-value" style="background-color: ${MACRO_COLORS.fat.background}; border: 1px solid ${MACRO_COLORS.fat.border};">0.0%</div>
        </div>`;
    cards[6] = `
        <div class="stat-card fat-section">
            <div style="min-height: 0; padding: 0; border: none; display: none;"></div>
            <div id="mealFat" class="stat-value" style="background-color: ${MACRO_COLORS.fat.background}; border: 1px solid ${MACRO_COLORS.fat.border};">0.0</div>
        </div>`;
    cards[7] = `
        <div class="stat-card fat-section">
            <div style="min-height: 0; padding: 0; border: none;"></div>
            <div id="mealFatCal" class="stat-value" style="background-color: ${MACRO_COLORS.fat.background}; border: 1px solid ${MACRO_COLORS.fat.border};">0.0</div>
        </div>`;

    // Carb stats
    cards[8] = `
        <div class="stat-card carb-section">
            <div style="min-height: 0; padding: 0; border: none;"></div>
            <div id="mealCarbPercentage" class="stat-value" style="background-color: ${MACRO_COLORS.carb.background}; border: 1px solid ${MACRO_COLORS.carb.border};">0.0%</div>
        </div>`;
    cards[9] = `
        <div class="stat-card carb-section">
            <div style="min-height: 0; padding: 0; border: none; display: none;"></div>
            <div id="mealCarb" class="stat-value" style="background-color: ${MACRO_COLORS.carb.background}; border: 1px solid ${MACRO_COLORS.carb.border};">0.0</div>
        </div>`;
    cards[10] = `
        <div class="stat-card carb-section">
            <div style="min-height: 0; padding: 0; border: none;"></div>
            <div id="mealCarbCal" class="stat-value" style="background-color: ${MACRO_COLORS.carb.background}; border: 1px solid ${MACRO_COLORS.carb.border};">0.0</div>
        </div>`;

    // Manual change card position (11) is left empty and hidden
    cards[11] = '<div class="stat-card" style="visibility: hidden;"></div>';

    // Goal card - second row
    cards[12] = `
        <div class="stat-card goal-section">
            <div style="min-height: 0; padding: 0; border: none;"></div>
            <div id="mealGoal" class="stat-value" style="transition: background-color 0.3s">0.0</div>
        </div>`;

    // Set the row's HTML
    actualValuesRow.innerHTML = cards.join('');

    // Add the new row after the existing stats grid
    statsContainer.appendChild(actualValuesRow);

    // Add green background to the first row goal card
    const firstRowGoalCard = document.querySelector('.stats-grid:not(.meal-stats-grid) .goal-section .stat-value');
    if (firstRowGoalCard) {
        firstRowGoalCard.style.backgroundColor = MACRO_COLORS.goal.background;
        firstRowGoalCard.style.border = `1px solid ${MACRO_COLORS.goal.border}`;
    }

    // Add colors to first row macro sections
    document.querySelectorAll('.stats-grid:not(.meal-stats-grid) .protein-section .stat-value').forEach(el => {
        el.style.backgroundColor = MACRO_COLORS.protein.background;
        el.style.border = `1px solid ${MACRO_COLORS.protein.border}`;
    });
    document.querySelectorAll('.stats-grid:not(.meal-stats-grid) .fat-section .stat-value').forEach(el => {
        el.style.backgroundColor = MACRO_COLORS.fat.background;
        el.style.border = `1px solid ${MACRO_COLORS.fat.border}`;
    });
    document.querySelectorAll('.stats-grid:not(.meal-stats-grid) .carb-section .stat-value').forEach(el => {
        el.style.backgroundColor = MACRO_COLORS.carb.background;
        el.style.border = `1px solid ${MACRO_COLORS.carb.border}`;
    });
}

function createMealSection(meal) {
    const section = document.createElement('div');
    section.className = 'meal-section';
    section.dataset.mealId = meal.id;

    const header = document.createElement('div');
    header.className = 'meal-header';

    // Create time input group
    const timeGroup = document.createElement('div');
    timeGroup.className = 'd-flex align-items-center';
    timeGroup.innerHTML = `
        <h3 class="me-2 mb-0">Meal ${meal.id}</h3>
        <input type="text" 
               class="form-control form-control-sm meal-time" 
               style="width: 120px;" 
               value="${meal.time}"
               placeholder="HH:MM"
               maxlength="5"
               data-meal-id="${meal.id}">
    `;

    header.appendChild(timeGroup);
    section.appendChild(header);

    // Add event listener for meal time input if this is meal 1
    if (meal.id === 1) {
        const timeInput = timeGroup.querySelector('.meal-time');
        timeInput.addEventListener('change', function () {
            updateAllMealTimes(this.value);
        });
    }

    // Create table structure
    const table = document.createElement('table');
    table.className = 'meal-table';
    table.innerHTML = `
            <thead>
                <tr>
                <th style="text-align: center;">Item</th>
                <th style="text-align: center;">Amount</th>
                <th style="text-align: center;">Calories</th>
                <th style="text-align: center;">Carbs</th>
                <th style="text-align: center;">Protein</th>
                <th style="text-align: center;">Fat</th>
                <th style="text-align: center;">Protein G</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
            <tfoot>
                <tr>
                <td colspan="2" style="text-align: center;">Total</td>
                <td class="total-calories" style="text-align: center;">0.0</td>
                <td class="total-carbs" style="text-align: center;">0.0</td>
                <td class="total-protein" style="text-align: center;">0.0</td>
                <td class="total-fat" style="text-align: center;">0.0</td>
                <td class="total-protein-g" style="text-align: center;">0.0</td>
                </tr>
            </tfoot>
    `;
    section.appendChild(table);

    // Get the tbody element
    const tbody = table.querySelector('tbody');

    // Initialize with minimum 6 rows
    const minRows = 6;
    const existingItems = meal.items || [];
    const totalRows = Math.max(minRows, existingItems.length);

    // Create all needed rows
    for (let i = 0; i < totalRows; i++) {
        const item = existingItems[i] || {
            id: '',
            name: '',
            amount: '',
            calories: '',
            carbs: '',
            protein: '',
            fat: '',
            proteinG: ''
        };
        const row = createFoodItemRow(item);
        tbody.insertAdjacentHTML('beforeend', row);
    }

    // Set up event listeners for the table
    setupTableEventListeners(table);

    updateTotals(table);
    return section;
}

function setupTableEventListeners(table) {
    const tbody = table.querySelector('tbody');

    // Monitor changes to food items
    const observer = new MutationObserver(() => {
        checkRowsAndUpdate(tbody);
    });

    observer.observe(tbody, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true
    });

    // Set up food search for all rows
    const searchInputs = table.querySelectorAll('.food-search-input');
    searchInputs.forEach(setupRowEventListeners);

    // Add change event listener to amount inputs
    const amountInputs = table.querySelectorAll('input[type="number"]');
    amountInputs.forEach(setupAmountInputEventListener);
}

function setupRowEventListeners(input) {
    if (input && typeof foodSearch !== 'undefined') {
        foodSearch.setupSearchInput(input);
    }

    // Add input event listener to clear values when item name is deleted
    input.addEventListener('input', async function () {
        if (!this.value.trim()) {
            const row = this.closest('tr');
            clearRowValues(row);
            await saveMealData(row);
            checkRowsAndUpdate(row.parentElement);
        }
    });

    // Add blur event
    input.addEventListener('blur', async function () {
        if (!this.value.trim()) {
            const row = this.closest('tr');
            clearRowValues(row);
            await saveMealData(row);
        } else {
            const row = this.closest('tr');
            await saveMealData(row);
        }
        checkRowsAndUpdate(this.closest('tbody'));
    });
}

function setupAmountInputEventListener(amountInput) {
    if (!amountInput) return;

    const tbody = amountInput.closest('tbody');
    amountInput.addEventListener('change', async function () {
        const row = this.closest('tr');
        await handleAmountChange(this);
        checkRowsAndUpdate(tbody);
    });
}

function clearRowValues(row) {
    // Clear amount input
    const amountInput = row.querySelector('input[type="number"]');
    if (amountInput) {
        amountInput.value = '';
    }
    // Clear nutritional values
    const nutritionalValues = row.querySelectorAll('.nutritional-value');
    nutritionalValues.forEach(div => {
        div.textContent = '';
    });
    updateRowTotals(row.querySelector('input'));
}

function checkRowsAndUpdate(tbody) {
    const rows = tbody.querySelectorAll('tr');
    const minRows = 6;

    // Count filled rows (rows with food items)
    let filledRows = 0;
    let emptyRows = 0;
    let lastEmptyRows = 0;

    rows.forEach(row => {
        const foodInput = row.querySelector('.food-search-input');
        const isEmpty = !foodInput || !foodInput.value.trim();

        if (!isEmpty) {
            filledRows++;
            lastEmptyRows = 0;
        } else {
            emptyRows++;
            lastEmptyRows++;
        }
    });

    // Add row if all current rows are filled
    if (filledRows === rows.length) {
        const newRow = createFoodItemRow({});
        tbody.insertAdjacentHTML('beforeend', newRow);
        const newRowElement = tbody.lastElementChild;
        setupRowEventListeners(newRowElement.querySelector('.food-search-input'));
        setupAmountInputEventListener(newRowElement.querySelector('input[type="number"]'));
    }

    // Remove last row if last two rows are empty and we have more than minimum rows
    if (lastEmptyRows >= 2 && rows.length > minRows) {
        tbody.removeChild(tbody.lastElementChild);
    }
}

async function handleAmountChange(input) {
    const row = input.closest('tr');
    const foodInput = row.querySelector('.food-search-input');

    // Get base values from the nutritional divs
    const nutritionalDivs = row.querySelectorAll('.nutritional-value');
    const newAmount = parseFloat(input.value) || 0;
    const baseAmount = parseFloat(input.getAttribute('data-base-amount')) || 0;

    if (baseAmount > 0 && newAmount >= 0) {
        const ratio = newAmount / baseAmount;

        nutritionalDivs.forEach((div, index) => {
            const baseValue = parseFloat(div.getAttribute('data-base-value')) || 0;
            if (baseValue > 0) {
                const newValue = (baseValue * ratio).toFixed(1);
                div.textContent = newValue;
            }
        });
    } else {
        nutritionalDivs.forEach(div => div.textContent = '');
    }

    updateRowTotals(input);
    await saveMealData(row);
}

function createFoodItemRow(item) {
    // Get the current weight unit based on the user's unit system preference
    const weightUnit = isMetricSystem ? 'g' : 'lb';

    return `
        <tr class="meal-row" ${item.id ? `data-item-id="${item.id}"` : ''}>
            <td class="food-search-cell" style="text-align: center;">
                <div class="food-search-container">
                    <input type="text" 
                           class="food-search-input" 
                           value="${item.name || ''}" 
                           placeholder="Search food..."
                           autocomplete="off">
                </div>
            </td>
            <td style="text-align: center;">
                <input type="number" 
                       value="${item.amount || ''}" 
                       placeholder="${weightUnit}" 
                       step="1" 
                       min="0"
                       class="amount-input"
                       data-base-amount="${item.baseAmount || item.amount || ''}">
            </td>
            <td class="nutritional-value" 
                style="text-align: center;"
                data-base-value="${item.baseCalories || item.calories || ''}">${item.calories || ''}</td>
            <td class="nutritional-value" 
                style="text-align: center;"
                data-base-value="${item.baseCarbs || item.carbs || ''}">${item.carbs || ''}</td>
            <td class="nutritional-value" 
                style="text-align: center;"
                data-base-value="${item.baseProtein || item.protein || ''}">${item.protein || ''}</td>
            <td class="nutritional-value" 
                style="text-align: center;"
                data-base-value="${item.baseFat || item.fat || ''}">${item.fat || ''}</td>
            <td class="nutritional-value" 
                style="text-align: center;"
                data-base-value="${item.baseProteinG || item.proteinG || ''}">${item.proteinG || ''}</td>
        </tr>
    `;
}

function updateStatCard(label, value) {
    const cards = document.querySelectorAll('.stat-card');
    const card = Array.from(cards).find(card => card.querySelector('div').textContent === label);
    if (card) {
        card.querySelector('.stat-value').textContent = value;
    }
}