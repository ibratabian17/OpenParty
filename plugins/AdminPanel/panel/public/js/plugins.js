// Plugin management functionality
async function loadPlugins() {
    try {
        const response = await fetch('/panel/api/plugins');
        const plugins = await response.json();
        const pluginsList = document.getElementById('pluginsList');
        pluginsList.innerHTML = plugins.map(plugin => `
            <tr class="plugin-row ${plugin.enabled ? 'plugin-enabled' : 'plugin-disabled'}">
                <td class="plugin-name">${plugin.name}</td>
                <td class="plugin-description">${plugin.description || 'No description available.'}</td>
                <td class="plugin-status">
                    <span class="badge ${plugin.enabled ? 'bg-success' : 'bg-secondary'}">
                        <!-- Example using Font Awesome icons: replace with your icon library or remove if not using icons -->
                        <!-- <i class="fas ${plugin.enabled ? 'fa-check-circle' : 'fa-times-circle'}"></i> -->
                        ${plugin.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                </td>
                <td class="plugin-actions">
                    <button 
                        class="btn btn-sm ${plugin.enabled ? 'btn-outline-warning' : 'btn-outline-success'}" 
                        onclick="togglePlugin('${plugin.name}')"
                        title="${plugin.enabled ? 'Disable' : 'Enable'} ${plugin.name}">
                        <!-- Example using Font Awesome icons: replace with your icon library or remove if not using icons -->
                        <!-- <i class="fas ${plugin.enabled ? 'fa-toggle-off' : 'fa-toggle-on'}"></i> -->
                        ${plugin.enabled ? 'Disable' : 'Enable'}
                    </button>
                </td>
            </tr>
        `).join('');
        /* 
        Suggested CSS for the new classes (add to your panel's CSS file):
        .plugin-row.plugin-disabled { opacity: 0.7; }
        .plugin-name { font-weight: bold; }
        .badge { padding: 0.4em 0.6em; font-size: 0.9em; }
        .bg-success { background-color: #28a745; color: white; }
        .bg-secondary { background-color: #6c757d; color: white; }
        .btn-sm { padding: 0.25rem 0.5rem; font-size: .875rem; }
        .btn-outline-warning { border-color: #ffc107; color: #ffc107; }
        .btn-outline-warning:hover { background-color: #ffc107; color: #212529; }
        .btn-outline-success { border-color: #28a745; color: #28a745; }
        .btn-outline-success:hover { background-color: #28a745; color: white; }
        */
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function togglePlugin(pluginName) {
    try {
        const response = await fetch('/panel/api/plugins/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pluginName })
        });
        const result = await response.json();
        showToast(result.message);
        loadPlugins(); // Refresh the plugins list
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Load plugins when the plugins section is shown
document.querySelector('[onclick="showSection(\'plugins\')"]')
    .addEventListener('click', loadPlugins);