# OpenParty Admin Panel Plugin

## Overview
Secure web-based administration interface for OpenParty server management. Features a modern dark theme UI and comprehensive server management capabilities.

## Features
- Secure session-based authentication
- Server status monitoring
- Plugin management
- Savedata modification and Git integration
- Automated backups
- Update management
- Maintenance mode control
- Server logs viewer

## Installation
1. Install dependencies:
```bash
cd plugins/panel
npm install
```

2. Add the plugin to `settings.json`:
```json
{
  "modules": [
    {
      "name": "AdminPanelPlugin",
      "description": "Secure admin panel for server management",
      "path": "{dirname}/plugins/AdminPanelPlugin.js",
      "execution": "init"
    }
  ]
}
```

3. Set environment variables (optional):
- `SESSION_SECRET`: Custom session secret (default: 'openparty-secure-session')
- `ADMIN_PASSWORD`: Admin password (default: 'admin123')

## Security
- Session-based authentication
- Password hashing with bcrypt
- HTTPS-only cookie security
- Session expiration

## Usage
1. Access the panel at: `https://your-server/panel`
2. Login with admin credentials
3. Use the dashboard to manage:
   - Server status and statistics
   - Plugin management
   - Savedata modifications
   - Backup management
   - Server updates
   - Maintenance mode
   - Server logs

## Automated Features
- Daily automated backups
- Git integration for savedata changes
- Plugin hot-reloading
- Server update management

## Development
The panel uses a modern tech stack:
- Express.js for backend
- SQLite for session storage
- Modern CSS with dark theme
- Responsive design
- Vanilla JavaScript for frontend interactions