# OpenParty

OpenParty is a community-driven project developed by PartyTeam and LunarTeam, which offers an alternative server solution for enthusiasts of Just Dance Unlimited. This server enables an independent Just Dance Unlimited experience, as official servers are no longer operational.

## About

This initiative addresses the void left by the discontinuation of the official service, providing a robust and enhanced alternative. OpenParty has been developed entirely from scratch, ensuring comprehensive transparency and fostering user confidence. The project aims to deliver a seamless user experience comparable to, or potentially surpassing, existing solutions such as JDParty.

## Features

* **Independence**: The system provides Just Dance Unlimited functionality without reliance on official servers; its current level of independence is approximately 90%.

* **Community-Driven Development**: The project's evolution is propelled by contributions from the community, thereby ensuring continuous enhancement and expansion of its capabilities.

* **Multi-platform Compatibility**: OpenParty supports a diverse range of platforms, including personal computers (PC), Nintendo Switch, PlayStation 4, Xbox One, and Wii U.

## Installation

### Prerequisites

* Node.js

* Git

* Server Hosting Environment

* Just Dance Certificate (Optional): This certificate is required for specific platforms, such as PlayStation 4, Just Dance 2017-2022 for Nintendo Switch (NX), and Just Dance 2016-2018 for Wii U.

### Setup Procedure

1. **Repository Cloning**:

   ```
   git clone [https://github.com/ibratabian17/openparty.git](https://github.com/ibratabian17/openparty.git)
   cd openparty
   ```

2. **Dependency Installation**:

   ```
   npm install
   ```

3. **Server Initialization**:

   ```
   pm2 start server.js --name openparty-server --no-daemon
   ```

## Directory Structure

The OpenParty directory structure is organized to optimize access and facilitate modifications to server functionalities and data. A detailed overview is provided below:

* ### `database/Platforms/openparty-all/songdbs.json`

  * **Purpose**: This file contains the primary song database.

  * **Description**: This JSON file enumerates all songs available on the server. Users can modify this file to customize the song list without altering to the core server code. Should a song list be present within the `SaveData` directory, it will supersede the contents of this file, thereby enabling dynamic updates without requiring a server restart.

* ### `database/nohud/chunk.json`

  * **Purpose**: This file contains configurations for no-HUD video content.

  * **Description**: This JSON file manages the configuration settings for game videos that do not display the Heads-Up Display (HUD). Similar to the song database, if a configuration file is present in `SaveData`, it will take precedence, enabling rapid adjustments.

* ### `database/Platforms/jd2017-{Platform}/sku-packages.json`

  * **Purpose**: This directory contains Stock Keeping Unit (SKU) packages.

  * **Description**: This directory encompasses platform-specific SKU packages, which are collections of songs and content curated for a particular version or platform of Just Dance. These packages can be tailored to suit various platforms, including PC, Xbox, or PlayStation. Platform-specific files located within the `SaveData` directory will override these default packages if available, providing a flexible methodology for content customization per platform without modifying the foundational server files.

* ### `core/scripts/run.js`

  * **Purpose**: This script manages the primary server process, including logging operations and automatic restarts.

  * **Description**: This file now integrates the `ProcessManager` class, which is responsible for initiating the `server.js` process, capturing its standard output and error streams, logging pertinent information to `database/tmp/logs.txt`, and automatically restarting the server if it terminates with a specific exit code (e.g., `42`). Furthermore, it incorporates mechanisms for graceful shutdown in response to `SIGINT` and `SIGTERM` signals. This architectural refinement significantly enhances the server's stability and facilitates improved observability.

* ### `database/encryption.json`

  * **Purpose**: This file contains encryption settings.

  * **Description**: This JSON file stores the server's encryption parameters, including cryptographic keys used for HMAC generation and user data encryption.

* ### `SaveData` Directory

  * **Purpose**: This directory serves to store server data and enables the overriding of default settings and data.

  * **Description**: The `SaveData` directory is employed for preserving user-specific or modified versions of data files and configuration settings, in addition to housing server-owned data. If a `Platforms` folder or a `nohud` folder exists within `SaveData`, their respective contents will supersede the corresponding data residing in the `database` directory, thereby eliminating the need for modifications to the core server code. This approach streamlines code updates while preserving Git integrity.

## Configuration of `settings.json`

The server's operational parameters can be configured through the `settings.json` file, which includes the following key elements:

