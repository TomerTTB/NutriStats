const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const session = require('express-session');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON and logging
app.use(express.json());

// Session middleware for authentication
app.use(session({
    secret: 'nutrition-app-secret-key-' + Date.now(), // In production, use environment variable
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Import route handlers
const foodsRoutes = require('./src/routes/foodsRoutes');
const dailyMealsRoutes = require('./src/routes/dailyMealsRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');
const authRoutes = require('./src/routes/authRoutes');

// Import migration utility
const { runMigration, needsMigration } = require('./src/utils/migration');

// Ensure data directories exist and run migration if needed
async function ensureDirectoriesAndMigrate() {
    try {
        await fs.mkdir(path.join(__dirname, 'src', 'data'), { recursive: true });
        await fs.mkdir(path.join(__dirname, 'src', 'data', 'meals'), { recursive: true });
        await fs.mkdir(path.join(__dirname, 'src', 'data', 'foods'), { recursive: true });
        await fs.mkdir(path.join(__dirname, 'src', 'data', 'users'), { recursive: true });

        // Check if migration is needed
        if (await needsMigration()) {
            console.log('\n🔄 Migration needed. Converting to multi-user structure...');
            await runMigration();
            console.log('✅ Migration completed. Server ready!\n');
        }
    } catch (error) {
        console.error('Error in setup:', error);
        throw error;
    }
}

// Mount API routes
app.use('/api/auth', authRoutes);              // Authentication routes
app.use('/api/foods', foodsRoutes);
app.use('/api/daily-meals', dailyMealsRoutes); // Keep original path to maintain compatibility
app.use('/api/meals', dailyMealsRoutes);       // Add new path for consistency
app.use('/api/settings', settingsRoutes);

// Test route to verify API is working
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Default route - redirect based on authentication
app.get('/', (req, res) => {
    if (req.session.userId) {
    res.redirect('/diary.html');
    } else {
        res.redirect('/login.html');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    console.log('404 Not Found:', req.url);
    res.status(404).json({ error: 'Not Found' });
});

// Initialize server
async function startServer() {
    try {
        // Ensure all required directories exist and run migration if needed
        await ensureDirectoriesAndMigrate();

        // Start the server
        app.listen(port, () => {
            console.log('=================================');
            console.log(`Server is running on port ${port}`);
            console.log('Available routes:');
            console.log('- GET  /api/test         (Test endpoint)');
            console.log('- POST /api/auth/*       (Authentication endpoints)');
            console.log('- GET  /api/foods        (Get all foods)');
            console.log('- POST /api/foods        (Add new food)');
            console.log('- GET  /api/daily-meals  (Get daily meals - user-specific)');
            console.log('- GET  /api/meals        (Alias for daily-meals)');
            console.log('- GET  /api/settings     (Get settings - user-specific)');
            console.log('=================================');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer(); 