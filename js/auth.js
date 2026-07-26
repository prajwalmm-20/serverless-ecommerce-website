
// Amazon Cognito Configuration


const cognitoDomain =
    "https://ap-south-1u3c2dmote.auth.ap-south-1.amazoncognito.com";

const clientId =
    "54eee6t6021vnp06ksinvr5831";

// Change this while developing locally.
// Later we'll switch to CloudFront.

const redirectUri =
    "http://127.0.0.1:5500/html/index.html";

// OAuth URL

const loginURL =
`${cognitoDomain}/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid+email+profile`;

const signupURL =
`${cognitoDomain}/signup?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid+email+profile`;

const logoutURL =
`${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(redirectUri)}`;

console.log(loginURL);

console.log("Client ID:", clientId);
console.log("Login URL:", loginURL);


// Wait until page loads


document.addEventListener("DOMContentLoaded", () => {

    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    // Login

    if(loginBtn){

        loginBtn.addEventListener("click", () => {

            window.location.href = loginURL;

        });

    }

    // Signup

    if(signupBtn){

        signupBtn.addEventListener("click", () => {

            window.location.href = signupURL;

        });

    }

    // Logout

    if(logoutBtn){

        logoutBtn.addEventListener("click", () => {

            localStorage.clear();

            window.location.href = logoutURL;

        });

    }

});