* ### `SaveData`

  * **Description**: This parameter defines the file paths where the server will persist data across different operating systems.

  * **Settings**:

    * `"windows": "{Home}\\AppData\\Roaming\\openparty\\"`: Specifies the designated directory for Windows operating systems.

    * `"linux": "{Home}/.openparty/"`: Specifies the designated directory for Linux and other non-Windows operating systems.

* ### `Port`

  * **Description**: This parameter sets the network port on which the server will actively listen for incoming connections.

  * **Settings**: `"port": 80` (Default value: 80).

* ### `ForcePort`

  * **Description**: This parameter ensures the server uses the specified port, even if the operating system attempts to assign an alternative.

  * **Settings**: `"forcePort": false` (If set to `true`, the server will consistently employ port 80).

* ### `Public Access`

  * **Description**: This parameter determines the server's accessibility to external networks.

  * **Settings**: `"isPublic": true` (If set to `true`, the server is publicly accessible via `0.0.0.0`; if `false`, access is restricted to the local machine via `127.0.0.1`).

* ### `Enable SSL`

  * **Description**: This parameter activates Secure Sockets Layer (SSL) functionality, enabling HTTPS if supported by the server environment.

  * **Settings**: `"enableSSL": true` (Set to `true` to enable SSL).

* ### `Domain`

  * **Description**: This parameter specifies the fully qualified domain name for the server.

  * **Settings**: `"domain": "jdp.justdancenext.xyz"`.

* ### `Server Status`

  * **Description**: This parameter indicates whether the server is currently in maintenance mode and defines its operational channel.

  * **Settings**:

    * `"isMaintenance": false`: Indicates that the server is not currently undergoing maintenance.

    * `"channel": "prod"`: Specifies the server's operational channel (e.g., "prod" for production).

* ### `Modules`

  * **Description**: This parameter defines server modules, encompassing their designated names, descriptive summaries, file paths, and triggers for execution.

  * **Settings**:

    * `"name": ""`: The assigned name of the module.

    * `"description": ""`: A concise description outlining the module's functionality.

    * `"path": ""`: The file path from which the server invokes the module.

    * `"execution": ""`: Specifies the phase during which the server will execute the module (`pre-load` or `init`).

  * **Note**: Legacy OpenParty modules are not directly compatible with the current codebase. They require modification to conform to the new OpenParty Plugin format. Reference examples of the updated plugin format are available within the `plugins/` directory.

## Usage

OpenParty provides a streamlined setup procedure designed for rapid deployment. Upon successful installation, the server's behavior can be customized through the `settings.json` file, and song databases can be managed with efficiency.

## Contribution

Contributions are actively encouraged to enhance existing features, improve system performance, or expand platform compatibility. Prospective contributors are advised to consult the GitHub repository for detailed guidelines.

## Support

For addressing technical issues or submitting inquiries, users are encouraged to utilize the GitHub Issues platform or engage with community channels.

## Credits

We acknowledge the invaluable contributions of the following individuals instrumental in the development and success of OpenParty: Wodson (JDCosmos Code), Rama (leaked JDU Code), Devvie (JDO Code), Connor (JDWorld Code), and Mfadamo (JDU assistance). Special commendation is given to alexandregreff and XFelixBlack (JDU code contributions), JJRoyale (JD19-22 back-end assistance), JustRex (Ubiserver logging), klucva (general assistance and support), adrian_flopper (the inaugural back-end developer), and nic (various corrective measures and enhancements).

Their collective endeavors have been pivotal in shaping the current state of OpenParty.

## To Do List

The following features are planned for future development:

1. **Built-in Administrative Panel**: Implementation of a web-based administrative interface to facilitate simplified server management.

2. **Dynamic Reloading of SongDB & SKUPackages**: Introduction of functionality enabling the dynamic reloading of song databases and SKU packages without requiring a server restart.

3. **User Ban Capability**: Addition of a feature allowing administrators to ban users from the server.

4. **Rectification of JD16, JD18-22 Ubiservices Route Path for NX**: Resolution of routing discrepancies pertaining to Ubiservices on Nintendo Switch for Just Dance 2016 and versions 2018-2022.

5. **Correction of JD2018_MAIN - JD2022_MAIN Branch Issues from Just Dance Engine**: Addressing and resolving identified issues within the main branches of the Just Dance engine for versions 2018-2022.

6. **Reinstatement of Missing OpenParty Features**: Reintroduction of previously available functionalities that are currently absent from the system.

7. **Additional Features**: Continuous exploration and implementation of further functionalities to augment the OpenParty experience.

## Support This Project

Saweria: <https://saweria.co/ibraaltabian17>
Patreon: <https://www.patreon.com/ibratabian17>