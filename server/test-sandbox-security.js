const { exec } = require('child_process');
const path = require('path');
const { sandboxWithBestMethod } = require('./services/sandbox');

async function compileTest() {
    return new Promise((resolve, reject) => {
        const testPath = path.join(__dirname, 'bin/sandbox-test.c');
        const outputPath = path.join(__dirname, 'bin/sandbox-test');
        
        exec(`gcc -o ${outputPath} ${testPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error('Compilation failed:', error);
                reject(error);
                return;
            }
            resolve(outputPath);
        });
    });
}

async function runSandboxTest() {
    try {
        console.log('Compiling test program...');
        const testBinary = await compileTest();
        
        console.log('\nRunning test in QEMU sandbox...');
        const result = await sandboxWithBestMethod(testBinary, [], 30000, 'qemu');
        
        console.log('\n=== Sandbox Test Results ===');
        console.log('Exit Code:', result.code);
        console.log('\nOutput:');
        console.log(result.stdout);
        
        if (result.stderr) {
            console.log('\nErrors:');
            console.log(result.stderr);
        }
        
        // Check if any security tests failed
        if (result.stdout.includes('WARNING: Sandbox failed')) {
            console.log('\n❌ SANDBOX SECURITY TEST FAILED: Some security restrictions were not enforced!');
        } else {
            console.log('\n✅ SANDBOX SECURITY TEST PASSED: All security restrictions were properly enforced!');
        }
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
runSandboxTest(); 