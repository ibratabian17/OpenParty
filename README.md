# OpenParty

OpenParty is a community-driven project developed by ibratabian17 as an alternative server solution for Just Dance Unlimited enthusiasts. This server allows you to enjoy the Just Dance Unlimited experience independently of official servers, which are no longer available.

## About

This initiative aims to fill the void left by the discontinued official service, offering a reliable and enhanced alternative. OpenParty is crafted entirely from scratch, ensuring transparency and user trust. It strives to provide a seamless experience comparable to or even better than existing solutions like JDParty.

## Features

- **Independence**: Enjoy Just Dance Unlimited without reliance on official servers (not 100% yet).
- **Community-Driven**: Developed with contributions from the community, ensuring continuous improvement.
- **Multi-platform**: This project supports various platforms such as PC, Switch, PS4, Xbox One (duh), Wii U

## Installation

### Prerequisites

- Node.js
- Git
- Server (duh, we can't pay it)
- Just Dance Certificate (Optional) (For PS4, JD17-18,JD19-22 for NX, ?? for Wii U)
- 

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ibratabian17/openparty.git
   cd openparty
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   pm2 start server.js --name openparty-server --no-daemon
   ```

## Directory Structure

The directory structure of OpenParty is organized to facilitate ease of access and modification of the server's functionalities and data. Here's a detailed breakdown:

### `database/Platforms/openparty-all/songdbs.json`
- **Purpose**: Contains the song database.
- **Description**: This JSON file holds the list of songs available on the server. Users can edit this file to customize the song list without changing the server code. If a song list is found in the `SaveData`, it will override this file, allowing dynamic changes without needing to restart the server.

### `database/nohud/chunk.json`
- **Purpose**: Contains no-HUD Videos.
- **Description**: This JSON file manages the HUD-less video of the game. Similar to the song database, if a configuration file is in `SaveData`, it will take precedence over this file, making it easy to quickly adjust settings.

### `database/Platforms/jd2017-{Platform}/sku-packages.json`
- **Purpose**: Contains SKU packages.
- **Description**: This directory includes platform-specific SKU packages, which are bundles of songs and content specific to a version or platform of Just Dance. These can be tailored to suit different platforms such as PC, Xbox, or PlayStation. The platform-specific files in the `SaveData` directory will override these if available, providing an easy way to customize content per platform without altering the base server files.

### SaveData Directory
- **Purpose**: Save server data, you can also change default settings and data.
- **Description**: The `SaveData` directory is used to save user-specific or modified versions of data files and settings and also stores data owned by the server. If there is a Platforms folder and a nohud folder, this will replace the data from `database` without touching the core server code. This helps you update code without breaking Git

## Configuration of settings.json

You can configure the server with the `settings.json` file as follows:

### SaveData
Defines the paths where the server will save data for different operating systems.
- `"windows": "{Home}\\AppData\\Roaming\\openparty\\"`: Specifies the directory for Windows.
- `"linux": "{Home}/.openparty/"`: Specifies the directory for Linux and other non-Windows systems.

### Port
- `"port": 80`: Sets the port for the server to listen on. Default is 80.

### ForcePort
- `"forcePort": false`: Forces the server to use port 80 even if the OS assigns a different port. If set to true, it will always use port 80.

### Public Access
- `"isPublic": true`: If set to true, the server is accessible publicly (0.0.0.0). If false, it's only accessible locally (127.0.0.1).

### Enable SSL
- `"enableSSL": true`: Enables SSL (HTTPS) if the server supports it. Set to true to enable.

### Domain
- `"domain": "jdp.justdancenext.xyz"`: Specifies the domain name for the server.

### Server Status
- `"serverstatus": { "isMaintenance": false, "channel": "prod" }`: Indicates whether the server is in maintenance mode and specifies the server channel. 
  - `"isMaintenance": false`: Server is not in maintenance mode.
  - `"channel": "prod"`: Specifies the server channel, here set to "prod" (production).

### Encryption
- `"encryption": { "secretKey": "OpenParty.", "userEncrypt": "DoNotShareThisFileToAnyone" }`: Encryption settings for the server.
  - `"secretKey": "OpenParty."`: Secret key used to generate HMAC.
  - `"userEncrypt": "DoNotShareThisFileToAnyone"`: Encryption key used for user data files. if the value is empty then the files are not encrypted.

## Credit

- Wodson - JDCosmos Code
- Rama - His Leaked JDU Code 
- Devvie - JDO Code
- Connor - JDWorld Code
- Mfadamo - Helped with JDU
- alexandregreff - JDU code
- XFelixBlack - JDU Code