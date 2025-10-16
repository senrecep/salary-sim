# Contributing to Salary Simulator

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub Issues

We use GitHub Issues to track public bugs. Report a bug by [opening a new issue](https://github.com/senrecep/salary-sim/issues/new); it's that easy!

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

People *love* thorough bug reports. I'm not even kidding.

## Feature Requests

We welcome feature requests! Please provide:

- **Use case**: Describe the problem you're trying to solve
- **Proposed solution**: What you'd like to see happen
- **Alternative solutions**: Other approaches you've considered
- **Additional context**: Screenshots, mockups, etc.

## Code Style

### JavaScript
- Use ES6+ features where appropriate
- Follow existing code patterns
- Use meaningful variable and function names
- Add comments for complex logic

### HTML/CSS
- Use semantic HTML5 elements
- Follow BEM methodology for CSS classes where applicable
- Ensure accessibility (ARIA labels, semantic markup)
- Test responsive design on multiple screen sizes

### General Guidelines
- Keep functions small and focused
- Write self-documenting code
- Use consistent indentation (2 spaces)
- Remove trailing whitespace
- End files with a newline

## Testing

Currently, this project uses manual testing. We welcome contributions to add automated testing:

- Unit tests for calculation functions
- Integration tests for UI components
- End-to-end tests for user workflows

## Documentation

- Update README.md if you change functionality
- Add inline code comments for complex logic
- Update this CONTRIBUTING.md if you change the development process

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/senrecep/salary-sim.git
   cd salary-sim
   ```

2. Open `index.html` in your browser or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (if you have live-server installed)
   npx live-server
   ```

3. Make your changes and test in the browser

## Commit Messages

Please use clear and descriptive commit messages:

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

## Getting Help

- Check existing [GitHub Issues](https://github.com/senrecep/salary-sim/issues)
- Create a new issue if you can't find an answer
- Be respectful and follow our [Code of Conduct](CODE_OF_CONDUCT.md)

## Recognition

Contributors will be recognized in the project documentation. Thank you for making this project better!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
