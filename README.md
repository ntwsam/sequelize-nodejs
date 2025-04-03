
# Sequelize-nodejs
Sequelize is an easy-to-use and promise-based **Node.js ORM tool**. This is use sequelize with **MySQL** and use **Redis** to create **CRUD** and use **JWT** ( jsonwebtoken ) , **Bcrypt**
 - use **mysql2** for create database before use **sequelize** if not exists database
 - use **sequelize** to connect **MySQL** and **create and sync table**
 - use **redis** to collect **token** data
 - use **JWT** for generate **refresh token** and **access token** use for representing claims to be transferred between two parties.
 - use **bcrypt** for protect password

## Table of Contents

 - [How to install](##How%20to%20install)
 - [Requirement](##Requirement)
 - [How to run](##How%20to%20run)

## How to install

``` bash
git clone https://github.com/ntwsam/sequelize-nodejs.git
```
## Requirement
- **Node.js**
 - **Postman** or tool for testing HTTP
 - **MySQL**
 - **Visual Studio Code** (VScode) or other IDE
 - **Redis**
 
 ## How to run
 
 1. Run **Redis Client**
	 - if not open it will error when using
 2. Run project with **VSCode**

	 - Open folder this project or Use **Command Prompt** select this project
		 - Click on **File > Open Folder...**  and select this project folder
		 - or Use **Command Prompt**
			``` bash
			cd nodejs-passportjs-session 
			code .
			```
	 - Open **Terminal** in VSCode
		- Click on **Terminal** ( on the top of menu bar)
		- Choose **New Terminal** or use the shortcut`Ctrl + Shift + ~` (Windows) or `Cmd + Shift + ~` (Mac) to oepn a terminal in VSCode.
	 - run this project
		- use `npm start` :
			``` bash
			npm start
			```
		 - use `nodemon run dev` : will automatically restart the server when you make changes to the files.
			``` bash
			nodemon run dev
			```
	- Verify the project
		- after running either `npm start` or `nodemon run dev`, you application will start and you can open your web browser and go to `http://localhost:3000` ( or whatever URL your server run on) to see the result.
3. It will automatically create database and table for using this project
	- **Table example** : password will collect by using **hashedpassword**
		|id|username|email|password|role|
		|--|----|------|-----------|--|
		 | 1| john|john.eddy@example.com| $2b$10$cktcNq.U2zxxNxeejQllguymNxu6TzLY7knDJbOsC5c2uLVhxvw6a | admin
		 | 2| micky| micky_mouse@example.com| $2b$10$cktcNq.A8llyNgdfgDFGRERG54xu6TzLY7knDJbOsC5c2uLcZww7f | user
4. Testing Http with **Postman**
	- **Register**
		-  use `post` and `localhost:3000/register` to get register new user
		- **require request body**
			- username
			- email
			- password
			- role
	- **Login**
		- use `post` and `localhost:3000/login` to logging in user
		- generate **access token** and **refresh token**
		- set **refresh token** in cookie
		- add **refresh token** in **Redis**
		- set **access token** to header "Authorization"
		-  **require request body**
			- username or email
				- use `usernameOrEmail` on request body
			- password
	- **Logout**
		- use `post` and `localhost:3000/logout` to logging out
		- remove **access token** in header "Authorization"
		- add **access token** to blacklisted in **Redis**
		- remove **refresh token** in cookie
		- remove **refresh token** in **Redis**
		- using **authenticate middleware** for checking
	- **Refresh**
		- use `post` and `localhost:3000/refresh` to refresh **access token** and **refresh token** ( rotation )
		- generate **new access token** and **new refresh token**
		- update **new access token** to header "Authorization"
		- update **new refresh token**  in **Redis**
		- using **authenticate middleware** for checking
	- **Protect**
		-  use `get` and `localhost:3000/protect` to check **authentication**
		- using **authenticate middleware** for checking
	- **Admin**
		-  use `get` and `localhost:3000/admin` to check **authentication** and **authorize role**
		- using **authenticate** for check authorization
		- using **authorize role** for check permission role
