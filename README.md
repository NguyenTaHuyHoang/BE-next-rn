 # Front-end for Web Application
- Author: Nguyễn Tạ Huy Hoàng
- GitHub: [Ng.thhoang](https://github.com/NguyenTaHuyHoang)

## Overview

- Provides RESTful APIs.
- CRUD users (next.js + nestjs) 
- Implements authentication and authorization using JWT.
- Sending email (in template) with NestJS.

## Technologies
- NestJS
- JWT
- Passport
- DB: MongoDB

## Setting Up and Running at Local
### Configuration
1. Clone the repository:
```
git clone https://github.com/NguyenTaHuyHoang/BE-next-rn.git
```

2. Set up library:
    - Install packages
    ```bash
    npm install
    ```
    
3. Set up env:
    - Create **.env** file, update environment variables.
   ```bash
   PORT=
   MONGODB_URI=

   JWT_SECRET=
   JWT_ACCESS-TOKEN_EXPIRED=

   MAIL_USER=
   MAIL_PASSWORD=
   ```
   
### Run
Run the application use cmd
```bash
npm run dev
```
## Contact
If you have any questions or suggestions, please feel free to contact us at nthh01082002@gmail.com
