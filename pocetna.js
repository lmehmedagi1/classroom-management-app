var trenutneSlike = 0;
Pozivi.dohvatiSlike("/slike1");
document.getElementById("prethodni").disabled = true;


// Triggeri kada se promijeni neka od vrijednosti
document.getElementById("prethodni").addEventListener("click", function () {
    trenutneSlike = trenutneSlike - 1;
    Pozivi.dohvatiSlike("/slike" + (trenutneSlike + 1));

    if (trenutneSlike === 0) {
        document.getElementById("prethodni").disabled = true;
    }
    if (trenutneSlike === 2) {
        document.getElementById("sljedeci").disabled = false;
    }
});

document.getElementById("sljedeci").addEventListener("click", function () {
    trenutneSlike = trenutneSlike + 1;
    Pozivi.dohvatiSlike("/slike" + (trenutneSlike + 1));

    if (trenutneSlike === 3) {
        document.getElementById("sljedeci").disabled = true;
    }
    if (trenutneSlike === 1) {
        document.getElementById("prethodni").disabled = false;
    }
});