// test-sandbox.js
const {
    sandboxExecutable,
    sandboxWithBubblewrap,
    sandboxWithFirejail,
    sandboxWithBestMethod
} = require('./services/sandbox');
const path = require('path');

async function testAllSandboxes() {
    const resourcesPath = path.join(__dirname, 'server/bin/resources');

    console.log("\n=== Testing Sandboxes ===\n");

    try {
        console.log("1. Testing basic sandbox...");
        const result1 = await sandboxExecutable(resourcesPath, [], 10000);
        console.log("Basic sandbox result:", result1.success, result1.code);
        console.log("Stdout excerpt:", result1.stdout.substring(0, 200) + "...");

        console.log("\n2. Testing Bubblewrap sandbox...");
        try {
            const result2 = await sandboxWithBubblewrap(resourcesPath, [], 10000);
            console.log("Bubblewrap result:", result2.success, result2.code);
            console.log("Stdout excerpt:", result2.stdout.substring(0, 200) + "...");
        } catch (error) {
            console.log("Bubblewrap failed:", error.message);
        }

        console.log("\n3. Testing Firejail sandbox...");
        try {
            const result3 = await sandboxWithFirejail(resourcesPath, [], 10000);
            console.log("Firejail result:", result3.success, result3.code);
            console.log("Stdout excerpt:", result3.stdout.substring(0, 200) + "...");
        } catch (error) {
            console.log("Firejail failed:", error.message);
        }

        console.log("\n4. Testing Best Method sandbox (should try all methods)...");
        const result4 = await sandboxWithBestMethod(resourcesPath, [], 10000);
        console.log("Best method result:", result4.success, result4.code);
        console.log("Stdout excerpt:", result4.stdout.substring(0, 200) + "...");

    } catch (error) {
        console.error("Test failed:", error);
    }
}

testAllSandboxes();