#!/usr/bin/env node

/**
 * AI Features Configuration Verification Script
 * Checks that all required environment variables and dependencies are properly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI Colors
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    header: (msg) => console.log(`\n${colors.bold}${msg}${colors.reset}\n`)
};

let checksPassed = 0;
let checksFailed = 0;

// Check 1: Environment File Exists
function checkEnvFile() {
    log.header('1. Environment Configuration');

    const envPath = path.join(__dirname, 'server', '.env');

    if (fs.existsSync(envPath)) {
        log.success('.env file found');
        checksPassed++;
        return true;
    } else {
        log.error('.env file not found');
        log.info('Expected location: server/.env');
        log.info('Copy .env.example and fill in your values');
        checksFailed++;
        return false;
    }
}

// Check 2: Required Environment Variables
function checkEnvVariables() {
    log.header('2. Required Environment Variables');

    const envPath = path.join(__dirname, 'server', '.env');

    if (!fs.existsSync(envPath)) {
        log.error('Cannot check env variables - .env file missing');
        checksFailed++;
        return false;
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const requiredVars = [
        'GEMINI_API_KEY',
        'MONGODB_URI',
        'JWT_SECRET',
        'PORT'
    ];

    const optionalVars = [
        'MODERATION_ENABLED',
        'AI_CACHE_TTL',
        'GEMINI_MODEL'
    ];

    let allRequired = true;

    for (const varName of requiredVars) {
        if (envContent.includes(`${varName}=`)) {
            const match = envContent.match(new RegExp(`${varName}=(.+)`));
            const value = match ? match[1].trim() : '';

            if (value && value.length > 0) {
                log.success(`${varName} is set`);
                checksPassed++;
            } else {
                log.error(`${varName} is empty`);
                checksFailed++;
                allRequired = false;
            }
        } else {
            log.error(`${varName} not found`);
            checksFailed++;
            allRequired = false;
        }
    }

    log.info('\nOptional variables:');
    for (const varName of optionalVars) {
        if (envContent.includes(`${varName}=`)) {
            log.success(`${varName} is set`);
        } else {
            log.warn(`${varName} not set (will use defaults)`);
        }
    }

    return allRequired;
}

// Check 3: Package Dependencies
function checkDependencies() {
    log.header('3. AI Service Dependencies');

    const packagePath = path.join(__dirname, 'server', 'package.json');

    if (!fs.existsSync(packagePath)) {
        log.error('package.json not found in server directory');
        checksFailed++;
        return false;
    }

    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    const required = [
        '@google/generative-ai',
        'axios',
        'dotenv'
    ];

    let allInstalled = true;

    for (const dep of required) {
        if (dependencies[dep]) {
            log.success(`${dep} v${dependencies[dep]}`);
            checksPassed++;
        } else {
            log.error(`${dep} not installed`);
            log.info(`Run: npm install ${dep}`);
            checksFailed++;
            allInstalled = false;
        }
    }

    return allInstalled;
}

// Check 4: Required Files Exist
function checkRequiredFiles() {
    log.header('4. Required AI Service Files');

    const requiredFiles = [
        'server/services/aiService.js',
        'server/services/cacheService.js',
        'server/controllers/aiController.js',
        'server/middleware/moderationMiddleware.js',
        'server/routes/aiRoutes.js',
        'server/models/ChatSummary.js',
        'server/models/ModerationLog.js'
    ];

    let allExist = true;

    for (const filePath of requiredFiles) {
        const fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath)) {
            log.success(filePath);
            checksPassed++;
        } else {
            log.error(`${filePath} not found`);
            checksFailed++;
            allExist = false;
        }
    }

    return allExist;
}

// Check 5: Frontend Components
function checkFrontendComponents() {
    log.header('5. Frontend AI Components');

    const requiredComponents = [
        'client/src/components/SummarizeButton.jsx',
        'client/src/components/TranslateButton.jsx',
        'client/src/components/SmartReplies.jsx'
    ];

    let allExist = true;

    for (const filePath of requiredComponents) {
        const fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath)) {
            log.success(filePath);
            checksPassed++;
        } else {
            log.error(`${filePath} not found`);
            checksFailed++;
            allExist = false;
        }
    }

    return allExist;
}

// Check 6: Server.js Integration
function checkServerIntegration() {
    log.header('6. Server Integration');

    const serverPath = path.join(__dirname, 'server', 'server.js');

    if (!fs.existsSync(serverPath)) {
        log.error('server.js not found');
        checksFailed++;
        return false;
    }

    const serverContent = fs.readFileSync(serverPath, 'utf-8');

    const checks = [
        { pattern: /import.*aiRouter/, name: 'AI Router imported' },
        { pattern: /app\.use\(['"]\/api\/ai['"].*aiRouter/, name: 'AI routes registered' },
        { pattern: /GEMINI_API_KEY/, name: 'API key check in startup' }
    ];

    let allPassed = true;

    for (const check of checks) {
        if (check.pattern.test(serverContent)) {
            log.success(check.name);
            checksPassed++;
        } else {
            log.error(check.name);
            checksFailed++;
            allPassed = false;
        }
    }

    return allPassed;
}

// Check 7: Message Routes Integration
function checkMessageRoutesIntegration() {
    log.header('7. Moderation Middleware Integration');

    const routesPath = path.join(__dirname, 'server', 'routes', 'MessageRoutes.js');

    if (!fs.existsSync(routesPath)) {
        log.error('MessageRoutes.js not found');
        checksFailed++;
        return false;
    }

    const routesContent = fs.readFileSync(routesPath, 'utf-8');

    const checks = [
        { pattern: /import.*moderateMessage/, name: 'Moderation middleware imported' },
        { pattern: /import.*checkBanStatus/, name: 'Ban check middleware imported' },
        { pattern: /moderateMessage/, name: 'Moderation middleware used in send route' }
    ];

    let allPassed = true;

    for (const check of checks) {
        if (check.pattern.test(routesContent)) {
            log.success(check.name);
            checksPassed++;
        } else {
            log.warn(check.name);
            checksFailed++;
            allPassed = false;
        }
    }

    return allPassed;
}

// Check 8: Database Models
function checkDatabaseModels() {
    log.header('8. Database Schema Validation');

    // Check Message model has AI fields
    const messagePath = path.join(__dirname, 'server', 'models', 'message.js');
    if (fs.existsSync(messagePath)) {
        const content = fs.readFileSync(messagePath, 'utf-8');

        const fields = ['isToxic', 'translations', 'moderationScore'];
        let allFields = true;

        for (const field of fields) {
            if (content.includes(field)) {
                log.success(`Message model has '${field}' field`);
                checksPassed++;
            } else {
                log.error(`Message model missing '${field}' field`);
                checksFailed++;
                allFields = false;
            }
        }
    } else {
        log.error('Message model not found');
        checksFailed++;
    }

    // Check User model has AI fields
    const userPath = path.join(__dirname, 'server', 'models', 'User.js');
    if (fs.existsSync(userPath)) {
        const content = fs.readFileSync(userPath, 'utf-8');

        const fields = ['moderationViolations', 'isBanned', 'preferredLanguage'];

        for (const field of fields) {
            if (content.includes(field)) {
                log.success(`User model has '${field}' field`);
                checksPassed++;
            } else {
                log.error(`User model missing '${field}' field`);
                checksFailed++;
            }
        }
    } else {
        log.error('User model not found');
        checksFailed++;
    }
}

// Main verification
async function runVerification() {
    console.clear();
    console.log(`${colors.bold}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.bold}   AI Features Configuration Verification${colors.reset}`);
    console.log(`${colors.bold}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

    checkEnvFile();
    checkEnvVariables();
    checkDependencies();
    checkRequiredFiles();
    checkFrontendComponents();
    checkServerIntegration();
    checkMessageRoutesIntegration();
    checkDatabaseModels();

    // Summary
    log.header('Verification Summary');

    const total = checksPassed + checksFailed;
    const percentage = total > 0 ? ((checksPassed / total) * 100).toFixed(0) : 0;

    console.log(`${colors.green}Passed: ${checksPassed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${checksFailed}${colors.reset}`);
    console.log(`\n${colors.bold}Success Rate: ${percentage}%${colors.reset}\n`);

    if (checksFailed === 0) {
        log.success('All checks passed! Your AI features are ready to use. ✓');
        log.info('\nNext steps:');
        console.log('  1. Start the server: cd server && npm run dev');
        console.log('  2. Start the client: cd client && npm run dev');
        console.log('  3. Test the features using the UI or run: node test-ai-features.js');
    } else {
        log.error('Some checks failed. Please review the issues above.');
        log.info('\nCommon fixes:');
        console.log('  - Missing .env: Copy server/.env.example to server/.env');
        console.log('  - Missing API key: Get one from https://aistudio.google.com/');
        console.log('  - Missing dependencies: Run npm install in server/ directory');
    }

    console.log('');
}

runVerification().catch(error => {
    log.error(`Verification failed: ${error.message}`);
    console.error(error);
});
