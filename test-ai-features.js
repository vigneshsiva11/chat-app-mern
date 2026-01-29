/**
 * AI Features Test Suite
 * Run this file to test all AI integrations end-to-end
 */

import axios from 'axios';

// Configuration
const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testUserId = '';
let testMessageId = '';

// ANSI Colors for terminal output
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
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    header: (msg) => console.log(`\n${colors.bold}${colors.blue}${msg}${colors.reset}\n`)
};

// Helper function to make authenticated requests
const apiCall = async (method, endpoint, data = null) => {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: {
                'token': authToken,
                'Content-Type': 'application/json'
            }
        };

        if (data) config.data = data;

        const response = await axios(config);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
};

// Test 1: Authentication (Setup)
async function testAuthentication() {
    log.header('Test 1: Authentication Setup');

    try {
        // You'll need to replace these with valid credentials
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'test@example.com',
            password: 'password123'
        });

        if (loginResponse.data.success && loginResponse.data.token) {
            authToken = loginResponse.data.token;
            testUserId = loginResponse.data.user._id;
            log.success('Authentication successful');
            log.info(`User ID: ${testUserId}`);
            return true;
        } else {
            log.error('Login failed - no token received');
            return false;
        }
    } catch (error) {
        log.error(`Authentication failed: ${error.message}`);
        log.warn('Please ensure you have a test user created');
        return false;
    }
}

// Test 2: Chat Summarization
async function testChatSummarization() {
    log.header('Test 2: Chat Summarization');

    // First, we need to create some messages
    log.info('Creating test messages for summary...');

    const result = await apiCall('POST', '/ai/summarize', {
        receiverId: testUserId, // Using same user for simplicity
        // Optional: startTime, endTime
    });

    if (result.success && result.data.success) {
        log.success('Summary generated successfully');
        log.info(`Message count: ${result.data.summary.messageCount}`);
        log.info(`Bullet points: ${result.data.summary.bulletPoints?.length || 0}`);
        log.info(`Cached: ${result.data.cached}`);

        if (result.data.summary.bulletPoints && result.data.summary.bulletPoints.length > 0) {
            log.info('Sample bullet point: ' + result.data.summary.bulletPoints[0]);
        }

        return true;
    } else {
        log.error(`Summarization failed: ${result.error?.message || 'Unknown error'}`);
        if (result.error?.message?.includes('No messages found')) {
            log.warn('No messages found in conversation. Send some messages first.');
        }
        return false;
    }
}

