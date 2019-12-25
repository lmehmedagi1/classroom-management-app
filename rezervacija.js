var element = document.getElementsByClassName("meni"); 
if (element.length > 0) {
    Pozivi.ucitajPodatkeSaServera("/zauzeca.json");
}

function rezervisiPeriodicno(periodicno) {
    Pozivi.upisiNovoPeriodicnoZauzece(periodicno);
}
 
function rezervisiVanredno(vanredno) {
    Pozivi.upisiNovoVanrednoZauzece(vanredno);
}

function ucitajZauzeca() {
    Pozivi.ucitajPodatkeSaServera("/zauzeca.json");
}