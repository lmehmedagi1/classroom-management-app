var element = document.getElementsByClassName("meni"); 
if (element.length > 0) {
    Pozivi.ucitajRezervacijeOsoba();
}

setInterval( Pozivi.ucitajRezervacijeOsoba, 30000 );