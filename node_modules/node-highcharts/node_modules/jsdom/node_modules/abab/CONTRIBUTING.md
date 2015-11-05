# Contributing

If you have any questions or run into any trouble contributing to this repo, please file an issue or contact me. I'd be happy to help.

# Checklists

## Pull Request

- Run lint - `npm run lint` (this does not exist yet, see TODOs in README)
- Run tests - `npm test`

## Deploy

- `git status` - verify clean working directory
- `nvm use`
- `npm install`
- `npm test`
- Bump version in `package.json`
- `git add package.json`
- `git commit -m "Version 0.0.0"`
- `git tag -m "0.0.0" 0.0.0`
- `git push`
- `git push --tags`
- `npm publish`
