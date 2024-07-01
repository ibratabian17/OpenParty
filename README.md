# OpenParty

OpenParty is a replacement server code for the Just Dance Unlimited server.

## About

This project is an effort by ibratabian17 to provide an alternative server to Just Dance Unlimited. With OpenParty, you can enjoy the JDU experience without relying on official servers. (they killed it, so disappointing)

100% handmade legit, At least better than JDParty.

## Usage

1. Clone my repository:
    ```bash
    git clone https://github.com/ibratabian17/openparty.git
    cd openparty
    npm i
    ```

2. Run the server:
    ```bash
    pm2 start server.js --name server --no-daemon
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
- **Purpose**: Overrides default settings and data.
- **Description**: The `SaveData` directory is used to store user-specific or modified versions of the data files and settings. If a file exists in this directory, it will automatically override the corresponding file in the `database` directory. This hierarchical file structure allows users to make changes to configurations, song lists, and other settings without touching the core server code. They can simply reload the server to apply changes, enhancing flexibility and user control.

In summary, the directory structure and the layered data in OpenParty make it easy for users to customize and manage the server. By placing custom files in the `SaveData` directory, users can override default settings and data provided by the server, ensuring that modifications are both simple and reversible.

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