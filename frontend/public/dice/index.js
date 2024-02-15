var randomNumber1 = Math.floor(Math.random() * (6)) + 1;
var randomNumber2 = Math.floor(Math.random() * (6)) + 1;

var srcName = document.getElementsByClassName("img1")[0].getAttribute("src");
var newSrc1 = srcName.replace(/\d+/, randomNumber1);
var newSrc2 = srcName.replace(/\d+/, randomNumber2);

document.getElementsByClassName("img1")[0].setAttribute("src", newSrc1);
document.getElementsByClassName("img2")[0].setAttribute("src", newSrc2);

if (randomNumber1 > randomNumber2){
    document.querySelector("h1").innerText = "🚩Player 1 Wins";
}
else if ( randomNumber1 < randomNumber2){
    document.querySelector("h1").innerText = "Player 2 Wins🚩";
}
else{
    document.querySelector("h1").innerText = "Draw!";
}