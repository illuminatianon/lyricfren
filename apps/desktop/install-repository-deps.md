# Repository System Dependencies

Run these commands to complete the repository system setup:

```bash
cd apps/desktop

# Install runtime dependencies
pnpm add dugite fs-extra

# Install development dependencies  
pnpm add -D vitest @types/uuid @types/fs-extra

# Add test script to package.json
pnpm pkg set scripts.test="vitest"
pnpm pkg set scripts.test:run="vitest run"
```

After installation, you can:

1. **Run tests**: `pnpm test`
2. **Implement Git operations**: Replace placeholder methods in `utils/git.ts` with actual dugite calls
3. **Create domain repositories**: Use `examples/SongRepository.ts` as a template
4. **Integration testing**: Test with real Git repositories

## Verification

After installing dependencies, verify the setup works:

```bash
# Run the test suite
pnpm test

# Should show all tests passing (with Git operations mocked)
```
