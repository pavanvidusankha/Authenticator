$(document).ready(function(){

    //client credentials
    var redirect_url="http://localhost:3000/";
    var scope="https://www.googleapis.com/auth/drive";
    var client_id="324245954010-cg4kac8mhvkljf1p9sm4gj8k9d1cgt87.apps.googleusercontent.com";
    
    $("#loginBtn").click(()=>{

        //redirect to oauth screen
        window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?redirect_uri="+redirect_url
        +"&prompt=consent&response_type=code&client_id="+client_id+"&scope="+scope
        +"&access_type=offline";

    })


});