# Project: ChessGame 
## Step to run the app locally use following commands:

- Run the Docker Compose
  
    Get the env variable in backend folder(Sent to you by mail)
  
    Here are variable examples
  
    ```console
    PORT=3000
  
    GOOGLE_CLIENT_ID= your_id.com

    GOOGLE_CLIENT_SECRET= your_secret_key

    SECRET_KEY_JWT= your_key

    CORS_ORIGIN=http://localhost

    DATABASE_USER= your_database_user_name

    DATABASE_PASSWORD= your_password

    DATABASE_NAME= database_name

    DATABASE_SERVER= project2650.database.windows.net

     DATABASE_TRUST_SERVER_CERTIFICATE=no

 ```

  ```console
  cd 2650Project
  $ docker-compose up -d
 
  ```

- Go to http://localhost
- 
## Features

- _Frontend_ written in React
- _Backend_ written in React
- _Database_ used MySQL
- In-memory database _Redis_ to the Backend
- _oAuth_ Google authenication

   
## Whats is not working: 

We need to purchase domain  name for google authenication ,so google authentication is not avaiable for pulic hosting.However, it is working fine locally.

## Public URL

http://3.12.166.13/

## Complete Project Screenshot

![Project Diagram](https://github.com/harpreet1o/2650Project/blob/main/FinalProjectDiagram.drawio.png)
