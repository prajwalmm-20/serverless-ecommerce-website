// ==========================================
// Amazon Cognito Configuration
// ==========================================

const cognitoDomain =
    "https://ap-south-1u3c2dmote.auth.ap-south-1.amazoncognito.com";

const clientId =
    "54eee6t6021vnp06ksinvr5831";

const redirectUri =
    window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:5500/index.html"
        : "http://prajwal-mm-ecommerce-images.s3-website.ap-south-1.amazonaws.com/";


// ==========================================
// Cognito URLs
// ==========================================

const loginURL =
    `${cognitoDomain}/oauth2/authorize` +
    `?response_type=code` +
    `&client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=openid+email+profile`;

const signupURL =
    `${cognitoDomain}/signup` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=openid+email+profile`;

const logoutURL =
    `${cognitoDomain}/logout` +
    `?client_id=${clientId}` +
    `&logout_uri=${encodeURIComponent(redirectUri)}`;

console.log("Client ID:", clientId);


// ==========================================
// Decode JWT
// ==========================================

function decodeJWT(token) {

    try {

        if (!token) {
            return null;
        }

        const parts = token.split(".");

        if (parts.length !== 3) {
            return null;
        }

        const base64Url = parts[1];

        const base64 =
            base64Url
                .replace(/-/g, "+")
                .replace(/_/g, "/");

        const jsonPayload =
            decodeURIComponent(
                atob(base64)
                    .split("")
                    .map(char =>
                        "%" +
                        ("00" +
                            char.charCodeAt(0).toString(16))
                            .slice(-2)
                    )
                    .join("")
            );

        return JSON.parse(jsonPayload);

    } catch (error) {

        console.error(
            "Unable to decode token:",
            error
        );

        return null;
    }
}


// ==========================================
// Get Logged-In User
// ==========================================

function getLoggedInUser() {

    const idToken =
        localStorage.getItem("idToken");

    if (!idToken) {
        return null;
    }

    const payload =
        decodeJWT(idToken);

    if (!payload) {
        return null;
    }

    return payload;
}


// ==========================================
// Get Current Username
// ==========================================

function getCurrentUsername(
    user = getLoggedInUser()
) {

    if (!user) {
        return null;
    }

    return (
        localStorage.getItem("username") ||
        user["cognito:username"] ||
        user["preferred_username"] ||
        user["email"] ||
        "User"
    );
}


// ==========================================
// Update User Interface
// ==========================================

function updateUserInterface() {

    const user =
        getLoggedInUser();

    console.log(
        "Updating UI. User:",
        user
    );


    // Get elements
    const loginButtons =
        document.querySelectorAll("#loginBtn");

    const signupButtons =
        document.querySelectorAll("#signupBtn");

    const logoutButtons =
        document.querySelectorAll("#logoutBtn");

    const greetings =
        document.querySelectorAll("#userGreeting");

    const userNames =
        document.querySelectorAll("#userName");


    // ==========================================
    // USER NOT LOGGED IN
    // ==========================================

    if (!user) {

        loginButtons.forEach(button => {

            button.hidden = false;

            button.style.setProperty(
                "display",
                "inline-block",
                "important"
            );

        });


        signupButtons.forEach(button => {

            button.hidden = false;

            button.style.setProperty(
                "display",
                "inline-block",
                "important"
            );

        });


        logoutButtons.forEach(button => {

            button.hidden = true;

            button.style.setProperty(
                "display",
                "none",
                "important"
            );

        });


        greetings.forEach(greeting => {

            greeting.hidden = true;

            greeting.style.setProperty(
                "display",
                "none",
                "important"
            );

        });


        return;
    }


    // ==========================================
    // USER IS LOGGED IN
    // ==========================================

    const username =
        getCurrentUsername(user);

    console.log(
        "Logged in as:",
        username
    );


    // ==========================================
    // HIDE LOGIN
    // ==========================================

    loginButtons.forEach(button => {

        button.hidden = true;

        button.style.setProperty(
            "display",
            "none",
            "important"
        );

    });


    // ==========================================
    // HIDE SIGN UP
    // ==========================================

    signupButtons.forEach(button => {

        button.hidden = true;

        button.style.setProperty(
            "display",
            "none",
            "important"
        );

    });


    // ==========================================
    // SHOW LOGOUT
    // ==========================================

    logoutButtons.forEach(button => {

        button.hidden = false;

        button.style.setProperty(
            "display",
            "inline-block",
            "important"
        );

    });


    // ==========================================
    // SHOW GREETING
    // ==========================================

    greetings.forEach(greeting => {

        greeting.hidden = false;

        greeting.style.setProperty(
            "display",
            "inline-block",
            "important"
        );

    });


    // ==========================================
    // SHOW USERNAME
    // ==========================================

    userNames.forEach(element => {

        element.textContent =
            username;

    });


    console.log(
        "Login and Sign Up hidden successfully."
    );
}


// ==========================================
// Handle Cognito Callback
// ==========================================

async function handleCognitoCallback() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const code =
        params.get("code");

    const error =
        params.get("error");


    // ==========================================
    // Authentication Error
    // ==========================================

    if (error) {

        console.error(
            "Cognito authentication error:",
            error,
            params.get("error_description")
        );

        alert(
            params.get("error_description") ||
            "Authentication failed."
        );

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

        updateUserInterface();

        return;
    }


    // ==========================================
    // No Authorization Code
    // ==========================================

    if (!code) {

        updateUserInterface();

        return;
    }


    console.log(
        "Cognito authorization code received"
    );


    try {

        // ==========================================
        // Exchange Code For Tokens
        // ==========================================

        const tokenResponse =
            await fetch(
                `${cognitoDomain}/oauth2/token`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    },

                    body:
                        new URLSearchParams({

                            grant_type:
                                "authorization_code",

                            client_id:
                                clientId,

                            code:
                                code,

                            redirect_uri:
                                redirectUri
                        })
                }
            );


        const tokens =
            await tokenResponse.json();


        // ==========================================
        // Token Exchange Failed
        // ==========================================

        if (!tokenResponse.ok) {

            console.error(
                "Token exchange failed:",
                tokens
            );

            alert(
                "Login failed. Please try again."
            );

            updateUserInterface();

            return;
        }


        console.log(
            "Cognito login successful"
        );


        // ==========================================
        // Save Tokens
        // ==========================================

        if (tokens.access_token) {

            localStorage.setItem(
                "accessToken",
                tokens.access_token
            );
        }


        if (tokens.id_token) {

            localStorage.setItem(
                "idToken",
                tokens.id_token
            );
        }


        if (tokens.refresh_token) {

            localStorage.setItem(
                "refreshToken",
                tokens.refresh_token
            );
        }


        // ==========================================
        // Decode ID Token
        // ==========================================

        const payload =
            decodeJWT(tokens.id_token);


        if (!payload) {

            throw new Error(
                "Invalid ID token."
            );
        }


        console.log(
            "Logged-in user:",
            payload
        );


        // ==========================================
        // Get Username
        // ==========================================

        const username =
            payload["cognito:username"] ||
            payload["preferred_username"] ||
            payload["email"] ||
            "User";


        // ==========================================
        // Get Email
        // ==========================================

        const email =
            payload["email"] ||
            "";


        // ==========================================
        // Save User Information
        // ==========================================

        localStorage.setItem(
            "username",
            username
        );

        localStorage.setItem(
            "email",
            email
        );


        // ==========================================
        // Get Cognito Groups
        // ==========================================

        const groups =
            payload["cognito:groups"] || [];

        console.log(
            "User groups:",
            groups
        );


        // ==========================================
        // ADMIN USER
        // ==========================================

        if (groups.includes("Admin")) {

            console.log(
                "Admin user detected"
            );

            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            );

            window.location.href =
                "admin.html";

            return;
        }


        // ==========================================
        // NORMAL USER
        // ==========================================

        console.log(
            "Normal user detected"
        );


        // Remove ?code= from URL
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );


        // ==========================================
        // Update UI
        // ==========================================

        updateUserInterface();


        // ==========================================
        // Success Message
        // ==========================================

        showLoginSuccess(
            username
        );

    } catch (error) {

        console.error(
            "Authentication error:",
            error
        );

        alert(
            "Unable to complete login."
        );

        updateUserInterface();
    }
}


// ==========================================
// Login Success Message
// ==========================================

function showLoginSuccess(username) {

    let message =
        document.getElementById(
            "loginSuccessMessage"
        );


    if (!message) {

        message =
            document.createElement("div");

        message.id =
            "loginSuccessMessage";

        message.style.position =
            "fixed";

        message.style.top =
            "20px";

        message.style.right =
            "20px";

        message.style.padding =
            "14px 22px";

        message.style.background =
            "#16a34a";

        message.style.color =
            "white";

        message.style.borderRadius =
            "8px";

        message.style.fontWeight =
            "600";

        message.style.zIndex =
            "9999";

        document.body.appendChild(
            message
        );
    }


    message.textContent =
        `Welcome back, ${username}! 👋`;

    message.style.display =
        "block";


    setTimeout(() => {

        message.style.display =
            "none";

    }, 3000);
}


// ==========================================
// Logout
// ==========================================

function logoutUser() {

    console.log(
        "Logging out..."
    );


    // Remove local authentication data
    localStorage.removeItem(
        "accessToken"
    );

    localStorage.removeItem(
        "idToken"
    );

    localStorage.removeItem(
        "refreshToken"
    );

    localStorage.removeItem(
        "username"
    );

    localStorage.removeItem(
        "email"
    );


    // Redirect to Cognito logout
    window.location.href =
        logoutURL;
}


// ==========================================
// Initialize Authentication
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Authentication system initialized"
        );


        // ==========================================
        // Get Buttons
        // ==========================================

        const loginBtn =
            document.getElementById(
                "loginBtn"
            );

        const signupBtn =
            document.getElementById(
                "signupBtn"
            );

        const logoutBtn =
            document.getElementById(
                "logoutBtn"
            );


        // ==========================================
        // Login Button
        // ==========================================

        if (loginBtn) {

            loginBtn.addEventListener(
                "click",
                () => {

                    console.log(
                        "Login button clicked"
                    );

                    window.location.href =
                        loginURL;

                }
            );
        }


        // ==========================================
        // Sign Up Button
        // ==========================================

        if (signupBtn) {

            signupBtn.addEventListener(
                "click",
                () => {

                    console.log(
                        "Sign Up button clicked"
                    );

                    window.location.href =
                        signupURL;

                }
            );
        }


        // ==========================================
        // Logout Button
        // ==========================================

        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                logoutUser
            );
        }


        // ==========================================
        // Check Existing Login
        // ==========================================

        updateUserInterface();


        // ==========================================
        // Handle Cognito Callback
        // ==========================================

        handleCognitoCallback();

    }
);