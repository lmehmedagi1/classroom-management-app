var element = document.getElementsByClassName("meni"); 
if (element.length > 0) {
    console.log("Ovdje svaki put upitnik");
    Pozivi.ucitajOsoblja();
    Pozivi.ucitajPodatkeSaServera("/zauzeca");
}

function rezervisiPeriodicno(periodicno) {
    Pozivi.upisiNovoPeriodicnoZauzece(periodicno);
}
 
function rezervisiVanredno(vanredno) {
    Pozivi.upisiNovoVanrednoZauzece(vanredno);
}

function ucitajZauzeca() {
    Pozivi.ucitajPodatkeSaServera("/zauzeca");
}