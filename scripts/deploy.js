const { execSync } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
    success: '\x1b[32m',
    info: '\x1b[36m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
};

console.log(`${colors.info}Starting deployment process...${colors.reset}\n`);

try {
    // Build Frontend
    console.log(`${colors.info}Building Frontend...${colors.reset}`);
    execSync('cd frontend && npm run build', { stdio: 'inherit' });
    console.log(`${colors.success}Frontend build completed successfully!${colors.reset}\n`);

    // Install production dependencies for backend
    console.log(`${colors.info}Installing backend production dependencies...${colors.reset}`);
    execSync('npm ci --only=production', { stdio: 'inherit' });
    console.log(`${colors.success}Backend dependencies installed successfully!${colors.reset}\n`);

    console.log(`${colors.success}Deployment build completed successfully!${colors.reset}`);
    console.log(`${colors.info}You can now deploy the application to your hosting platform.${colors.reset}`);

} catch (error) {
    console.error(`${colors.error}Deployment failed:${colors.reset}`, error);
    process.exit(1);
}
