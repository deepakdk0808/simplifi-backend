<h3>Overview</h3>
This backend service provides functionality for OTP (One-Time Password) generation and verification. It allows users to request an OTP for their registered mobile number and verifies the OTP submitted by the user.

<h3>Features</h3>
Send OTP: Generate and send an OTP to a specified mobile number.
Verify OTP: Verify the OTP entered by the user against the generated OTP.
Rate Limiting: Limits the number of OTP requests and invalid attempts to prevent abuse.

<h3>Technologies Used</h3>
Node.js: Runtime for building the backend service.
Express.js: Framework for building the API endpoints.
Mongoose: ODM library for interacting with MongoDB.
Twilio: Service for sending OTP messages via SMS.

<h3>API Endpoints</h3>
1.Send OTP
POST /users/sendOTP

2.Verify OTP
POST /users/verifyOTP

Deployed on Railway.
