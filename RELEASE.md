# Release Process

## Prerequisites

- Ensure `NPM_TOKEN` is set in GitHub repository secrets
- Have npm publishing permissions for `@vapi-ai/client-sdk-react`

## Steps to Release

1. **Update version in package.json**

   ```bash
   npm version patch  # or minor/major
   ```

2. **Push changes and tags**

   ```bash
   git push origin main
   git push origin --tags
   ```

3. **Create GitHub Release**
   - Go to [Releases](../../releases/new) → "Draft a new release"
   - Select the tag you just created (e.g., `v1.0.0`)
   - Title: `v1.0.0` (same as tag)
   - Generate release notes or write changelog
   - Click "Publish release"

4. **Verify**
   - Check [Actions](../../actions) tab for build status
   - Confirm package on [npm](https://www.npmjs.com/package/@vapi-ai/client-sdk-react)

## Version Types

- `patch`: Bug fixes (1.0.0 → 1.0.1)
- `minor`: New features (1.0.0 → 1.1.0)
- `major`: Breaking changes (1.0.0 → 2.0.0)

## Important Notes

⚠️ **Package version must match release tag!** The workflow validates this.

Example: Tag `v1.0.0` requires package.json version `1.0.0`
