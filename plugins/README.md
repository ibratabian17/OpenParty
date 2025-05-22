# OpenParty Plugin System

This directory contains plugins for the OpenParty server. Plugins are a way to extend the functionality of the server without modifying the core codebase.

## Creating a Plugin

To create a plugin, you need to create a new JavaScript file that exports an instance of a class that extends the `Plugin` class. Here's a basic example:

```javascript
const Plugin = require('../core/classes/Plugin');

class MyPlugin extends Plugin {
  constructor() {
    super('MyPlugin', 'Description of my plugin');
  }

  initroute(app) {
    // Set up routes and functionality
    app.get('/my-plugin/endpoint', (req, res) => {
      res.send({ message: 'Hello from my plugin!' });
    });
  }
}

module.exports = new MyPlugin();
```

## Registering a Plugin

To register your plugin with the server, you need to add it to the `modules` array in `settings.json`:

```json
"modules": [
  {
    "name": "MyPlugin",
    "description": "Description of my plugin",
    "path": "{dirname}/plugins/MyPlugin.js",
    "execution": "init"
  }
]
```

The `execution` property can be either `"pre-load"` or `"init"`. Plugins with `"pre-load"` execution are initialized before the core routes, while plugins with `"init"` execution are initialized after the core routes.

## Plugin Lifecycle

Plugins have the following lifecycle methods:

- `constructor(name, description)`: Called when the plugin is created
- `initroute(app)`: Called when the plugin is initialized
- `enable()`: Called to enable the plugin
- `disable()`: Called to disable the plugin
- `isEnabled()`: Returns whether the plugin is enabled

## Example Plugins

- `HelloWorldPlugin.js`: A simple example plugin that demonstrates the plugin system

## Best Practices

1. **Keep plugins focused**: Each plugin should have a single responsibility
2. **Use descriptive names**: Plugin names should be descriptive and unique
3. **Document your plugin**: Include a description of what your plugin does
4. **Handle errors gracefully**: Catch and handle errors in your plugin
5. **Clean up resources**: If your plugin uses resources like file handles or database connections, make sure to clean them up when the plugin is disabled