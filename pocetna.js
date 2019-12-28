var slike = [];
var nove = "";
var trenutneSlike = 0;
var slikeNaStranici = "";

nove = Pozivi.dohvatiSlike(trenutneSlike);
document.getElementById("prethodni").disabled = true;

function azurirajSlike(nove) {
    let parts = nove.split('<div>');
    slikeNaStranici = "";

    console.log("\n\n *** Parts: " + parts);

    for (let i = 1; i<parts.length; i++) {
        console.log("\n Part " + i + parts[i]);
        if (trenutneSlike+i-1 < slike.length)
            slike[trenutneSlike+i-1] = ("<div>" + parts[i]);
        else
            slike.push(("<div>" + parts[i]));
    }

    console.log("\n *** Slike: " + slike);

    for (let i = trenutneSlike; i < slike.length && i < trenutneSlike + 3; i++) {
        slikeNaStranici += slike[i];
    }

    document.getElementById("sadrzaj").innerHTML = slikeNaStranici;
}


// Triggeri kada se promijeni neka od vrijednosti
document.getElementById("prethodni").addEventListener("click", function () {
   
    trenutneSlike -= 3;
    if (trenutneSlike === 0) {
        document.getElementById("prethodni").disabled = true;
    }
    document.getElementById("sljedeci").disabled = false;

    slikeNaStranici = "";

    for (let i = trenutneSlike; i < slike.length && i < trenutneSlike + 3; i++) {
        slikeNaStranici += slike[i];
    }
    document.getElementById("sadrzaj").innerHTML = slikeNaStranici;
});

document.getElementById("sljedeci").addEventListener("click", function () {

    trenutneSlike += 3;
    slikeNaStranici = "";
    document.getElementById("prethodni").disabled = false;

    if (trenutneSlike < slike.length-3) {
        for (let i = trenutneSlike; i < slike.length && i < trenutneSlike + 3; i++) {
            slikeNaStranici += slike[i];
        }
        document.getElementById("sadrzaj").innerHTML = slikeNaStranici;
    }
    else {
        Pozivi.dohvatiSlike(trenutneSlike);
    }
});