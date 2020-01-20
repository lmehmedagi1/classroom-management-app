let Pozivi = (function() {   
    
    // ucitava podatke sa servera u modul Kalendar kad se otvori rezervacije.html
    function ucitajPodatkeSaServeraImpl(zauzeca) {
        var xhttp;
        xhttp=new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                zauzecaJson = JSON.parse(xhttp.responseText);

                periodicna = [];
                vanredna = [];

                for (let i = 0; i < zauzecaJson.length; i++) {

                    x = zauzecaJson[i];

                    let osoba = x.uloga + " " + x.ime + " " + x.prezime;

                    if (x.redovni) 
                        periodicna.push({dan: x.dan, semestar: x.semestar, pocetak: x.pocetak, kraj: x.kraj, naziv: x.naziv, predavac: osoba});
                    else
                        vanredna.push({datum: x.datum, pocetak: x.pocetak, kraj: x.kraj, naziv: x.naziv, predavac: osoba});
                }

                Kalendar.ucitajPodatke(periodicna, vanredna);
            }
        };
        xhttp.open("GET", zauzeca, true);
        xhttp.send();
    }

    // upisuje novo zauzece na server
    function upisiNovoPeriodicnoZauzeceImpl(periodicno) {

        var daniUSedmici = [" svaki ponedjeljak", " svaki utorak", " svaku srijedu", " svaki cetvrtak", " svaki petak", " svaku subotu", " svaku nedjelju"];
        semestarZauzeca = periodicno.semestar[0] === "l" ? "ljetnom" : "zimskom";

        var ajaxPOST = new XMLHttpRequest();
        ajaxPOST.onreadystatechange = function() {
                        
            if (this.readyState == 4 && this.status == 200) {
                zauzecaJson = JSON.parse(ajaxPOST.responseText);
                Kalendar.ucitajPodatke(zauzecaJson.periodicna, zauzecaJson.vanredna);
            }
            else if (this.readyState == 4 && this.status == 400) {
                zauzecaJson = JSON.parse(ajaxPOST.responseText);
                Kalendar.ucitajPodatke(zauzecaJson.periodicna, zauzecaJson.vanredna);
                alert("Nije moguce rezervisati salu " + periodicno.naziv + daniUSedmici[periodicno.dan] + " u " + semestarZauzeca + " semestru i terminu od " + periodicno.pocetak + " do " + periodicno.kraj + "!");
            }
            else if (this.readyState == 4 && this.status == 401) {
                zauzecaJson = JSON.parse(ajaxPOST.responseText);
                osoba = zauzecaJson[1];
                Kalendar.ucitajPodatke(zauzecaJson[0].periodicna, zauzecaJson[0].vanredna);
                alert("Nije moguce rezervisati salu " + periodicno.naziv + daniUSedmici[periodicno.dan] + " u " + semestarZauzeca + " semestru i terminu od " + periodicno.pocetak + " do " + periodicno.kraj + "!" +
                      "\n" + osoba + " je vec zauzeo vanredno termin ovaj dan.");
            }
            else if (this.readyState == 4 && this.status == 402) {
                zauzecaJson = JSON.parse(ajaxPOST.responseText);
                osoba = zauzecaJson[1];
                Kalendar.ucitajPodatke(zauzecaJson[0].periodicna, zauzecaJson[0].vanredna);
                alert("Nije moguce rezervisati salu " + periodicno.naziv + daniUSedmici[periodicno.dan] + " u " + semestarZauzeca + " semestru i terminu od " + periodicno.pocetak + " do " + periodicno.kraj + "!" +
                      " Termin je vec zauzeo " + osoba);
            }
        };
        ajaxPOST.open("POST", "http://localhost:8080/zauzeca-periodicna", true);
        ajaxPOST.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        ajaxPOST.send(JSON.stringify(periodicno));
    }

    function upisiNovoVanrednoZauzeceImpl(vanredno) {

        var ajaxPOST = new XMLHttpRequest();
        ajaxPOST.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                zauzecaJson = JSON.parse(ajaxPOST.responseText);
                Kalendar.ucitajPodatke(zauzecaJson.periodicna, zauzecaJson.vanredna);
            }
            else if (this.readyState == 4 && this.status == 400) {
                zauzecaJson = JSON.parse(ajaxPOST.responseText);
                Kalendar.ucitajPodatke(zauzecaJson.periodicna, zauzecaJson.vanredna);
                alert("Nije moguce rezervisati salu " + vanredno.naziv + " za navedeni datum " + vanredno.datum + " i termin od " + vanredno.pocetak + " do " + vanredno.kraj + "!");
            }
            else if (this.readyState == 4 && this.status == 401) {
                zauzecaJson = JSON.parse(ajaxPOST.responseText);
                osoba = zauzecaJson[1];
                Kalendar.ucitajPodatke(zauzecaJson[0].periodicna, zauzecaJson[0].vanredna);
                alert("Nije moguce rezervisati salu " + vanredno.naziv + " za navedeni datum " + vanredno.datum + " i termin od " + vanredno.pocetak + " do " + vanredno.kraj + "!" +
                      " Termin je vec zauzeo " + osoba);
            }
        };
        ajaxPOST.open("POST", "http://localhost:8080/zauzeca-vanredna", true);
        ajaxPOST.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        ajaxPOST.send(JSON.stringify(vanredno));
    }

    function dohvatiSlikeImpl(trenutna) {

        var xhttpSlike;
        xhttpSlike=new XMLHttpRequest();
        xhttpSlike.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("sljedeci").disabled = false;
                azurirajSlike(xhttpSlike.responseText);
            }
            else if (this.readyState == 4 && this.status == 220) {
                document.getElementById("sljedeci").disabled = true;
                azurirajSlike(xhttpSlike.responseText);
            }
        };
        trenutna = encodeURIComponent(trenutna);
        xhttpSlike.open("GET", "/slike?trenutna=" + trenutna, true);
        xhttpSlike.send();
    }

    function ucitajOsobljaImpl() {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let osobljeJson = JSON.parse(xhttp.responseText);
                let osobljeForm = document.getElementById("listaOsoba");
                let osobljeFormHtml = '';
                let osoba = '';
                for (i in osobljeJson) {
                    osobljeFormHtml += "<option value=Osoba" + i + ">" + osobljeJson[i].uloga + " " + osobljeJson[i].ime + " " + osobljeJson[i].prezime + "</option>";
                    osoba = osobljeJson[i].uloga + " " + osobljeJson[i].ime + " " + osobljeJson[i].prezime;
                }
                osobljeForm.innerHTML = osobljeFormHtml;
                if (osoba != '')
                    Kalendar.spasiOsobu(osobljeJson[0].uloga + " " + osobljeJson[0].ime + " " + osobljeJson[0].prezime);
            }
        };

        xhttp.open("GET", "/osoblje", true);
        xhttp.send();
    }

    function ucitajRezervacijeOsobaImpl() {

        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let podaci = JSON.parse(xhttp.responseText);

                var myTable= "<table id=\"tabelaOsoba\"><tr><th>Uloga</th><th>Ime</th><th>Prezime</th><th>Nalazi se u sali</th></tr>";

                for (let i = 0; i<podaci.length; i++) {
                    let x = podaci[i];
                    myTable += "<tr><td>" + x.uloga + "</td><td>" + x.ime + "</td><td>" + x.prezime + "</td><td>" + x.naziv + "</td></tr>";
                }

                myTable += "</table>";

                document.getElementById("osobe").innerHTML = myTable;
            }
        };

        xhttp.open("GET", "/osobe-i-rezervacije", true);
        xhttp.send();
    }

    return {    
        ucitajPodatkeSaServera: ucitajPodatkeSaServeraImpl,
        upisiNovoVanrednoZauzece: upisiNovoVanrednoZauzeceImpl,
        upisiNovoPeriodicnoZauzece: upisiNovoPeriodicnoZauzeceImpl,
        ucitajOsoblja: ucitajOsobljaImpl,
        dohvatiSlike: dohvatiSlikeImpl,
        ucitajRezervacijeOsoba: ucitajRezervacijeOsobaImpl
    }
}());