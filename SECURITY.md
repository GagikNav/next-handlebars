# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please report it to us responsibly.

### How to Report

1. **Do not** create a public GitHub issue for security vulnerabilities
2. Send an email to [security@example.com] with details
3. Include steps to reproduce the vulnerability
4. Provide any additional context that might be helpful

### What to Expect

- **Acknowledgment**: We'll acknowledge receipt within 48 hours
- **Initial Assessment**: We'll provide an initial assessment within 7 days
- **Updates**: We'll keep you informed of our progress
- **Resolution**: We'll work to resolve the issue as quickly as possible
- **Credit**: With your permission, we'll credit you in our security advisory

### Security Best Practices

When using next-handlebars:

1. **Input Validation**: Always validate and sanitize user input before passing to templates
2. **Template Security**: Be cautious with user-generated templates
3. **Helper Functions**: Ensure custom helpers don't introduce vulnerabilities
4. **Dependencies**: Keep dependencies up to date
5. **CSP Headers**: Implement Content Security Policy headers

### Known Security Considerations

- **HTML Injection**: Be careful with triple-brace syntax `{{{html}}}` which outputs raw HTML
- **Helper Security**: Custom helpers should validate inputs
- **File System Access**: Template paths should be validated to prevent directory traversal

## Security Updates

Security updates will be published as patch releases and announced through:

- GitHub Security Advisories
- Release notes
- Email notifications (if you're watching the repository)

Thank you for helping keep next-handlebars secure!
