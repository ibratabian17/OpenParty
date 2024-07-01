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

- **database/Platforms/openparty-all/songdbs.json**: contains the song database.
- **database/nohud/chunk.json**: contains no-HUD configuration.
- **database/Platforms/jd2017-{Platform}/**: contains sku packages.

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