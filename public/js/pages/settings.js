class UserSettings {
    constructor() {
        this.form = document.getElementById('userSettingsForm');
        this.bmrValue = document.getElementById('bmrValue');
        this.totalCalories = document.getElementById('totalCalories');
        this.weeklyCalories = document.getElementById('weeklyCalories');
        this.saveStatus = document.getElementById('saveStatus');
        this.unitSystem = document.getElementById('unitSystem');
        this.weightUnit = document.querySelector('.unit-weight');
        this.heightUnit = document.querySelector('.unit-height');
        this.userDisplay = document.getElementById('userDisplay');
        this.hasUnsavedChanges = false;
        this.saveTimeout = null;
        this.setupEventListeners();
        this.loadSettings();
    }

    setupEventListeners() {
        // Prevent form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
        });

        // Auto-save on field blur and input changes
        ['userNameInput', 'sex', 'age', 'weight', 'height', 'activityLevel', 'calorieAdjustment', 'mealInterval'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                // Update calculations on input
                element.addEventListener('input', () => {
                    this.hasUnsavedChanges = true;
                    this.showSaveStatus('pending');
                    
                    if (id !== 'userNameInput') {
                        this.updateCalculations();
                    }
                    
                    // Debounced auto-save
                    this.debouncedSave();
                });
                
                // Also save on blur (when user leaves the field)
                element.addEventListener('blur', () => {
                    if (this.hasUnsavedChanges) {
                        this.saveSettings();
                    }
                });
            }
        });

        // Handle unit system changes (immediate save)
        this.unitSystem.addEventListener('change', () => {
            this.updateUnitLabels();
            this.convertUnits();
            this.updateCalculations();
            this.saveSettings();
        });
    }

    updateUnitLabels() {
        const isMetric = this.unitSystem.value === 'metric';
        this.weightUnit.textContent = isMetric ? 'kg' : 'lb';
        this.heightUnit.textContent = isMetric ? 'cm' : 'in';
    }

    convertUnits() {
        const isMetric = this.unitSystem.value === 'metric';
        const weightInput = document.getElementById('weight');
        const heightInput = document.getElementById('height');
        
        if (isMetric) {
            // Convert from imperial to metric
            weightInput.value = weightInput.value ? (parseFloat(weightInput.value) * 0.453592).toFixed(1) : '';
            heightInput.value = heightInput.value ? (parseFloat(heightInput.value) * 2.54).toFixed(1) : '';
        } else {
            // Convert from metric to imperial
            weightInput.value = weightInput.value ? (parseFloat(weightInput.value) * 2.20462).toFixed(1) : '';
            heightInput.value = heightInput.value ? (parseFloat(heightInput.value) / 2.54).toFixed(1) : '';
        }
    }

    getMetricValues() {
        const isMetric = this.unitSystem.value === 'metric';
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value);

        if (isMetric) {
            return { weight, height };
        } else {
            return {
                weight: weight * 0.453592, // lb to kg
                height: height * 2.54      // in to cm
            };
        }
    }

    calculateBMR(weight, height, age, sex) {
        if (sex === 'male') {
            return (13.397 * weight) + (4.799 * height) - (5.677 * age) + 88.362;
        } else {
            return (9.247 * weight) + (3.098 * height) - (4.330 * age) + 447.593;
        }
    }

    updateCalculations() {
        const formData = this.getFormData();
        if (!this.isValidData(formData)) return;

        const { weight, height } = this.getMetricValues();
        const bmr = this.calculateBMR(
            weight,
            height,
            parseInt(formData.age),
            formData.sex
        );

        const totalCals = (bmr * parseFloat(formData.activityLevel)) + parseInt(formData.calorieAdjustment);
        const weeklyCals = totalCals * 7;

        this.bmrValue.textContent = Math.round(bmr);
        this.totalCalories.textContent = Math.round(totalCals);
        this.weeklyCalories.textContent = Math.round(weeklyCals);
    }

    getFormData() {
        return {
            userName: document.getElementById('userNameInput').value,
            unitSystem: this.unitSystem.value,
            sex: document.getElementById('sex').value,
            age: document.getElementById('age').value,
            weight: document.getElementById('weight').value,
            height: document.getElementById('height').value,
            activityLevel: document.getElementById('activityLevel').value,
            calorieAdjustment: document.getElementById('calorieAdjustment').value || '0',
            mealInterval: document.getElementById('mealInterval').value || '3'
        };
    }

    isValidData(data) {
        return data.age > 0 && data.weight > 0 && data.height > 0;
    }

    showSaveStatus(status) {
        const icon = this.saveStatus.querySelector('i');
        const text = this.saveStatus.querySelector('span');
        
        switch (status) {
            case 'pending':
                icon.className = 'bi bi-clock text-warning';
                text.textContent = 'Saving...';
                text.className = 'text-warning';
                break;
            case 'saved':
                icon.className = 'bi bi-check-circle text-success';
                text.textContent = 'All changes saved';
                text.className = 'text-success';
                break;
            case 'error':
                icon.className = 'bi bi-exclamation-triangle text-danger';
                text.textContent = 'Error saving changes';
                text.className = 'text-danger';
                break;
        }
    }

    debouncedSave() {
        // Clear existing timeout
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        // Set new timeout for auto-save
        this.saveTimeout = setTimeout(() => {
            if (this.hasUnsavedChanges) {
                this.saveSettings();
            }
        }, 1000); // Save after 1 second of inactivity
    }

    async saveSettings() {
        const formData = this.getFormData();
        if (!this.isValidData(formData)) {
            this.showSaveStatus('error');
            return;
        }

        this.showSaveStatus('pending');

        try {
            await API.settings.save({
                ...formData,
                bmr: parseFloat(this.bmrValue.textContent),
                totalCalories: parseFloat(this.totalCalories.textContent),
                weeklyCalories: parseFloat(this.weeklyCalories.textContent)
            });
            
            // Update username display after successful save
            this.updateUserDisplay(formData.userName);
            this.hasUnsavedChanges = false;
            this.showSaveStatus('saved');
            
            // Add brief visual feedback to form fields
            this.showFieldSaveSuccess();
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showSaveStatus('error');
        }
    }

    showFieldSaveSuccess() {
        // Add 'saved' class to all form fields briefly
        const fields = ['userNameInput', 'sex', 'age', 'weight', 'height', 'activityLevel', 'calorieAdjustment', 'mealInterval'];
        fields.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add('saved');
                setTimeout(() => {
                    element.classList.remove('saved');
                }, 2000);
            }
        });
    }

    updateUserDisplay(userName) {
        if (this.userDisplay) {
            this.userDisplay.textContent = userName || '';
        }
    }

    async loadSettings() {
        try {
            const response = await API.settings.get();
            const settings = await response.json();
            
            // Debug: Check if userName is in the response
            console.log('Loading settings for user:', settings.userName || 'UNKNOWN');
            
            this.populateForm(settings);
            this.updateUnitLabels();
            this.updateCalculations();
            this.updateUserDisplay(settings.userName);
            this.hasUnsavedChanges = false;
            this.showSaveStatus('saved');
            
            // Final check to ensure userName is populated correctly
            this.ensureUserNamePopulated(settings.userName);
        } catch (error) {
            console.error('Error loading settings:', error);
            this.showSaveStatus('error');
        }
    }

    populateForm(settings) {
        // Explicitly handle userName first
        const userNameElement = document.getElementById('userNameInput');
        if (userNameElement && settings.userName) {
            userNameElement.value = settings.userName;
            userNameElement.setAttribute('value', settings.userName);
        }
        
        // Handle other fields
        Object.entries(settings).forEach(([key, value]) => {
            // Skip userName as it's handled separately with userNameInput ID
            if (key === 'userName') return;
            
            const element = document.getElementById(key);
            if (element) {
                element.value = value || '';
            }
        });
    }

    ensureUserNamePopulated(userName) {
        const userNameElement = document.getElementById('userNameInput');
        if (!userNameElement || !userName) return;
        
        // Multiple attempts to populate the field
        const setUserName = () => {
            userNameElement.value = userName;
            userNameElement.setAttribute('value', userName);
            console.log('userName field populated with:', userName);
        };
        
        // Set immediately
        setUserName();
        
        // Check after a short delay and re-set if needed
        setTimeout(() => {
            if (!userNameElement.value) {
                console.log('userName field was empty, re-setting...');
                setUserName();
            }
        }, 100);
        
        // Final check after longer delay
        setTimeout(() => {
            if (!userNameElement.value) {
                console.log('userName field still empty after 500ms, forcing...');
                setUserName();
                // Remove and re-add the field to force refresh
                const parent = userNameElement.parentNode;
                const nextSibling = userNameElement.nextSibling;
                parent.removeChild(userNameElement);
                userNameElement.value = userName;
                parent.insertBefore(userNameElement, nextSibling);
            }
        }, 500);
    }
}

// Initialize settings when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new UserSettings();
}); 