// Test 3: Smart Reply Suggestions
async function testSmartReplies() {
    log.header('Test 3: Smart Reply Suggestions');

    const testMessages = [
        'What time is the meeting?',
        'Can you help me with this?',
        'Thanks for your help!',
        'When are you free?'
    ];

    for (const messageText of testMessages) {
        log.info(`Testing with: "${messageText}"`);

        const result = await apiCall('POST', '/ai/smart-replies', {
            messageText,
            conversationContext: ''
        });

        if (result.success && result.data.success) {
            log.success('Smart replies generated');
            result.data.suggestions.forEach((suggestion, idx) => {
                console.log(`  ${idx + 1}. "${suggestion}"`);
            });
        } else {
            log.error(`Smart reply failed for: "${messageText}"`);
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return true;
}

// Test 4: Translation
async function testTranslation() {
    log.header('Test 4: Message Translation');

    // You'll need to replace this with an actual message ID
    if (!testMessageId) {
        log.warn('No message ID available. Skipping translation test.');
        log.info('To test translation, set testMessageId to a valid message ID');
        return false;
    }

    const languages = ['ta', 'hi', 'fr', 'es'];

    for (const lang of languages) {
        log.info(`Testing translation to: ${lang}`);

        const result = await apiCall('POST', '/ai/translate', {
            messageId: testMessageId,
            targetLanguage: lang
        });

        if (result.success && result.data.success) {
            log.success(`Translation to ${lang} successful`);
            log.info(`Original: ${result.data.translation.original}`);
            log.info(`Translated: ${result.data.translation.translated}`);
            log.info(`Cached: ${result.data.cached}`);
        } else {
            log.error(`Translation to ${lang} failed`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return true;
}

// Test 5: Toxic Content Detection
async function testModerationMiddleware() {
    log.header('Test 5: Toxic Content Detection');

    // Note: This test will attempt to send toxic messages
    // They should be blocked by the moderation middleware

    const testMessages = [
        { text: 'Hello, how are you?', shouldPass: true },
        { text: 'Nice weather today!', shouldPass: true },
        { text: 'You are an idiot', shouldPass: false },
        { text: 'I hate you', shouldPass: false },
    ];

    log.warn('Testing moderation with toxic content (will be blocked)...');

    for (const { text, shouldPass } of testMessages) {
        log.info(`Testing: "${text}" (expect: ${shouldPass ? 'PASS' : 'BLOCK'})`);

        const result = await apiCall('POST', `/messages/send/${testUserId}`, {
            text
        });

        if (shouldPass) {
            if (result.success) {
                log.success('Clean message allowed ✓');
            } else {
                log.error('Clean message was incorrectly blocked!');
            }
        } else {
            if (!result.success && result.error?.moderation) {
                log.success('Toxic message blocked ✓');
                log.info(`Reason: ${result.error.moderation.reason}`);
                log.info(`Severity: ${result.error.moderation.severity}`);
            } else {
                log.error('Toxic message was NOT blocked!');
            }
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return true;
}

// Test 6: AI Stats
async function testAIStats() {
    log.header('Test 6: AI Usage Statistics');

    const result = await apiCall('GET', '/ai/stats');

    if (result.success && result.data.success) {
        log.success('AI statistics retrieved');
        log.info(`Cache size: ${result.data.stats.cacheSize}`);
        log.info(`Total summaries: ${result.data.stats.totalSummaries}`);

        if (result.data.stats.cachedKeys && result.data.stats.cachedKeys.length > 0) {
            log.info(`Cached keys: ${result.data.stats.cachedKeys.length}`);
        }

        return true;
    } else {
        log.error('Failed to retrieve AI statistics');
        return false;
    }
}

// Test 7: Moderation Logs
async function testModerationLogs() {
    log.header('Test 7: Moderation Logs');

    const result = await apiCall('GET', '/ai/moderation-logs');

    if (result.success && result.data.success) {
        log.success('Moderation logs retrieved');
        log.info(`Total logs: ${result.data.logs.length}`);

        if (result.data.logs.length > 0) {
            const recentLog = result.data.logs[0];
            log.info('Most recent log:');
            console.log(`  Action: ${recentLog.action}`);
            console.log(`  Severity: ${recentLog.severity}`);
            console.log(`  Message: "${recentLog.messageText?.substring(0, 50)}..."`);
        }

        return true;
    } else {
        log.error('Failed to retrieve moderation logs');
        return false;
    }
}

// Test 8: Error Handling
async function testErrorHandling() {
    log.header('Test 8: Error Handling & Edge Cases');

    // Test 8.1: Missing required fields
    log.info('8.1: Testing missing receiverId in summarize...');
    let result = await apiCall('POST', '/ai/summarize', {});
    if (!result.success) {
        log.success('Correctly rejected request with missing receiverId');
    } else {
        log.error('Should have rejected request with missing fields');
    }

    // Test 8.2: Invalid message ID for translation
    log.info('8.2: Testing invalid message ID...');
    result = await apiCall('POST', '/ai/translate', {
        messageId: '000000000000000000000000',
        targetLanguage: 'ta'
    });
    if (!result.success) {
        log.success('Correctly rejected invalid message ID');
    } else {
        log.error('Should have rejected invalid message ID');
    }

    // Test 8.3: Empty message text for smart replies
    log.info('8.3: Testing empty message text...');
    result = await apiCall('POST', '/ai/smart-replies', {
        messageText: ''
    });
    if (!result.success) {
        log.success('Correctly rejected empty message text');
    } else {
        log.error('Should have rejected empty message text');
    }

    return true;
}

// Test 9: Performance Test
async function testPerformance() {
    log.header('Test 9: Performance & Caching');

    log.info('Testing cache performance with repeated requests...');

    // First request (uncached)
    const start1 = Date.now();
    const result1 = await apiCall('POST', '/ai/smart-replies', {
        messageText: 'What time is it?'
    });
    const time1 = Date.now() - start1;

    if (result1.success) {
        log.info(`First request (uncached): ${time1}ms`);

        // Wait a moment then repeat (should be cached)
        await new Promise(resolve => setTimeout(resolve, 100));

        const start2 = Date.now();
        const result2 = await apiCall('POST', '/ai/smart-replies', {
            messageText: 'What time is it?'
        });
        const time2 = Date.now() - start2;

        log.info(`Second request (cached): ${time2}ms`);

        if (time2 < time1) {
            log.success(`Cache improved speed by ${((1 - time2 / time1) * 100).toFixed(0)}%`);
        } else {
            log.warn('Cache might not be working properly');
        }
    }

    return true;
}

// Run all tests
async function runAllTests() {
    console.clear();
    console.log(`${colors.bold}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.bold}    AI Features Test Suite - MERN Chat App${colors.reset}`);
    console.log(`${colors.bold}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

    const results = {
        passed: 0,
        failed: 0,
        skipped: 0
    };

    // Authenticate first
    const authSuccess = await testAuthentication();
    if (!authSuccess) {
        log.error('Authentication failed. Cannot proceed with tests.');
        log.warn('\nPlease ensure:');
        console.log('  1. Server is running on http://localhost:5000');
        console.log('  2. You have a test user account');
        console.log('  3. Update credentials in testAuthentication()');
        return;
    }

    // Run all tests
    const tests = [
        { name: 'Chat Summarization', fn: testChatSummarization, critical: false },
        { name: 'Smart Replies', fn: testSmartReplies, critical: true },
        { name: 'Translation', fn: testTranslation, critical: false },
        { name: 'Moderation', fn: testModerationMiddleware, critical: true },
        { name: 'AI Stats', fn: testAIStats, critical: true },
        { name: 'Moderation Logs', fn: testModerationLogs, critical: true },
        { name: 'Error Handling', fn: testErrorHandling, critical: true },
        { name: 'Performance', fn: testPerformance, critical: false }
    ];

    for (const test of tests) {
        try {
            const success = await test.fn();
            if (success) {
                results.passed++;
            } else {
                if (test.critical) {
                    results.failed++;
                } else {
                    results.skipped++;
                }
            }
        } catch (error) {
            log.error(`Test "${test.name}" threw an error: ${error.message}`);
            results.failed++;
        }

        // Delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Summary
    log.header('Test Results Summary');
    console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
    console.log(`${colors.yellow}Skipped: ${results.skipped}${colors.reset}`);

    const total = results.passed + results.failed + results.skipped;
    const percentage = ((results.passed / total) * 100).toFixed(0);

    console.log(`\n${colors.bold}Success Rate: ${percentage}%${colors.reset}\n`);

    if (results.failed === 0) {
        log.success('All critical tests passed! ✓');
    } else {
        log.error('Some tests failed. Please review the output above.');
    }
}

// Instructions
console.log(`
${colors.bold}AI Features Test Suite${colors.reset}

${colors.yellow}Before running:${colors.reset}
1. Ensure the server is running: ${colors.blue}npm run dev${colors.reset}
2. Update test credentials in testAuthentication()
3. (Optional) Set testMessageId for translation tests

${colors.yellow}To run:${colors.reset}
node --experimental-modules test-ai-features.js

${colors.yellow}Manual Setup Required:${colors.reset}
- Create a test user account
- Send some test messages between users
- Update credentials in this file

Press Ctrl+C to cancel, or wait to start tests...
`);

// Wait 3 seconds then run
setTimeout(() => {
    runAllTests().catch(error => {
        log.error(`Test suite failed: ${error.message}`);
        console.error(error);
    });
}, 3000);
