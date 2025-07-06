# Project Starter

This is the starter template for ElizaOS projects.

## Features

- Pre-configured project structure for ElizaOS development
- Comprehensive testing setup with component and e2e tests
- Default character configuration with plugin integration
- Example service, action, and provider implementations
- TypeScript configuration for optimal developer experience
- Built-in documentation and examples

## Getting Started

```bash
# Create a new project
elizaos create -t project my-project
# Dependencies are automatically installed and built

# Navigate to the project directory
cd my-project

# Start development immediately
elizaos dev
```

## Development

```bash
# Start development with hot-reloading (recommended)
elizaos dev

# OR start without hot-reloading
elizaos start
# Note: When using 'start', you need to rebuild after changes:
# bun run build

# Test the project
elizaos test
```

## Testing

ElizaOS provides a comprehensive testing structure for projects:

### Test Structure

- **Component Tests** (`__tests__/` directory):

  - **Unit Tests**: Test individual functions and components in isolation
  - **Integration Tests**: Test how components work together
  - Run with: `elizaos test component`

- **End-to-End Tests** (`e2e/` directory):

  - Test the project within a full ElizaOS runtime
  - Run with: `elizaos test e2e`

- **Running All Tests**:
  - `elizaos test` runs both component and e2e tests

### Writing Tests

Component tests use Vitest:

```typescript
// Unit test example (__tests__/config.test.ts)
describe('Configuration', () => {
  it('should load configuration correctly', () => {
    expect(config.debug).toBeDefined();
  });
});

// Integration test example (__tests__/integration.test.ts)
describe('Integration: Plugin with Character', () => {
  it('should initialize character with plugins', async () => {
    // Test interactions between components
  });
});
```

E2E tests use ElizaOS test interface:

```typescript
// E2E test example (e2e/project.test.ts)
export class ProjectTestSuite implements TestSuite {
  name = 'project_test_suite';
  tests = [
    {
      name: 'project_initialization',
      fn: async (runtime) => {
        // Test project in a real runtime
      },
    },
  ];
}

export default new ProjectTestSuite();
```

The test utilities in `__tests__/utils/` provide helper functions to simplify writing tests.

## Configuration

Customize your project by modifying:

- `src/index.ts` - Main entry point
- `src/character.ts` - Character definition

# GreenThumb + Privy Integration

## Configuration

### Agent Wallet Setup

To receive USDC tips, you need to configure your own wallet address:

1. Create or use an existing wallet on Base Sepolia testnet
2. Add your wallet address to your `.env` file:

```bash
# Your wallet address to receive tips
VITE_AGENT_WALLET_ADDRESS=0xYourWalletAddressHere
```

3. If not set, the app will use a demo address where tips may be lost forever!

### Getting Test Tokens

1. **ETH for gas**: Use faucets like [Alchemy](https://basefaucet.com) or [QuickNode](https://faucet.quicknode.com/base/sepolia)
2. **USDC for tipping**: Use the "Get Test USDC" button in the tip modal (Privy funding feature)

## Bounty Eligibility

This app is built for the **ETHGlobal Cannes "Best App Using Stablecoin Built on Privy"** bounty ($1,650):

✅ Built using Privy's APIs and SDK
✅ Embedded wallet auth and management  
✅ **USDC stablecoin functionality** (tipping system)
✅ No gambling/wagering features
